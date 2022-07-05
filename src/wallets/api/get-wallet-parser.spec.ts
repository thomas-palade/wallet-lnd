import test from 'ava';
import { Request } from 'express';
import { PoolClient } from 'pg';
import { toFailure } from '../../lib/helpers/error';
import { getNewPool, getClient, close } from '../../lib/postgres/pool';
import { COINS, TRANSACTION_ID } from '../../test-support/data';
import { deleteAllTables } from '../../test-support/database';
import { createWallet } from '../wallet';
import { parseGetWallet } from './get-wallet-parser';

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

test('When `parseGetWallet` is called with a wrong `walletId`, Then it returns an `Error`', async (t) => {
  await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const maybeWallet = await parseGetWallet(client, {
    body: {},
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