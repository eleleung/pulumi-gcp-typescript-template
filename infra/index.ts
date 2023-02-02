import { DatabaseInstance } from '@pulumi/gcp/sql';
import * as pulumi from '@pulumi/pulumi';

import { createCloudSqlInstance, createDatabaseResources } from './cloudsql';
import { uploads } from './gcs';
import { createIamBindings } from './iam';
import { createDbSecret } from './secrets';

export interface Config {
  projectId: string;
  tenantId: string;
  region: string;
}
const config = new pulumi.Config();
const region = config.require('gcp-region');

const sqlInstance = createCloudSqlInstance(region);

function createTenant(tenantConfig: Config, cloudSqlInstanceRef: DatabaseInstance) {
  const dbPassword = createDbSecret(tenantConfig);
  const uploadBucket = uploads(tenantConfig);
  createDatabaseResources(tenantConfig, cloudSqlInstanceRef, dbPassword);
  createIamBindings(tenantConfig, dbPassword, uploadBucket);
}

createTenant(
  {
    projectId: config.require('gcp-project'),
    tenantId: 'claimer',
    region: region,
  },
  sqlInstance
);

export const sqlInstanceId = sqlInstance.id;
