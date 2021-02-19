import { App } from '@aws-cdk/core';
import { WebsitePipelineStack, ssmSecret } from '@cpmech/az-cdk';
import { cfg } from './envars';

const app = new App();
const stackName = `${cfg.KEY}-${cfg.STAGE}-website-pip`;

new WebsitePipelineStack(app, stackName, {
  githubUser: cfg.GITHUB_USER,
  githubRepo: cfg.GITHUB_REPO_WEBSITE,
  githubBranch: cfg.STAGE === 'dev' ? 'main' : 'prod',
  websiteBucketName: cfg.STAGE === 'dev' ? `dev.${cfg.DOMAIN}-website` : `${cfg.DOMAIN}-website`,
  cloudfrontDistributionId: cfg.STAGE === 'dev' ? cfg.CLOUDFRONT_ID_DEV : cfg.CLOUDFRONT_ID_PROD,
  notificationEmails: cfg.NOTIFY_EMAILS.split(','),
  assetsDir: 'build',
  githubSecret: ssmSecret({ name: 'GHTOKEN', version: '1' }),
  npmBeforeTest: 'npm run postinstall', // force postinstall
});
