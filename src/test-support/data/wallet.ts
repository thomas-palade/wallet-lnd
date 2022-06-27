import {
  COINS,
  CREATED_AT,
  UPDATED_AT,
} from './shared';

export const WALLET_ID = 1;

export const WALLET_OBJECT: WalletObject = {
  coins: COINS,
};

export const WALLET: Wallet = {
  ...WALLET_OBJECT,
  createdAt: CREATED_AT.toISOString(),
  id: 1,
  updatedAt: UPDATED_AT.toISOString(),
};

export const GAME_INSERT: WalletInsert = {
  coins: COINS,
};