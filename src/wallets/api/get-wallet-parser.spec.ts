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

test('Given an ..., When `parseGetWallet` is called, Then it returns an `Error`', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const maybeWallet = await parseGetWallet(client, {
    body: {},
    params: { walletId: walletId },
  } as unknown as Request);
  t.deepEqual(
    maybeWallet,
    toFailure(
      404,
      'this is an error'
    )
  );
});
