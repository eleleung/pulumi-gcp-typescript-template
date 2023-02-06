import * as gcp from '@pulumi/gcp';

import { Config } from '.';

export const uploads = (config: Config) =>
  new gcp.storage.Bucket(`${config.tenantId}-${config.projectId}-uploads`, {
    name: `${config.tenantId}-${config.projectId}-uploads`,
    forceDestroy: true,
    location: 'EU',
    publicAccessPrevention: 'enforced',
    versioning: {
      enabled: true,
    },
  });
