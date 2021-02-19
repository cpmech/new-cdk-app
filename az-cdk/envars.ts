import { initEnvars } from '@cpmech/envars';

const envars = {
  // stage
  STAGE: '',

  // website
  CDK_DOMAIN: '',
  CDK_HOSTED_ZONE_ID: '',
  CDK_CERTIFICATE_ARN: '',
  CDK_CLOUDFRONT_ID_DEV: '',
  CDK_CLOUDFRONT_ID_PROD: '',
  CDK_EMAIL_SENDER: '',
  CDK_NOTIFY_EMAILS: '',

  // receiving emails => integration tests
  CDK_RECV_DOMAIN: '',
  CDK_RECV_HOSTED_ZONE_ID: '',
  CDK_RECV_CERT_ARN: '',

  // infrastructure
  CDK_TABLE_USERS: '',
  CDK_BUCKET_DOCS: '',

  // cognito
  CDK_DEFAULT_USER_GROUP: '',
  CDK_FACEBOOK_CLIENT_ID: '',
  CDK_FACEBOOK_CLIENT_SECRET: '',
  CDK_GOOGLE_CLIENT_ID: '',
  CDK_GOOGLE_CLIENT_SECRET: '',
};

initEnvars(envars);

export const cfg = {
  // my app key
  KEY: 'cdkapp',
  GITHUB_USER: 'githubuser',
  GITHUB_REPO_WEBSITE: 'githubrepo',

  // group and stage => enforce prod for the website
  STAGE: envars.STAGE,

  // website
  DOMAIN: envars.CDK_DOMAIN,
  HOSTED_ZONE_ID: envars.CDK_HOSTED_ZONE_ID,
  CERTIFICATE_ARN: envars.CDK_CERTIFICATE_ARN,
  CLOUDFRONT_ID_DEV: envars.CDK_CLOUDFRONT_ID_DEV,
  CLOUDFRONT_ID_PROD: envars.CDK_CLOUDFRONT_ID_PROD,
  EMAIL_SENDER: envars.CDK_EMAIL_SENDER,
  NOTIFY_EMAILS: envars.CDK_NOTIFY_EMAILS,

  // receiving emails => integration tests
  RECV_DOMAIN: envars.CDK_RECV_DOMAIN,
  RECV_HOSTED_ZONE_ID: envars.CDK_RECV_HOSTED_ZONE_ID,
  RECV_CERT_ARN: envars.CDK_RECV_CERT_ARN,

  // infrastructure
  TABLE_USERS: envars.CDK_TABLE_USERS,
  BUCKET_DOCS: envars.CDK_BUCKET_DOCS,

  // cognito
  DEFAULT_USER_GROUP: envars.CDK_DEFAULT_USER_GROUP,
  FACEBOOK_CLIENT_ID: envars.CDK_FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: envars.CDK_FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: envars.CDK_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envars.CDK_GOOGLE_CLIENT_SECRET,

  // cognito-messages
  EMAIL_SUBJECT: 'cdkapp: Confirmation code',
  EMAIL_MSG: `<p>Hello,<p/>
<p>Thank you for registering an account with us!</p>
<p>Your confirmation code is <b>{####}<b></p>
<p>Cheers!</p>`,
  SMS_MSG: 'From cdkapp. Your confirmation code is {####}',
};
