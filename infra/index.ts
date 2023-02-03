import { Service } from '@pulumi/gcp/cloudrun';
import { DatabaseInstance } from '@pulumi/gcp/sql';
import { Bucket } from '@pulumi/gcp/storage';
import * as pulumi from '@pulumi/pulumi';

import { deployCloudRun } from './cloudrun';
import { createCloudSqlInstance, createDatabaseResources } from './cloudsql';
import { uploads } from './gcs';
import { createIamBindings } from './iam';
import { createDbSecret } from './secrets';

export interface Config {
  projectId: string;
  tenantId: string;
  region: string;
}

export interface TenantResources {
  cloudRunService: Service;
  sqlInstance: DatabaseInstance;
  uploadBucket: Bucket;
}

const config = new pulumi.Config();
const region = config.require('gcp-region');
export const imageTag = config.get('tag') || 'latest';

const sqlInstance = createCloudSqlInstance(region);

function createTenant(
  tenantConfig: Config,
  cloudSqlInstanceRef: DatabaseInstance
): TenantResources {
  const dbPassword = createDbSecret(tenantConfig);
  const uploadBucket = uploads(tenantConfig);
  createDatabaseResources(tenantConfig, cloudSqlInstanceRef, dbPassword);
  createIamBindings(tenantConfig, dbPassword, uploadBucket);
  const cloudRunService = deployCloudRun(tenantConfig, imageTag, cloudSqlInstanceRef);

  return {
    cloudRunService,
    sqlInstance,
    uploadBucket,
  };
}

const claimer = createTenant(
  {
    projectId: config.require('gcp-project'),
    tenantId: 'claimer',
    region: region,
  },
  sqlInstance
);

export const claimerCloudRunServiceId = claimer.cloudRunService.id;
export const claimerSqlInstanceId = claimer.sqlInstance.id;
export const claimerUploadBucketId = claimer.uploadBucket.id;
