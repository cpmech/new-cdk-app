import { App, Stack } from '@aws-cdk/core';
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import {
  BucketsConstruct,
  DynamoConstruct,
  ReceiveEmailSQSConstruct,
  Route53RecvEmailConstruct,
} from '@cpmech/az-cdk';
import { cfg } from './envars';

const tableUsers = `${cfg.TABLE_USERS}-${cfg.STAGE.toUpperCase()}`;
const bucketDocs = `${cfg.BUCKET_DOCS}-${cfg.STAGE}`;
const onDemand = false;

const app = new App();
const stack = new Stack(app, `${cfg.KEY}-${cfg.STAGE}-infrastructure`);

if (cfg.STAGE === 'dev') {
  // for integration tests only
  new Route53RecvEmailConstruct(stack, 'RecvEmails', {
    domain: cfg.RECV_DOMAIN,
    hostedZoneId: cfg.RECV_HOSTED_ZONE_ID,
    certificateArn: cfg.RECV_CERT_ARN,
  });
  new ReceiveEmailSQSConstruct(stack, 'EmailSQS', {
    emails: [`tester@${cfg.DOMAIN}`],
  });
}

new DynamoConstruct(stack, 'Dynamo', {
  dynamoTables: [
    {
      name: tableUsers,
      partitionKey: 'itemId',
      sortKey: 'aspect',
      onDemand,
      gsis: [
        {
          indexName: 'GSI1',
          partitionKey: { name: 'aspect', type: AttributeType.STRING },
          sortKey: { name: 'indexSK', type: AttributeType.STRING },
        },
      ],
    },
  ],
});

new BucketsConstruct(stack, 'Buckets', {
  buckets: [
    {
      name: bucketDocs,
      corsPUT: true,
    },
  ],
});
