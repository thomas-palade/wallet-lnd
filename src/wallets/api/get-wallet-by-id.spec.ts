import test from 'ava';
import { PoolClient } from 'pg';
import { StoppableServer } from 'stoppable';
import { getNewPool, close, getClient } from '../../lib/postgres/pool';
import { deleteAllTables } from '../../test-support/database';
import request from 'supertest';
import { WALLET_ID } from '../../test-support/data/wallet';
import { COINS, TRANSACTION_ID } from '../../test-support/data';
import { createWallet } from '../wallet';

let client: PoolClient;
let server: StoppableServer;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
});

test.afterEach(async () => {
  await deleteAllTables(client);
});

test.after(() => {
  close(pool);
});

test('When `GET` `/v1/wallets/:walletId/` is hit with an unknown `walletId`, Then it returns a 404 status and an empty body', async (t) => {
  const response = await request(server)
    .get(`/v1/wallets/${WALLET_ID}/`)
    .send({});
  t.is(response.status, 404);
  t.is(response.body, {});
});

test('Given an existing wallet associated with a given `walletId`, When `GET` `/v1/wallets/:walletId/`, Then it returns a 200 status and a `WalletObject`', async (t) => {
  await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const response = await request(server)
    .get(`/v1/wallets/${WALLET_ID}/`)
    .send({});
  t.is(response.status, 200);
  t.deepEqual(response.body, {
    transactionId: WALLET_ID,
    coins: COINS
  });
});