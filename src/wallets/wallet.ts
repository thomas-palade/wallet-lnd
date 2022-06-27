import { PoolClient } from 'pg';
import { maybeApply } from '../lib/helpers/maybe';

import {
  DELETE_WALLET_BY_ID,
  DELETE_ALL_WALLETS,
  INSERT_WALLET,
  SELECT_ALL_WALLETS,
  SELECT_WALLET_BY_ID,
  UPDATE_WALLET_BY_ID
} from './queries';

export const _maybeNormalizeWallet = (
  wallet: WalletRow | undefined
): Wallet | undefined => {
  const response = maybeApply(_normalizeWallet, wallet);
  return response;
};

export const _normalizeWallet = (wallet: WalletRow): Wallet => ({
  createdAt: wallet.created_at && new Date(wallet.created_at).toISOString(),
  coins: wallet.coins,
  id: Number(wallet.id),
  updatedAt: wallet.updated_at && new Date(wallet.updated_at).toISOString(),
});

export const createWallet = async (
  client: PoolClient,
  coins: number,
) =>
  _normalizeWallet(
    (
      await client.query(INSERT_WALLET, [
        coins
      ])
    ).rows[0]
  );

export const findAllWallets = async (
  client: PoolClient
): Promise<readonly Wallet[]> =>
  (await client.query(SELECT_ALL_WALLETS)).rows.map(_normalizeWallet);

export const findWalletById = async (
  client: PoolClient,
  id: number
): Promise<Wallet | undefined> =>
  _maybeNormalizeWallet((await client.query(SELECT_WALLET_BY_ID, [id])).rows[0]);

export const updateWallet = async (
  client: PoolClient,
  wallet: Wallet
): Promise<Wallet> =>
  _normalizeWallet(
    (
      await client.query(UPDATE_WALLET_BY_ID, [
        wallet.coins,
        wallet.id,
      ])
    ).rows[0]
  );

export const deleteAllWallets = async (
  client: PoolClient
): Promise<void> => {
  return (await client.query(DELETE_ALL_WALLETS, [])).rows[0];
};

export const deleteWalletsById = async (
  client: PoolClient,
  walletId: string
): Promise<void> => {
  return (await client.query(DELETE_WALLET_BY_ID, [walletId])).rows[0];
};