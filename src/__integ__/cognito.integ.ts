import fetch from 'node-fetch';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;
import AWS from 'aws-sdk';
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import { v4 } from 'uuid';
import { get, removeItem } from '@cpmech/az-dynamo';
import { adminDeleteUser, adminFindUserByEmail, getTokenPayload } from '@cpmech/az-cognito';
import {
  deleteEmail,
  receiveEmail,
  extractCodeFromEmail,
  extractSubjectAndMessage,
} from '@cpmech/az-senqs';
import { mlog, elog } from '@cpmech/basic';
import { initEnvars } from '@cpmech/envars';

jest.setTimeout(100000);

const envars = {
  CDK_COGNITO_POOLID_DEV: '',
  CDK_COGNITO_CLIENTID_DEV: '',
  CDK_RECV_DOMAIN: '',
  CDK_RECV_QUEUE_URL: '',
  CDK_DEFAULT_USER_GROUP: '',
  CDK_TABLE_USERS: '',
};

initEnvars(envars);

const STAGE = 'dev';
const queueUrl = envars.CDK_RECV_QUEUE_URL;
const userPoolId = envars.CDK_COGNITO_POOLID_DEV;
const defaultUserGroup = envars.CDK_DEFAULT_USER_GROUP;
const tableUsers = `${envars.CDK_TABLE_USERS}-${STAGE.toUpperCase()}`;

AWS.config.update({
  region: 'us-east-1',
});

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: envars.CDK_COGNITO_POOLID_DEV,
    userPoolWebClientId: envars.CDK_COGNITO_CLIENTID_DEV,
  },
});

const password = '123paSSword$';
const email = `tester+${v4()}@${envars.CDK_RECV_DOMAIN}`;
let username = '';

const cleanUp = async () => {
  try {
    if (username) {
      await adminDeleteUser(userPoolId, username);
      await removeItem(tableUsers, { itemId: username, aspect: 'CUSTOMER' });
      mlog('... user deleted successfully ...');
    }
  } catch (err) {
    elog(err);
  }
};

afterAll(async () => {
  await cleanUp();
});

describe('cognito and dynamodb', () => {
  it('should signUp, confirm, and signIn successfully', async () => {
    mlog('1: signing up');
    const res = await Auth.signUp({
      username: email,
      password,
    });
    username = res.userSub; // username = res.user.getUsername(); // <<< this gives the email instead
    mlog(`>>> username = ${username}`);
    expect(res.userConfirmed).toBe(false);

    mlog('2: receiving email');
    const emailCode = await receiveEmail(email, queueUrl, 20, 2000);

    mlog('3: deleting email');
    await deleteEmail(emailCode.receiptHandle, queueUrl);

    mlog('4: extracting code from email');
    const code = await extractCodeFromEmail(emailCode.content);
    mlog(`>>> code = ${code}`);

    mlog('5: confirming email with given code');
    await Auth.confirmSignUp(username, code);
    const userJustConfirmed = await adminFindUserByEmail(userPoolId, email);
    expect(userJustConfirmed.Data.email).toBe(email);
    expect(userJustConfirmed.Data.email_verified).toBe('true');

    mlog('6: signing in');
    const user = await Auth.signIn(username, password);
    expect(user.attributes.email_verified).toBe(true);

    mlog('7: receiving confirmation email');
    const emailConfirm = await receiveEmail(email, queueUrl, 20, 2000);

    mlog('8: deleting email');
    await deleteEmail(emailConfirm.receiptHandle, queueUrl);

    mlog('9: checking confirmation message');
    const sm = await extractSubjectAndMessage(emailConfirm.content);
    expect(sm).toEqual({
      subject: 'cdkapp says Welcome',
      message: `Hello ${email},

Your account has been created!

Thank you.
`,
    });
    mlog('10: checking group');
    const payload = await getTokenPayload(user);
    expect(payload['cognito:groups']).toEqual([defaultUserGroup]);

    mlog('11: checking dynamodb');
    const data = await get(tableUsers, { itemId: username, aspect: 'CUSTOMER' });
    if (!data) {
      fail('cannot get CUSTOMER data');
    }
    expect(data.itemId).toBe(username);
    expect(data.aspect).toBe('CUSTOMER');
    expect(data.email).toBe(email);
  });
});
