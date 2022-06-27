import test from 'ava';
import { getClient, getNewPool } from '../pool';
import { deleteAll } from './delete';
import { findAllRows } from './find';

const TABLE_NAME = 'TABLE_NAME';

const _dropTableWithTableName = async (client: any, TABLE: string) => {
  return client.query(`
    DROP TABLE IF EXISTS ${TABLE} CASCADE;
  `);
};

const _createTableWithTableName = async (client: any, TABLE: string) => {
  return client.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id BIGINT,
      value TEXT,
      value2 TEXT,
      deleted_at TIMESTAMP,
      precise_number FLOAT                                         
    );
    TRUNCATE ${TABLE}
  `);
};

// tslint:disable-next-line: no-let
let client: any;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
  await _createTableWithTableName(client, TABLE_NAME);
});

test.afterEach(async () => {
  await _dropTableWithTableName(client, TABLE_NAME);
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
