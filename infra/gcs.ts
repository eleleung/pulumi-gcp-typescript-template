import * as gcp from '@pulumi/gcp';

import { Config } from '.';

export const uploads = (config: Config) =>
  new gcp.storage.Bucket(`${config.tenantId}-uploads`, {
    forceDestroy: true,
    location: 'EU',
    publicAccessPrevention: 'enforced',
  });
