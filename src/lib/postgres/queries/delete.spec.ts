import test from 'ava';
import { createTableWithTableName, dropTableWithTableName } from '../../../test-support/data/database';
import { getClient, getNewPool } from '../pool';
import { deleteAll } from './delete';
import { findAllRows } from './find';

const TABLE_NAME = 'TABLE_NAME';

// tslint:disable-next-line: no-let
let client: any;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
  await createTableWithTableName(client, TABLE_NAME);
});

test.afterEach(async () => {
  await dropTableWithTableName(client, TABLE_NAME);
  client.release();
});

test('deletes all rows', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (0, 'b'), (2, 'c')
  `);
  const results1 = await findAllRows(client, TABLE_NAME);
  t.is(results1.length, 3);

  await deleteAll(client, TABLE_NAME);

  const results2 = await findAllRows(client, TABLE_NAME);
  t.is(results2.length, 0);
});

test('delete all returns false if the table is empty', async t => {
  t.plan(3);

  const results1 = await findAllRows(client, TABLE_NAME);
  t.is(results1.length, 0);

  const deleted = await deleteAll(client, TABLE_NAME);

  const results2 = await findAllRows(client, TABLE_NAME);
  t.is(results2.length, 0);
  t.is(deleted, false);
});

test('delete all returns true the table is not empty', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);
  const results1 = await findAllRows(client, TABLE_NAME);
  t.is(results1.length, 3);

  const deleted = await deleteAll(client, TABLE_NAME);

  const results2 = await findAllRows(client, TABLE_NAME);
  t.is(results2.length, 0);
  t.is(deleted, true);
});
