import { DatabaseInstance } from '@pulumi/gcp/sql';
import * as pulumi from '@pulumi/pulumi';

import { createDatabaseResources, sqlInstance } from './cloudsql';
import { uploads as createUploads } from './gcs';
import { createIamBindings } from './iam';

export interface Config {
  projectId: string;
  tenantId: string;
}
const config = new pulumi.Config();

export const tenantConfig: Config = {
  projectId: config.require('gcp-project'),
  tenantId: config.require('tenant-id'),
};

function createTenant(tenantConfig: Config, cloudSqlInstanceRef: DatabaseInstance) {
  createDatabaseResources(tenantConfig);
  createUploads(tenantConfig);
  createIamBindings(tenantConfig);
}

createTenant(tenantConfig, sqlInstance);
