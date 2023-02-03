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
  createGCPTopic(createTopicDefinition(tenantConfig));
}

const createTopicDefinition = (tenantConfig: Config): Array<TopicDefinition> => {
  const firstTopic = {
    name: tenantConfig.tenantId.concat('-first-topic'),
    configuration: configuration,
  };
  const secondTopic = {
    name: tenantConfig.tenantId.concat('-second-topic'),
    configuration: configuration,
  };
  const thirdTopic = {
    name: tenantConfig.tenantId.concat('-third-topic'),
    configuration: configuration,
  };
  return [firstTopic, secondTopic, thirdTopic];
};

const createGCPTopic = (topicDefinitions: Array<TopicDefinition>) => {
  topicDefinitions.forEach(topic => {
    gcpTopicMap.set(
      topic.name,
      new gcp.pubsub.Topic(topic.name, {
        messageRetentionDuration: topic.configuration.retention,
        labels: topic.configuration.labels,
      })
    );
  });
};

//export for use when creating IAM
export const gcpTopicMap = new Map<string, gcp.pubsub.Topic>();
