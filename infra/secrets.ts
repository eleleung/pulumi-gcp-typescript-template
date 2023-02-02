import * as gcp from '@pulumi/gcp';
import { Secret, SecretVersion } from '@pulumi/gcp/secretmanager';
import { Output } from '@pulumi/pulumi';
import * as random from '@pulumi/random';

import { Config } from '.';

export interface DatabasePassword {
  secret: Secret;
  version: SecretVersion;
}

export function createDbSecret(config: Config): DatabasePassword {
  const secret = new gcp.secretmanager.Secret(`${config.tenantId}-db-password`, {
    labels: {
      label: `${config.tenantId}-db-password`,
    },
    replication: {
      userManaged: {
        replicas: [
          {
            location: config.region,
          },
        ],
      },
    },
    secretId: `${config.tenantId}-db-password`,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const password: Output<string> = new random.RandomPassword(
    'password',
    {
      length: 16,
      special: false,
    },
    { parent: secret }
  ).result;

  const version = new gcp.secretmanager.SecretVersion(
    `${config.tenantId}-db-password-version-1`,
    {
      secret: secret.id,
      secretData: password,
    },
    { parent: secret }
  );

  return {
    secret,
    version,
  };
}
