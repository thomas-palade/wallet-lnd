import test from 'ava';
import { PoolClient } from 'pg';
import { StoppableServer } from 'stoppable';
import { getNewPool, close } from '../../lib/postgres/pool';
import { deleteAllTables } from '../../test-support/database';
import request from 'supertest';
import { WALLET_ID } from '../../test-support/data/wallet';

let client: PoolClient;
const pool = getNewPool();

let server: StoppableServer;

test.beforeEach(async () => {
});

test.afterEach(async () => {
  await deleteAllTables(client);
});

test.after(() => {
  close(pool);
});

test('When `POST` `/v1/wallets/:walletId/debit` is hit without an authorization header, Then it returns a 200 status', async (t) => {
  const response = await request(server)
    .post(`/v1/wallets/${WALLET_ID}/debit`)
    .send({});
  t.is(response.status, 200);
});