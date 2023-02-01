import * as gcp from '@pulumi/gcp';

export const exampleTopic = new gcp.pubsub.Topic('example-topic', {
  labels: {
    foo: 'bar',
  },
  messageRetentionDuration: '86600s',
});
