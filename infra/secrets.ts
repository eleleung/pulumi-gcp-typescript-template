import * as gcp from '@pulumi/gcp';

import { Config } from '.';

export const dbPassword = (config: Config) =>
  new gcp.secretmanager.Secret(`${config.tenantId}-db-password`, {
    labels: {
      label: `${config.tenantId}-db-password`,
    },
    replication: {
      userManaged: {
        replicas: [
          {
            location: 'europe-west2',
          },
        ],
      },
    },
    secretId: 'secret',
  });
