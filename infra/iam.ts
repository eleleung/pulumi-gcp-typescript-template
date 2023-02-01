import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

import { enableIamApi, tenantConfig } from './index';

const cloudRunServiceAccount = new gcp.serviceaccount.Account(
  `${tenantConfig.tenantId}-cloud-run`,
  {
    accountId: `${tenantConfig.tenantId}-cloud-run`,
    description: `${tenantConfig.tenantId} cloud run service account`,
    displayName: `${tenantConfig.tenantId} cloud run service account`,
  }
);

const cloudRunServiceAccountEmail = pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`;

// cloud run needs to be associated with the cloudRunServiceAccount
const cloudRunServiceAccountSqlClientIamBinding = new gcp.projects.IAMBinding(
  `${tenantConfig.tenantId}-cloud-run-cloud-sql`,
  {
    project: tenantConfig.projectId,
    members: [cloudRunServiceAccountEmail],
    role: 'roles/cloudsql.client',
  },
  { parent: cloudRunServiceAccount, dependsOn: enableIamApi }
);
