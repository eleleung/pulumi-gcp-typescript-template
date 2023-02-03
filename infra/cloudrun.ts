import * as gcp from '@pulumi/gcp';
import { Service } from '@pulumi/gcp/cloudrun';
import { Output } from '@pulumi/pulumi';

import { Config } from '.';
import { CloudSqlResources } from './cloudsql';

export function deployCloudRun(
  config: Config,
  cloudRunServiceAccount: Output<string>,
  imageTag: string,
  cloudSqlResources: CloudSqlResources
): Service {
  const service = new gcp.cloudrun.Service(`${config.tenantId}-cloud-run-service`, {
    location: config.region,
    template: {
      spec: {
        containers: [
          {
            image: `gcr.io/claimer-devops/ktor-hello-world:${imageTag}`,
          },
        ],
        serviceAccountName: cloudRunServiceAccount,
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
  });

  new gcp.cloudrun.IamMember(`${config.tenantId}-cloud-run-exposer`, {
    service: service.name,
    location: config.region,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  return service;
}
