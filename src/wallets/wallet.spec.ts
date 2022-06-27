import test from 'ava';
import { PoolClient } from 'pg';

import {
  TABLES
} from '../enums';
import { getClient, getNewPool } from '../lib/postgres/pool';
import { findAllRows } from '../lib/postgres/queries/find';

import {
  CREATED_AT,
  WALLET,
  WALLET_INSERT,
  COINS,
  UPDATED_AT,
} from '../test-support/data';
import { deleteAllTables } from '../test-support/database';

import {
  _maybeNormalizeWallet,
  _normalizeWallet,
  createWallet,
  findAllWallets,
  findWalletById,
  updateWallet,
} from './wallet';

let client: PoolClient;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
});

test.afterEach(async () => {
  await deleteAllTables(client);
  client.release();
});

test('When `_normalizeWallet` is called with an `walletRow`, Then it returns an `wallet`', (t) => {
  const walletRow = {
    ...WALLET_INSERT,
    created_at: CREATED_AT,
    id: '1',
    updated_at: UPDATED_AT,
  };
  t.deepEqual(_normalizeWallet(walletRow), WALLET);
});

test('When `_maybeNormalizeWallet` is called with an `walletRow`, Then it returns an `wallet`', (t) => {
  const walletRow = {
    ...WALLET_INSERT,
    created_at: CREATED_AT,
    id: '1',
    updated_at: UPDATED_AT,
  };
  t.deepEqual(_maybeNormalizeWallet(walletRow), WALLET);
});

test('When `_maybeNormalizeWallet` is called with `undefined`, Then it returns `undefined`', (t) => {
  t.is(_maybeNormalizeWallet(undefined), undefined);
});

test('When `createWallet` is called, Then it adds an wallet to the table', async (t) => {
  const results1 = await findAllRows(client, TABLES.WALLETS);
  t.is(results1.length, 0);

  await createWallet(
    client,
    COINS
  );

  const results2 = await findAllRows(client, TABLES.WALLETS);
  t.is(results2.length, 1);
});

test('When `createWallet` is called, Then it returns the created wallet', async (t) => {
  const created = (await createWallet(
    client,
    COINS,
  )) as Wallet;
  t.deepEqual(created, {
    ...created,
    coins: COINS,
  });
});

test('When `findAllWallets` is called Then it returns all the wallets', async (t) => {
  const firstWallet = await createWallet(
    client,
    COINS,
  );
  const secondWallet = await createWallet(
    client,
    COINS
  );

  const results = await findAllWallets(client);
  t.is(results.length, 2);
  t.deepEqual(results, [secondWallet, firstWallet]);
});

test('When `findWalletById` is called with an `id` parameter, Then it returns the `Wallet` associated with that `id`', async (t) => {
  const created = (await createWallet(
    client,
    COINS
  )) as Wallet;
  const result = await findWalletById(client, created.id);
  t.deepEqual(result, created);
});

test('When `updateWallet` is called with `wallet` as parameter, Then it updates the `Wallet` with that walletId with that new values', async (t) => {
  const created = (await createWallet(
    client,
    COINS,
  )) as Wallet;

  const UPDATED_WALLET = {
    ...created,
    coins: 6000
  };

  await updateWallet(client, UPDATED_WALLET);

  const result = (await findGameById(client, created.id)) as Wallet;
  const RESULT_FIELDS = {
    ...created,
    coins: result.coins
  };

  t.deepEqual(RESULT_FIELDS, UPDATED_WALLET);
});