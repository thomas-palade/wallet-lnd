import test from 'ava';
import { PoolClient } from 'pg';
import { StoppableServer } from 'stoppable';
import { getClient, getNewPool, close } from '../../lib/postgres/pool';
import { deleteAllTables } from '../../test-support/database';
import request from 'supertest';
import { WALLET_ID } from '../../test-support/data/wallet';
import { COINS, NEW_TRANSACTION_ID, TRANSACTION_ID } from '../../test-support/data';
import { createWallet, findAllWallets } from '../wallet';

let client: PoolClient;
let server: StoppableServer;
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

test('When `POST` `/v1/wallets/:walletId/credit` is hit with an unknown `walletId`, Then it returns a wallet that has the balance equal to the credited coins', async (t) => {
  const response = await request(server)
    .post(`/v1/wallets/${WALLET_ID}/credit`)
    .send({
      transactionId: TRANSACTION_ID,
      coins: COINS
    });
  t.is(response.status, 201);
  t.is(response.body, {
    transactionId: TRANSACTION_ID,
    coins: COINS
  });
});

test('When `POST` `/v1/wallets/:walletId/credit` is hit with an unknown `walletId`, Then it creates a wallet in the database that contains the coins equal to the credited coins', async (t) => {
  await request(server)
    .post(`/v1/wallets/${WALLET_ID}/credit`)
    .send({
      transactionId: TRANSACTION_ID,
      coins: COINS
    });
  const newWallet = (await findAllWallets(client))[0];
  t.deepEqual({
    transactionId: newWallet.transactionId,
    coins: newWallet.coins
  }, {
    transactionId: TRANSACTION_ID,
    coins: COINS
  });
});

test('Given an existing wallet associated with a given `walletId`, When `POST` `/v1/wallets/:walletId/`, Then it returns a 201 status and a `WalletObject` that contains the updated coins balance', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const EXTRA_CREDITED_COINS = 20;
  const response = await request(server)
    .post(`/v1/wallets/${walletId}/credit`)
    .send({
      transactionId: NEW_TRANSACTION_ID,
      coins: EXTRA_CREDITED_COINS
    });
  t.is(response.status, 201);
  t.deepEqual(response.body, {
    transactionId: NEW_TRANSACTION_ID,
    coins: COINS + EXTRA_CREDITED_COINS
  });
});

test('Given an existing wallet associated with a given `walletId`, When `POST` `/v1/wallets/:walletId/`, Then it returns a 201 status and a `WalletObject` that contains the updated coins balance', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const EXTRA_CREDITED_COINS = 20;
  await request(server)
    .post(`/v1/wallets/${walletId}/credit`)
    .send({
      transactionId: NEW_TRANSACTION_ID,
      coins: EXTRA_CREDITED_COINS
    });
  const updatedWallet = (await findAllWallets(client))[0];
  t.deepEqual({
    transactionId: updatedWallet.transactionId,
    coins: updatedWallet.coins
  }, {
    transactionId: NEW_TRANSACTION_ID,
    coins: COINS + EXTRA_CREDITED_COINS
  });
});

test('Given the exact same credit transaction is issued two times in a row, When `POST` `/v1/wallets/:walletId/credit`, Then it returns a 202 status and a `WalletObject` that contains the updated coins balance', async (t) => {
  const { id: walletId } = await createWallet(
    client,
    COINS,
    TRANSACTION_ID
  );
  const EXTRA_CREDITED_COINS = 20;
  const response = await request(server)
    .post(`/v1/wallets/${walletId}/credit`)
    .send({
      transactionId: NEW_TRANSACTION_ID,
      coins: EXTRA_CREDITED_COINS
    });
  t.is(response.status, 201);
  t.deepEqual(response.body, {
    transactionId: NEW_TRANSACTION_ID,
    coins: COINS + EXTRA_CREDITED_COINS
  });
  const secondResponse = await request(server)
  .post(`/v1/wallets/${walletId}/credit`)
  .send({
    transactionId: NEW_TRANSACTION_ID,
    coins: EXTRA_CREDITED_COINS
  });
  t.is(secondResponse.status, 202);
  t.deepEqual(response.body, {
    transactionId: NEW_TRANSACTION_ID,
    coins: COINS + EXTRA_CREDITED_COINS
  });
});