import { Service } from '@pulumi/gcp/cloudrun';
import { Account } from '@pulumi/gcp/serviceaccount';
import { Bucket } from '@pulumi/gcp/storage';
import * as pulumi from '@pulumi/pulumi';

import { createIamBindings } from './cloud-run-iam';
import { deployCloudRun } from './cloudrun';
import { CloudSqlResources, createCloudSqlResources, createDatabaseResources } from './cloudsql';
import { uploads } from './gcs';
import { createPubsubIamRoles } from './pubsub/pubsub-iam';
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
  cloudRunServiceAccount: Account;
  cloudSqlResources: CloudSqlResources;
  uploadBucket: Bucket;
}

const gcpConfig = new pulumi.Config('gcp');
const region: string = gcpConfig.require('region');
const projectId = gcpConfig.require('project');

const config = new pulumi.Config();
const imageTag = config.get('tag') || 'latest';

function createTenant(tenantConfig: Config, cloudSqlResources: CloudSqlResources): TenantResources {
  const dbPassword = createDbSecret(tenantConfig);
  const uploadBucket = uploads(tenantConfig);
  const topics = createTopics(tenantConfig);
  const cloudRunServiceAccount = createIamBindings(tenantConfig, dbPassword, uploadBucket);
  const cloudRunServiceAccountEmail = pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`;
  const cloudRunService = deployCloudRun(
    tenantConfig,
    cloudRunServiceAccount,
    imageTag,
    cloudSqlResources
  );
  const subscriptions = createSubscriptions(tenantConfig, topics, cloudRunService);

  createDatabaseResources(tenantConfig, cloudSqlResources.sqlInstance, dbPassword);
  createPubsubIamRoles(tenantConfig, cloudRunServiceAccountEmail, topics, subscriptions);

  return {
    cloudRunService,
    cloudRunServiceAccount,
    cloudSqlResources,
    uploadBucket,
  };
}

// Create resources
const cloudSqlResources = createCloudSqlResources(region);
const claimer = createTenant(
  {
    projectId: projectId,
    tenantId: 'claimer',
    region: region,
  },
  cloudSqlResources
);

export const claimerCloudRunServiceId = claimer.cloudRunService.id;
export const claimerCloudRunServiceAccountEmail = claimer.cloudRunServiceAccount.email;
export const claimerCloudRunServiceUrl = claimer.cloudRunService.statuses[0]?.url;
export const claimerSqlInstanceId = claimer.cloudSqlResources.sqlInstance.id;
export const claimerUploadBucketId = claimer.uploadBucket.id;
