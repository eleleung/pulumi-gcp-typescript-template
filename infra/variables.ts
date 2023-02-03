import * as gcp from '@pulumi/gcp';

export const location = gcp.config.region || 'europe-west2';
export const pubsubRoles = {
  viewer: 'roles/pubsub.viewer',
  publisher: 'roles/pubsub.publisher',
};
