import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { WebsiteConstruct } from '@cpmech/az-cdk';
import { cfg } from './envars';

const app = new App();
const stackName = `${cfg.KEY}-${cfg.STAGE}-website`;
const stack = new Stack(app, stackName);

const website = new WebsiteConstruct(stack, 'Website', {
  comment: `${cfg.KEY.toUpperCase()} Website`,
  prefix: cfg.STAGE === 'dev' ? 'dev' : undefined,
  domain: cfg.DOMAIN,
  skipMX: false,
  hostedZoneId: cfg.HOSTED_ZONE_ID,
  certificateArn: cfg.CERTIFICATE_ARN,
});

new CfnOutput(stack, 'CloudFrontId', {
  value: website.cloudfrontDistributionId,
});
