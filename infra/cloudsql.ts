import * as gcp from '@pulumi/gcp';
import { DatabaseInstance } from '@pulumi/gcp/sql';
import { Connector } from '@pulumi/gcp/vpcaccess';

import { enableServiceNetworkingApi, enableSqlAdminApi } from './apis';
import { Config } from './index';
import { DatabasePassword } from './secrets';

export interface CloudSqlResources {
  sqlInstance: DatabaseInstance;
  vpcConnector: Connector;
}

/* 
  The cloud SQL instance should be shared across the tenants within a project, but each tenant will have a separate database
*/
export function createCloudSqlResources(region: string): CloudSqlResources {
  const privateNetwork = new gcp.compute.Network('network', {});

  const privateIpAddress = new gcp.compute.GlobalAddress('db-instance-private-ip-address', {
    purpose: 'VPC_PEERING',
    addressType: 'INTERNAL',
    prefixLength: 16,
    network: privateNetwork.id,
  });

  const privateVpcConnection = new gcp.servicenetworking.Connection(
    'db-instance-private-vpc-connection',
    {
      network: privateNetwork.id,
      service: 'servicenetworking.googleapis.com',
      reservedPeeringRanges: [privateIpAddress.name],
    }
  );

  const vpcConnector = new gcp.vpcaccess.Connector(
    'connector',
    {
      network: privateNetwork.id,
      ipCidrRange: '10.8.0.0/28',
      machineType: 'e2-standard-4',
      region: region,
    },
    { dependsOn: [enableServiceNetworkingApi] }
  );

  return {
    sqlInstance: new gcp.sql.DatabaseInstance(
      'sql-instance',
      {
        region: region,
        databaseVersion: 'POSTGRES_14',
        settings: {
          tier: 'db-f1-micro',
          ipConfiguration: {
            ipv4Enabled: false,
            privateNetwork: privateNetwork.id,
          },
        },
        deletionProtection: false,
      },
      { dependsOn: [privateVpcConnection, enableSqlAdminApi] }
    ),
    vpcConnector,
  };
}

export function createDatabaseResources(
  config: Config,
  sqlInstance: DatabaseInstance,
  dbPassword: DatabasePassword
) {
  const database = new gcp.sql.Database(`${config.tenantId}-database`, {
    name: `${config.tenantId}-database`,
    instance: sqlInstance.name,
  });

  new gcp.sql.User(
    `${config.tenantId}-db-user`,
    {
      instance: sqlInstance.name,
      password: dbPassword.version.secretData,
    },
    { dependsOn: [database] }
  );
}
