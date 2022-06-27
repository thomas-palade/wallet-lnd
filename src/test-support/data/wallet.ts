import {
  COINS,
  CREATED_AT,
  TRANSACTION_ID,
  UPDATED_AT,
} from './shared';

export const WALLET_ID = 1;

export const WALLET_OBJECT: WalletObject = {
  coins: COINS,
  transactionId: TRANSACTION_ID
};

export const WALLET: Wallet = {
  ...WALLET_OBJECT,
  createdAt: CREATED_AT.toISOString(),
  id: 1,
  updatedAt: UPDATED_AT.toISOString(),
};

export const WALLET_INSERT: WalletInsert = {
  coins: COINS,
  transaction_id: TRANSACTION_ID
};