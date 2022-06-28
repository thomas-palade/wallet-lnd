import test from 'ava';
import { PoolClient } from 'pg';
import { StoppableServer } from 'stoppable';
import { getNewPool, close, getClient } from '../../lib/postgres/pool';
import { deleteAllTables } from '../../test-support/database';
import request from 'supertest';
import { WALLET_ID } from '../../test-support/data/wallet';
import { TRANSACTION_ID, COINS, NEW_TRANSACTION_ID } from '../../test-support/data';
import { findAllWallets, createWallet } from '../wallet';

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

test('When `POST` `/v1/wallets/:walletId/debit` is hit with an unknown `walletId`, Then it returns a 404', async (t) => {
  const response = await request(server)
    .post(`/v1/wallets/${WALLET_ID}/debit`)
    .send({
      transactionId: TRANSACTION_ID,
      coins: COINS
    });
  t.is(response.status, 404);
  t.is(response.body, {});
});

test('Given an existing wallet associated with a given `walletId`, When `POST` `/v1/wallets/:walletId/` is hit with more coins than the wallet contains, Then it returns a 400 status and an empty object', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const DEBITED_COINS = 20000000;
  const response = await request(server)
    .post(`/v1/wallets/${walletId}/debit`)
    .send({
      transactionId: NEW_TRANSACTION_ID,
      coins: DEBITED_COINS
    });
  t.is(response.status, 400);
  t.deepEqual(response.body, {});
});

test('Given an existing wallet associated with a given `walletId`, When `POST` `/v1/wallets/:walletId/` is hit with less coins than the wallet contains, Then it returns a 201 status and a `WalletObject` that contains the updated coins balance', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const DEBITED_COINS = 20;
  await request(server)
    .post(`/v1/wallets/${walletId}/debit`)
    .send({
      transactionId: NEW_TRANSACTION_ID,
      coins: DEBITED_COINS
    });
  const updatedWallet = (await findAllWallets(client))[0];
  t.deepEqual({
    transactionId: updatedWallet.transactionId,
    coins: updatedWallet.coins
  }, {
    transactionId: NEW_TRANSACTION_ID,
    coins: COINS - DEBITED_COINS
  });
});