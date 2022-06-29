import test from 'ava';
import { Request } from 'express';
import { PoolClient } from 'pg';
import { toFailure } from '../../lib/helpers/error';
import { getNewPool, getClient, close } from '../../lib/postgres/pool';
import { COINS, TRANSACTION_ID } from '../../test-support/data';
import { deleteAllTables } from '../../test-support/database';
import { createWallet } from '../wallet';
import { parseCreditWallet } from './credit-wallet-parser';

let client: PoolClient;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
});

test.afterEach(async () => {
  await deleteAllTables(client);
  client.release();
});

test.after(() => {
  close(pool);
});

test('When `parseCreditWallet` is called with a wrong `transactionId`, Then it returns an `Error`', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const maybeWallet = await parseCreditWallet(client, {
    body: {
      transactionId: 12312312,
      coins: COINS
    },
    params: { walletId: walletId },
  } as unknown as Request);
  t.deepEqual(
    maybeWallet,
    toFailure(
      400,
      'this is an error'
    )
  );
});

test('When `parseCreditWallet` is called with a wrong `coins`, Then it returns an `Error`', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const maybeWallet = await parseCreditWallet(client, {
    body: {
      transactionId: TRANSACTION_ID,
      coins: 'bad coins'
    },
    params: { walletId: walletId },
  } as unknown as Request);
  t.deepEqual(
    maybeWallet,
    toFailure(
      400,
      'this is an error'
    )
  );
});

test('When `parseCreditWallet` is called with a wrong `walletId`, Then it returns an `Error`', async (t) => {
  await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const maybeWallet = await parseCreditWallet(client, {
    body: {
      transactionId: TRANSACTION_ID,
      coins: COINS
    },
    params: { walletId: 'bad wallet' },
  } as unknown as Request);
  t.deepEqual(
    maybeWallet,
    toFailure(
      400,
      'this is an error'
    )
  );
});
