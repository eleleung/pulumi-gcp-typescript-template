import * as gcp from '@pulumi/gcp';
import { Output } from '@pulumi/pulumi';

import { Config } from '..';

export function createPubsubIamRoles(
  config: Config,
  cloudRunServiceAccountEmail: Output<string>,
  gcpTopicMap: Map<string, gcp.pubsub.Topic>,
  subscriptionsMap: Map<string, gcp.pubsub.Subscription>
) {
  const memberBinding = 'iam-member-binding';
  [...gcpTopicMap].map(
    ([topicName, topic]) =>
      new gcp.pubsub.TopicIAMMember(`${topicName}-${memberBinding}`, {
        project: config.projectId,
        topic: topic.name,
        role: 'roles/pubsub.publisher',
        member: cloudRunServiceAccountEmail,
      })
  );

  [...subscriptionsMap].map(
    ([subscriptionName, subscription]) =>
      new gcp.pubsub.SubscriptionIAMMember(
        `${config.tenantId}-${subscriptionName}-${memberBinding}`,
        {
          project: config.projectId,
          subscription: subscription.name,
          role: 'roles/pubsub.subscriber',
          member: cloudRunServiceAccountEmail,
        }
      )
  );
}
