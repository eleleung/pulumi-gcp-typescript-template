import { Service } from '@pulumi/gcp/cloudrun';
import { Bucket } from '@pulumi/gcp/storage';
import * as pulumi from '@pulumi/pulumi';
import { Output } from '@pulumi/pulumi';

import { deployCloudRun } from './cloudrun';
import { CloudSqlResources, createCloudSqlResources, createDatabaseResources } from './cloudsql';
import { uploads } from './gcs';
import { createIamBindings } from './iam';
import { createSubscriptions } from './pubsub/subscriptions';
import { createTopics } from './pubsub/topics';
import { createDbSecret } from './secrets';

export interface Config {
  projectId: string;
  tenantId: string;
  region: string;
}

export interface TenantResources {
  cloudRunService: Service;
  cloudRunServiceAccount: Output<string>;
  cloudSqlResources: CloudSqlResources;
  uploadBucket: Bucket;
}

const gcpConfig = new pulumi.Config('gcp');
const projectId = gcpConfig.require('project');
const region: string = gcpConfig.require('region');

const config = new pulumi.Config();
export const imageTag = config.get('tag') || 'latest';

const cloudSqlResources = createCloudSqlResources(region);

function createTenant(tenantConfig: Config, cloudSqlResources: CloudSqlResources): TenantResources {
  const dbPassword = createDbSecret(tenantConfig);
  const uploadBucket = uploads(tenantConfig);
  const topics = createTopics(tenantConfig);
  const subscriptions = createSubscriptions(tenantConfig, topics);
  const cloudRunServiceAccount = createIamBindings(
    tenantConfig,
    dbPassword,
    uploadBucket,
    topics,
    subscriptions
  );
  createDatabaseResources(tenantConfig, cloudSqlResources.sqlInstance, dbPassword);

  const cloudRunService = deployCloudRun(
    tenantConfig,
    cloudRunServiceAccount,
    imageTag,
    cloudSqlResources
  );

  return {
    cloudRunService,
    cloudRunServiceAccount,
    cloudSqlResources,
    uploadBucket,
  };
}

const claimer = createTenant(
  {
    projectId: projectId,
    tenantId: 'claimer',
    region: region,
  },
  cloudSqlResources
);

export const claimerCloudRunServiceId = claimer.cloudRunService.id;
export const claimerCloudRunServiceAccountEmail = claimer.cloudRunServiceAccount;
export const claimerSqlInstanceId = claimer.cloudSqlResources.sqlInstance.id;
export const claimerUploadBucketId = claimer.uploadBucket.id;
