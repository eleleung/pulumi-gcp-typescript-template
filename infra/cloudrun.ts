import * as gcp from '@pulumi/gcp';
import { Service } from '@pulumi/gcp/cloudrun';
import { Account } from '@pulumi/gcp/serviceaccount';

import { Config } from '.';
import { CloudSqlResources } from './cloudsql';

export function deployCloudRun(
  config: Config,
  cloudRunServiceAccount: Account,
  imageTag: string,
  cloudSqlResources: CloudSqlResources
): Service {
  const service = new gcp.cloudrun.Service(
    `${config.tenantId}-cloud-run-service`,
    {
      location: config.region,
      template: {
        spec: {
          containers: [
            {
              image: `gcr.io/claimer-devops/ktor-hello-world:${imageTag}`,
            },
          ],
          serviceAccountName: cloudRunServiceAccount.email,
        },
        metadata: {
          annotations: {
            'autoscaling.knative.dev/maxScale': '5',
            'run.googleapis.com/vpc-access-connector': cloudSqlResources.vpcConnector.name,
            'run.googleapis.com/cloudsql-instances': cloudSqlResources.sqlInstance.connectionName,
          },
        },
      },
      autogenerateRevisionName: true,
    },
    {
      dependsOn: [
        cloudRunServiceAccount,
        cloudSqlResources.sqlInstance,
        cloudSqlResources.vpcConnector,
      ],
    }
  );

  new gcp.cloudrun.IamMember(
    `${config.tenantId}-cloud-run-exposer`,
    {
      service: service.name,
      location: config.region,
      role: 'roles/run.invoker',
      member: 'allUsers',
    },
    { parent: service }
  );

  return service;
}
