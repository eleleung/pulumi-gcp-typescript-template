import * as gcp from '@pulumi/gcp';
import { Service } from '@pulumi/gcp/cloudrun';
import { DatabaseInstance } from '@pulumi/gcp/sql';

import { Config } from '.';

export function deployCloudRun(
  config: Config,
  imageTag: string,
  dbInstance: DatabaseInstance
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
      },
      metadata: {
        annotations: {
          'autoscaling.knative.dev/maxScale': '5',
          'run.googleapis.com/cloudsql-instances': dbInstance.connectionName,
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
