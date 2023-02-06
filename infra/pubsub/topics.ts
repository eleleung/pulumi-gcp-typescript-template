import * as gcp from '@pulumi/gcp';

import { Config } from '..';

interface TopicConfiguration {
  retention: string;
  labels: { created_by: string };
}

interface TopicDefinition {
  name: string;
  configuration: TopicConfiguration;
}

const configuration: TopicConfiguration = {
  retention: '604800s',
  labels: {
    created_by: 'pulumi',
  },
};

export function createTopics(tenantConfig: Config) {
  return createGCPTopic(createTopicDefinition(tenantConfig));
}

export const topics = {
  firstTopic: 'first-topic',
  secondTopic: 'second-topic',
  thirdTopic: 'third-topic',
};

const createTopicDefinition = (tenantConfig: Config): Array<TopicDefinition> => {
  const firstTopic = {
    name: `${tenantConfig.tenantId}-${topics.firstTopic}`,
    configuration: configuration,
  };
  const secondTopic = {
    name: `${tenantConfig.tenantId}-${topics.secondTopic}`,
    configuration: configuration,
  };
  const thirdTopic = {
    name: `${tenantConfig.tenantId}-${topics.thirdTopic}`,
    configuration: configuration,
  };
  return [firstTopic, secondTopic, thirdTopic];
};

const createGCPTopic = (topicDefinitions: Array<TopicDefinition>) => {
  const gcpTopicMap = new Map<string, gcp.pubsub.Topic>();

  topicDefinitions.forEach(topic => {
    gcpTopicMap.set(
      topic.name,
      new gcp.pubsub.Topic(topic.name, {
        messageRetentionDuration: topic.configuration.retention,
        labels: topic.configuration.labels,
      })
    );
  });

  return gcpTopicMap;
};
