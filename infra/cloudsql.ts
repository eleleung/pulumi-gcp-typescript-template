import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

import { enableServiceNetworkingApi, enableSqlAdminApi, tenantConfig } from './index';
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

export const database = new gcp.sql.Database(`${tenantConfig.tenantId}-database`, {
  name: `${tenantConfig.tenantId}-database`,
  instance: sqlInstance.name,
});

export const vpcConnector = new gcp.vpcaccess.Connector(
  'connector',
  {
    network: privateNetwork.id,
    machineType: 'e2-standard-4',
  },
  { dependsOn: [enableServiceNetworkingApi] }
);
