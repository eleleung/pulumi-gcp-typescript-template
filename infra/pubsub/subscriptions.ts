import * as gcp from '@pulumi/gcp';
import { Service } from '@pulumi/gcp/cloudrun';
import * as pulumi from '@pulumi/pulumi';

import { Config } from '..';
import { topics } from './topics';

interface subscriptions {
  names: string[];
}

const topic1Subscriptions: subscriptions = {
  names: ['subscription-1', 'subscription-2'],
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
  // cloudRunService: Service
) {
  const subscriptionNamesMap = new Map<string, gcp.pubsub.Subscription>();
  subscriptionsMap.forEach((subscriptions, topic) => {
    const selectedTopic = gcpTopicMap.get(`${tenantConfig.tenantId}-${topic}`);
    if (typeof selectedTopic === 'undefined') {
      console.log('GCP topic is not defined correctly');
    } else {
      subscriptions.names.forEach(subscription => {
        subscriptionNamesMap.set(
          subscription,
          new gcp.pubsub.Subscription(
            `${tenantConfig.tenantId}-${topic}-${subscription}`,
            {
              topic: selectedTopic.name,
              enableMessageOrdering: true,
              ackDeadlineSeconds: 20,
              retryPolicy: {
                minimumBackoff: pulumi.interpolate`10s`,
                maximumBackoff: pulumi.interpolate`60s`,
              },
              pushConfig: {
                pushEndpoint: 'https://example.com/push',
                attributes: {
                  'x-goog-version': 'v1',
                },
              },
            },
            { parent: selectedTopic }
          )
        );
      });
    }
  });

  return subscriptionNamesMap;
}
