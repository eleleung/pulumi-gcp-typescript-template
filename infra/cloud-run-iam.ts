import * as gcp from '@pulumi/gcp';
import { Bucket } from '@pulumi/gcp/storage';
import * as pulumi from '@pulumi/pulumi';

import { enableIamApi } from './apis';
import { Config } from './index';
import { DatabasePassword } from './secrets';
import { devOpsCloudBuildServiceAccount } from './variables';

export function createIamBindings(
  config: Config,
  dbpassword: DatabasePassword,
  uploadBucket: Bucket,
  gcpTopicMap: Map<string, gcp.pubsub.Topic>,
  subscriptionsMap: Map<string, gcp.pubsub.Subscription>
) {
  const cloudRunServiceAccount = new gcp.serviceaccount.Account(`${config.tenantId}-cloud-run`, {
    accountId: `${config.tenantId}-cloud-run`,
    description: `${config.tenantId} cloud run service account`,
    displayName: `${config.tenantId} cloud run service account`,
  });

  const cloudRunServiceAccountEmail = pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`;

  new gcp.projects.IAMMember(
    `${config.tenantId}-cloud-run-admin-iam-binding`,
    {
      project: config.projectId,
      member: cloudRunServiceAccountEmail,
      role: 'roles/run.admin',
    },
    {
      parent: cloudRunServiceAccount,
    }
  );

  new gcp.projects.IAMMember(
    `${config.tenantId}-cloud-run-service-account-user-iam-binding`,
    {
      project: config.projectId,
      member: cloudRunServiceAccountEmail,
      role: 'roles/iam.serviceAccountUser',
    },
    {
      parent: cloudRunServiceAccount,
    }
  );

  // cloud run service needs to be associated with the cloudRunServiceAccount
  new gcp.projects.IAMMember(
    `${config.tenantId}-cloud-run-cloud-sql`,
    {
      project: config.projectId,
      member: cloudRunServiceAccountEmail,
      role: 'roles/cloudsql.client',
    },
    { parent: cloudRunServiceAccount, dependsOn: enableIamApi }
  );

  new gcp.storage.BucketIAMMember(
    `${config.tenantId}-cloud-run-gcs`,
    {
      bucket: uploadBucket.name,
      role: 'roles/storage.admin',
      member: cloudRunServiceAccountEmail,
    },
    { parent: uploadBucket }
  );

  new gcp.secretmanager.SecretIamMember(`${config.tenantId}-cloud-run-db-pwd`, {
    secretId: dbpassword.secret.secretId,
    role: 'roles/secretmanager.secretAccessor',
    member: cloudRunServiceAccountEmail,
  });

  const memberBinding = 'iam-member-binding';
  [...gcpTopicMap].map(
    ([topicName, topic]) =>
      new gcp.pubsub.TopicIAMMember(`${topicName}-${memberBinding}`, {
        project: config.projectId,
        topic: topic.name,
        role: 'roles/pubsub.admin',
        member: cloudRunServiceAccountEmail,
      })
  );

  [...subscriptionsMap].map(
    ([subscriptionName, subscription]) =>
      new gcp.pubsub.SubscriptionIAMMember(
        `${config.tenantId}-${subscriptionName}-${memberBinding}`,
        {
          project: config.projectId,
          subscription: subscription.name,
          role: 'roles/pubsub.admin',
          member: cloudRunServiceAccountEmail,
        }
      )
  );

  return cloudRunServiceAccount.email;
}
