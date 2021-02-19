import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { UserVerificationConfig, VerificationEmailStyle } from '@aws-cdk/aws-cognito';
import { CognitoConstruct } from '@cpmech/az-cdk';
import { cfg } from './envars';

const tableUsers = `${cfg.TABLE_USERS}-${cfg.STAGE.toUpperCase()}`;

const app = new App();
const stack = new Stack(app, `${cfg.KEY}-${cfg.STAGE}-cognito`);

const urls = cfg.STAGE === 'dev' ? [`https://dev.${cfg.DOMAIN}/`] : [`https://${cfg.DOMAIN}/`];

const userVerification: UserVerificationConfig = {
  emailSubject: cfg.EMAIL_SUBJECT,
  emailBody: cfg.EMAIL_MSG,
  emailStyle: VerificationEmailStyle.CODE,
  smsMessage: cfg.SMS_MSG,
};

const construct = new CognitoConstruct(stack, 'Cognito', {
  poolName: `${cfg.KEY}-${cfg.STAGE}-users`,
  emailSendingAccount: cfg.EMAIL_SENDER,
  domainPrefix: `${cfg.KEY}-login-${cfg.STAGE}`,
  facebookClientId: cfg.FACEBOOK_CLIENT_ID,
  facebookClientSecret: cfg.FACEBOOK_CLIENT_SECRET,
  googleClientId: cfg.GOOGLE_CLIENT_ID,
  googleClientSecret: cfg.GOOGLE_CLIENT_SECRET,
  callbackUrls: urls,
  logoutUrls: urls,
  postConfirmTrigger: true,
  postConfirmSendEmail: true,
  postConfirmDynamoTable: tableUsers,
  useLayers: true,
  userVerification,
  envars: {
    emailSender: cfg.EMAIL_SENDER,
    defaultUserGroup: cfg.DEFAULT_USER_GROUP,
    tableUsers,
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
  },
});

new CfnOutput(stack, 'PoolId', { value: construct.poolId });
new CfnOutput(stack, 'ClientId', { value: construct.clientId });
