import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

import { enableIamApi } from './apis';
import { uploads } from './gcs';
import { Config, tenantConfig } from './index';

export function createIamBindings(config: Config) {
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
      bucket: uploads.name,
      role: 'roles/storage.admin',
      member: cloudRunServiceAccountEmail,
    }
  );
}
