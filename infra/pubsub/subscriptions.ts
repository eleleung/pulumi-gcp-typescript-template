import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

import { Config } from '..';
import { topicAppender, topics } from './topics';

interface subscriptions {
  names: string[];
}

const topic1Subscriptions: subscriptions = {
  names: ['subcription-1', 'subscription-2'],
};

const topic2Subscriptions: subscriptions = {
  names: ['subscription-3', 'subscription-4'],
};

export const subscriptionsMap = new Map<string, subscriptions>([
  [topics.firstTopic, topic1Subscriptions],
  [topics.secondTopic, topic2Subscriptions],
]);

export function createSubscriptions(
  tenantConfig: Config,
  gcpTopicMap: Map<string, gcp.pubsub.Topic>
) {
  subscriptionsMap.forEach((subscriptions, topic) => {
    const selectedTopic = gcpTopicMap.get(
      tenantConfig.tenantId.concat(topicAppender(topics.firstTopic))
    );
    if (typeof selectedTopic === 'undefined') {
      console.log('GCP topic is not defined correctly');
    } else {
      subscriptions.names.forEach(subscription => {
        new gcp.pubsub.Subscription(
          tenantConfig.tenantId.concat('-').concat(topic.concat('-').concat(subscription)),
          {
            topic: selectedTopic.name,
            enableMessageOrdering: true,
            ackDeadlineSeconds: 20,
            retryPolicy: {
              minimumBackoff: pulumi.interpolate`10s`,
              maximumBackoff: pulumi.interpolate`60s`,
            },
            pushConfig: {
              pushEndpoint: 'https://example.com/push', //configure to use tenant application endpoint
              attributes: {
                'x-goog-version': 'v1',
              },
            },
          }
        );
      });
    }
  });

  const allSubscriptions = Array.from(subscriptionsMap.values()).flatMap(({ names }) => names);
}
