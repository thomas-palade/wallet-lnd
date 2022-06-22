import { Application } from 'express';

import {
  creditWalletById,
  debitWalletById,
  getWalletById,
} from './api';

export default (app: Application) => {
  app.get(
    '^/v1/wallets/:walletId$', getWalletById);
  app.post(
    '^/v1/wallets/:walletId/credit$', creditWalletById);
  app.post(
    '^/v1/wallets/:walletId/debit$', debitWalletById);
};
