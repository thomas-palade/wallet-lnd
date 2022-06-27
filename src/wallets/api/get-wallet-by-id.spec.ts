import test from 'ava';
import { PoolClient } from 'pg';
import { StoppableServer } from 'stoppable';
import { getNewPool, close, getClient } from '../../lib/postgres/pool';
import { deleteAllTables } from '../../test-support/database';
import request from 'supertest';
import { WALLET_ID } from '../../test-support/data/wallet';

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

test('When `GET` `/v1/wallets/:walletId/` is hit, Then it returns a 200 status', async (t) => {
  const response = await request(server)
    .get(`/v1/wallets/${WALLET_ID}/`)
    .send({});
  t.is(response.status, 200);
});