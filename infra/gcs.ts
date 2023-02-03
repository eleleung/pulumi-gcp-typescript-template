import * as gcp from '@pulumi/gcp';
import * as random from '@pulumi/random';

import { Config } from '.';

export const uploads = (config: Config) =>
  new gcp.storage.Bucket(`${config.tenantId}-${config.projectId}-uploads`, {
    name: `${config.tenantId}-uploads`,
    forceDestroy: true,
    location: 'EU',
    publicAccessPrevention: 'enforced',
    versioning: {
      enabled: true,
    },
  });
