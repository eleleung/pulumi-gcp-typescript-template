import * as gcp from '@pulumi/gcp';

import { enableServiceNetworkingApi, enableSqlAdminApi } from './apis';
import { Config, tenantConfig } from './index';
import { location } from './variables';

/* 
  The cloud SQL instance should be shared across the tenants within a project, but each tenant will have a separate database
*/
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

// cloud run service needs to be associated with this vpc connector for db access
export const vpcConnector = new gcp.vpcaccess.Connector(
  'connector',
  {
    network: privateNetwork.id,
    machineType: 'e2-standard-4',
  },
  { dependsOn: [enableServiceNetworkingApi] }
);

export const sqlInstance = new gcp.sql.DatabaseInstance(
  'sql-instance',
  {
    region: location,
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
);

export function createDatabaseResources(config: Config) {
  const database = new gcp.sql.Database(`${config.tenantId}-database`, {
    name: `${config.tenantId}-database`,
    instance: sqlInstance.name,
  });

  const databaseUser = new gcp.sql.User(
    `${config.tenantId}-db-user`,
    {
      instance: sqlInstance.name,
      password: 'password',
    },
    { dependsOn: [database] }
  );
}
