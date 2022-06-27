import test from 'ava';

import { getClient, getNewPool } from '../pool';
import { createTableWithTableName, dropTableWithTableName } from '../../../test-support/data/database';
import {
  findAllRows,
  findFirstRowWithId
} from './find';

// tslint:disable-next-line: no-let
let client: any;
const pool = getNewPool();
const TABLE_NAME = 'TABLE_NAME';

test.beforeEach(async () => {
  client = await getClient(pool);
  await createTableWithTableName(client, TABLE_NAME);
});

test.afterEach(async () => {
  await dropTableWithTableName(client, TABLE_NAME);
  client.release();
});

test('find returns the single matching row', async t => {
  t.plan(1);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);
  const all = await findAllRows(client, TABLE_NAME);

  const found = await findFirstRowWithId(client, TABLE_NAME, '0');
  t.deepEqual(found, all[0]);
});

test('find returns the first matching row', async t => {
  t.plan(1);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (0, 'b'), (2, 'c')
  `);
  const all = await findAllRows(client, TABLE_NAME);

  const found = await findFirstRowWithId(client, TABLE_NAME, '0');
  t.deepEqual(found, all[0]);
});

test('find returns undefined if the table is empty', async t => {
  t.plan(1);

  const found = await findFirstRowWithId(client, TABLE_NAME, '0');
  t.is(found, undefined);
});

test('find returns undefined if the id does not match any existing row', async t => {
  t.plan(1);

  await client.query(`
      INSERT INTO ${TABLE_NAME}
      (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
    `);

  const found = await findFirstRowWithId(client, TABLE_NAME, '-1');
  t.is(found, undefined);
});

test('find returns the single matching row', async t => {
  t.plan(1);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);
  const all = await findAllRows(client, TABLE_NAME);

  const found = await findFirstRowWithId(client, TABLE_NAME, '0');
  t.deepEqual(found, all[0]);
});