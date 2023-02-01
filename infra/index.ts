import * as docker from '@pulumi/docker';
import * as gcp from '@pulumi/gcp';
import { DatabaseInstance } from '@pulumi/gcp/sql';
import * as pulumi from '@pulumi/pulumi';
import { create } from 'domain';

import { sqlInstance } from './cloudsql';
import { exampleTopic } from './pubsub/topics';

interface Config {
  projectId: string;
  tenantId: string;
}
const config = new pulumi.Config();

export const tenantConfig = config.requireObject<Config>('data');

export const enableCloudRunApi = new gcp.projects.Service('enable-cloud-run-api', {
  service: 'run.googleapis.com',
});
export const enableIamApi = new gcp.projects.Service('enable-iam-api', {
  service: 'iam.googleapis.com',
});
export const enableCloudResourceManagerApi = new gcp.projects.Service(
  'enable-cloud-resouce-manager-api',
  {
    service: 'cloudresourcemanager.googleapis.com',
  }
);
export const enableSqlAdminApi = new gcp.projects.Service('enable-sql-admin-api', {
  service: 'sqladmin.googleapis.com',
});
export const enableVpcAccessApi = new gcp.projects.Service('enable-vpc-access-api', {
  service: 'vpcaccess.googleapis.com',
});
export const enableServiceNetworkingApi = new gcp.projects.Service(
  'enable-service-networking-api',
  {
    service: 'servicenetworking.googleapis.com',
  }
);

function createTenant(tenantConfig: Config, cloudSqlInstanceRef: DatabaseInstance) {
  // create resources
}

createTenant(tenantConfig, sqlInstance);
