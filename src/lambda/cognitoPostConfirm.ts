import { mlog } from '@cpmech/basic';
import {
  makeCognitoPostConfirmHandler,
  IUpdateDb,
  IEmailMaker,
  IEmailMakerResults,
} from '@cpmech/az-cognito';
import { IPrimaryKey, update } from '@cpmech/az-dynamo';
import { initEnvars } from '@cpmech/envars';
import { newZeroCustomer } from '../data';

const envars = {
  emailSender: '',
  defaultUserGroup: '',
  tableUsers: '',
};

initEnvars(envars);

const emailMaker: IEmailMaker = (
  email: string,
  name?: string,
  provider?: string,
): IEmailMakerResults => {
  let message = `Hello ${name ? name : email},

Your account has been created!

Thank you.
`;
  if (provider) {
    message += `
(using ${provider})
  `;
  }

  return {
    subject: 'cdkapp says Welcome',
    message,
  };
};

const updateDb: IUpdateDb = async (userName: string, email: string, name?: string) => {
  // message
  mlog(`... updating DB with userName=${userName}, email=${email}, name=${name} ...`);

  // constants
  const customer = newZeroCustomer();
  customer.itemId = userName;
  customer.indexSK = new Date().toISOString();
  customer.email = email;
  customer.fullName = name;
  if (!customer.fullName) {
    delete customer.fullName;
  }

  // primary key
  const primaryKey: IPrimaryKey = { itemId: customer.itemId, aspect: customer.aspect };

  // messages
  mlog('... print(customer ) ...');
  mlog(customer);

  // update table
  mlog('... updating CUSTOMER ...');
  await update(envars.tableUsers, primaryKey, customer);

  // success
  mlog('... success: update of DynamoDB ...');
};

export const handler = makeCognitoPostConfirmHandler({
  defaultUserGroup: envars.defaultUserGroup,
  emailMaker,
  senderEmail: envars.emailSender,
  updateDb,
});
