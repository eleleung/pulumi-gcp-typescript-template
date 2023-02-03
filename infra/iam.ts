import * as gcp from '@pulumi/gcp';
import { Topic, TopicIAMMember } from '@pulumi/gcp/pubsub';
import { Bucket } from '@pulumi/gcp/storage';
import * as pulumi from '@pulumi/pulumi';
import { Output } from '@pulumi/pulumi';

import { enableIamApi } from './apis';
import { uploads } from './gcs';
import { Config } from './index';
import { gcpTopicMap } from './pubsub/topics';
import { DatabasePassword } from './secrets';
//import { dbPassword } from './secrets';
import { googleDevProject } from './variables';
import { pubsubRoles } from './variables';

export function createIamBindings(
  config: Config,
  dbpassword: DatabasePassword,
  uploadBucket: Bucket
) {
  const cloudRunServiceAccount = new gcp.serviceaccount.Account(`${config.tenantId}-cloud-run`, {
    accountId: `${config.tenantId}-cloud-run`,
    description: `${config.tenantId} cloud run service account`,
    displayName: `${config.tenantId} cloud run service account`,
  });

  const cloudRunServiceAccountEmail = pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`;

  // cloud run service needs to be associated with the cloudRunServiceAccount
  const cloudRunSqlClientIamBinding = new gcp.projects.IAMBinding(
    `${config.tenantId}-cloud-run-cloud-sql`,
    {
      project: config.projectId,
      members: [cloudRunServiceAccountEmail],
      role: 'roles/cloudsql.client',
    },
    { parent: cloudRunServiceAccount, dependsOn: enableIamApi }
  );

  const cloudRunGcsIamBinding = new gcp.storage.BucketIAMMember(
    `${config.tenantId}-cloud-run-gcs`,
    {
      bucket: uploadBucket.name,
      role: 'roles/storage.admin',
      member: cloudRunServiceAccountEmail,
    }
  );

  const cloudRunDbPasswordIamBinding = new gcp.secretmanager.SecretIamMember(
    `${config.tenantId}-cloud-run-db-pwd`,
    {
      secretId: dbpassword.secret.secretId,
      role: 'roles/secretmanager.secretAccessor',
      member: cloudRunServiceAccountEmail,
    }
  );

  return cloudRunServiceAccountEmail;

  // const bindings = Array.from(gcpTopicMap).map(([topicName, topic]) => {
  //   return new gcp.pubsub.TopicIAMMember(topicName.concat(memberBinding), {
  //     project: googleDevProject,
  //     topic: topic.name,
  //     role: pubsubRoles.publisher,
  //     member: cloudRunServiceAccountEmail,
  //   });
  // });

  //const topicNewArray = Array.from(bindings);
}

const memberBinding = '-iam-member-binding';
const memberPrefix = 'group:';

export function createIamTopicBindings(serviceAccount: Output<string>) {
  gcpTopicMap.forEach(
    (topic, name) =>
      new gcp.pubsub.TopicIAMMember(name.concat(memberBinding), {
        project: googleDevProject,
        topic: topic.name,
        role: pubsubRoles.publisher,
        member: serviceAccount,
      })
  );
}
