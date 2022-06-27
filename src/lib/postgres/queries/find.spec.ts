import test from 'ava';

import { getClient, getNewPool } from '../pool';

import { TABLE_NAME } from '../../test-support/data';
import {
  createTableWithTableName,
  dropTableWithTableName
} from '../../test-support/database';
import {
  findAllActiveRows,
  findAllActiveRowsWhereColumnEqualsValue,
  findAllRows,
  findAllRowsWhereColumnEqualsValue,
  findAllRowsWhereColumnEqualsValuePaginated,
  findFirstRowWithId
} from './find';

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

// TODO: Move this to lls-lib-helpers
const pluck = (list: ReadonlyArray<any>, propertyName: string) => {
  return list.map((item: any) => item[propertyName]);
};

test('find all returns an empty array if the table is empty', async t => {
  t.plan(2);

  const all = await findAllRows(client, TABLE_NAME);
  t.is(all.length, 0);
  t.deepEqual(all, []);
});

test('find all returns all rows in the table', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const all = await findAllRows(client, TABLE_NAME);
  t.is(all.length, 3);
  t.deepEqual(pluck(all, 'value'), ['a', 'b', 'c']);
});

test('find all returns ordered results', async t => {
  t.plan(4);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'b'), (1, 'c'), (2, 'a')
  `);

  const orderedAsc = await findAllRows(client, TABLE_NAME, undefined, 'value');
  t.is(orderedAsc.length, 3);
  t.deepEqual(pluck(orderedAsc, 'id'), ['2', '0', '1']);

  const orderedDesc = await findAllRows(
    client,
    TABLE_NAME,
    undefined,
    'value',
    'DESC'
  );
  t.is(orderedDesc.length, 3);
  t.deepEqual(pluck(orderedDesc, 'id'), ['1', '0', '2']);
});

test('find all returns limited results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const limited = await findAllRows(client, TABLE_NAME, 2);
  t.is(limited.length, 2);
  t.deepEqual(pluck(limited, 'id'), ['0', '1']);
});

test('find all returns offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const offsetted = await findAllRows(
    client,
    TABLE_NAME,
    2,
    undefined,
    undefined,
    1
  );
  t.is(offsetted.length, 2);
  t.deepEqual(pluck(offsetted, 'id'), ['1', '2']);
});

test('find all returns ordered, limited, offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'b'), (1, 'c'), (2, 'a')
  `);

  const offsetted = await findAllRows(
    client,
    TABLE_NAME,
    1,
    'value',
    'DESC',
    2
  );
  t.is(offsetted.length, 1);
  t.deepEqual(pluck(offsetted, 'id'), ['2']);
});

test('find all where column equals value returns an empty array if the table is empty', async t => {
  t.plan(2);

  const all = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(all.length, 0);
  t.deepEqual(all, []);
});

test('find all where column equals value returns an empty array if no match exists', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const all = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'd'
  );
  t.is(all.length, 0);
  t.deepEqual(all, []);
});

test('find all where column equals value returns all matching rows', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'a')
  `);

  const all = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(all.length, 2);
  t.deepEqual(pluck(all, 'id'), ['0', '2']);
});

test('find all where column equals value returns all rows matching on FLOAT value', async t => {
  t.plan(2);

  await client.query(`
      INSERT INTO ${TABLE_NAME}
      (id, precise_number) VALUES (0, 1), (1, .999999), (2, 0.999999)
    `);

  const all = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'precise_number',
    '.999999'
  );
  t.deepEqual(all.length, 2);
  t.deepEqual(pluck(all, 'id'), ['1', '2']);
});

test('find all where column equals value returns ordered results', async t => {
  t.plan(4);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const orderedAsc = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    undefined,
    'value'
  );
  t.is(orderedAsc.length, 3);
  t.deepEqual(pluck(orderedAsc, 'id'), ['2', '0', '1']);

  const orderedDesc = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    undefined,
    'value',
    'DESC'
  );
  t.is(orderedDesc.length, 3);
  t.deepEqual(pluck(orderedDesc, 'id'), ['1', '0', '2']);
});

test('find all where column equals value returns limited results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const limited = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    2
  );
  t.is(limited.length, 2);
  t.deepEqual(pluck(limited, 'id'), ['0', '1']);
});

test('find all where column equals value returns offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const offsetted = await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    2,
    undefined,
    undefined,
    1
  );
  t.is(offsetted.length, 2);
  t.deepEqual(pluck(offsetted, 'id'), ['1', '2']);
});

test('find all where column equals value returns ordered, limited, offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const offsetted = await await findAllRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    1,
    'value',
    'DESC',
    2
  );
  t.is(offsetted.length, 1);
  t.deepEqual(pluck(offsetted, 'id'), ['2']);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns an empty items array with a totalItems of 0 if table is empty', async t => {
  t.plan(3);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(paginated.items.length, 0);
  t.deepEqual(paginated.items, []);
  t.is(paginated.totalItems, 0);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns an empty items array with a totalItems of 0 if no match exists', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'd'
  );
  t.is(paginated.items.length, 0);
  t.deepEqual(paginated.items, []);
  t.is(paginated.totalItems, 0);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns itemsPerPage and pageNumber as numbers', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'c')
  `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'd',
    2,
    22
  );

  t.is(paginated.itemsPerPage, 22);
  t.is(paginated.pageNumber, 2);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns all matching rows in items with totalItem count', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'b'), (2, 'a')
  `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(paginated.items.length, 2);
  t.deepEqual(pluck(paginated.items, 'id'), ['0', '2']);
  t.is(paginated.totalItems, 2);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns 20 items by default', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'a'), (2, 'a'), (3, 'a'), (4, 'a'), (5, 'a'), (6, 'a'), (7, 'a'), (8, 'a'), (9, 'a'), (10, 'a'), (11, 'a'), (12, 'a'), (13, 'a'), (14, 'a'), (15, 'a'), (16, 'a'), (17, 'a'), (18, 'a'), (19, 'a'), (20, 'a'), (21, 'a'), (22, 'a'), (23, 'a')
  `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(paginated.items.length, 20);
  t.is(paginated.totalItems, 24);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns less items than requested if the final page has less items', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value) VALUES (0, 'a'), (1, 'a'), (2, 'a'), (3, 'a'), (4, 'a'), (5, 'a'), (6, 'a'), (7, 'a'), (8, 'a'), (9, 'a'), (10, 'a'), (11, 'a'), (12, 'a'), (13, 'a'), (14, 'a'), (15, 'a'), (16, 'a'), (17, 'a'), (18, 'a'), (19, 'a'), (20, 'a'), (21, 'a'), (22, 'a'), (23, 'a')
  `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value',
    'a',
    1,
    20
  );
  t.is(paginated.items.length, 4);
  t.is(paginated.totalItems, 24);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns all rows matching on FLOAT value', async t => {
  t.plan(3);

  await client.query(`
      INSERT INTO ${TABLE_NAME}
      (id, precise_number) VALUES (0, 1), (1, .999999), (2, 0.999999)
    `);

  const paginated = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'precise_number',
    '.999999'
  );
  t.is(paginated.items.length, 2);
  t.deepEqual(pluck(paginated.items, 'id'), ['1', '2']);
  t.is(paginated.totalItems, 2);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns ordered results', async t => {
  t.plan(6);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const orderedAsc = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    0,
    20,
    'ASC',
    'value'
  );
  t.is(orderedAsc.items.length, 3);
  t.deepEqual(pluck(orderedAsc.items, 'id'), ['2', '0', '1']);
  t.is(orderedAsc.totalItems, 3);

  const orderedDesc = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    0,
    20,
    'DESC',
    'value'
  );
  t.is(orderedDesc.items.length, 3);
  t.deepEqual(pluck(orderedDesc.items, 'id'), ['1', '0', '2']);
  t.is(orderedDesc.totalItems, 3);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns results limited to the itemsPerPage supplied but includes the total count of matching rows', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'x')
  `);

  const limited = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    0,
    2
  );
  t.is(limited.items.length, 2);
  t.deepEqual(pluck(limited.items, 'id'), ['0', '1']);
  t.is(limited.totalItems, 3);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns results matching the requested pageNumber', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'z')
  `);

  const offsetted = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    1,
    2
  );
  t.is(offsetted.items.length, 2);
  t.deepEqual(pluck(offsetted.items, 'id'), ['2', '3']);
  t.is(offsetted.totalItems, 4);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns the totalItem count correctly when the pageNumber overshoots the total amount of data', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'z')
  `);

  const offsetted = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    2,
    2
  );
  t.is(offsetted.items.length, 0);
  t.is(offsetted.totalItems, 4);
});

test('findAllRowsWhereColumnEqualsValuePaginated returns ordered results offset by pageNumber and limited to itemsPerPage', async t => {
  t.plan(3);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2) VALUES (0, 'b', 'z'), (1, 'c', 'z'), (2, 'a', 'z'), (3, 'd', 'z')
  `);

  const offsetted = await findAllRowsWhereColumnEqualsValuePaginated(
    client,
    TABLE_NAME,
    'value2',
    'z',
    1,
    2,
    'DESC',
    'value'
  );
  t.is(offsetted.items.length, 2);
  t.deepEqual(pluck(offsetted.items, 'id'), ['0', '2']);
  t.is(offsetted.totalItems, 4);
});

test('find all active returns an empty array if the table is empty', async t => {
  t.plan(2);

  const results = await findAllActiveRows(client, TABLE_NAME);
  t.is(results.length, 0);
  t.deepEqual(results, []);
});

test('find all active returns all active rows in the table', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'b', null), (1, 'c', null), (2, 'a', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const activeRows = await findAllActiveRows(client, TABLE_NAME);
  t.is(activeRows.length, 3);
  t.deepEqual(pluck(activeRows, 'id'), ['0', '1', '2']);
});

test('find all active returns ordered results', async t => {
  t.plan(4);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'b', null), (1, 'c', null), (2, 'a', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const orderedAsc = await findAllActiveRows(
    client,
    TABLE_NAME,
    undefined,
    'value'
  );
  t.is(orderedAsc.length, 3);
  t.deepEqual(pluck(orderedAsc, 'id'), ['2', '0', '1']);

  const orderedDesc = await findAllActiveRows(
    client,
    TABLE_NAME,
    undefined,
    'value',
    'DESC'
  );
  t.is(orderedDesc.length, 3);
  t.deepEqual(pluck(orderedDesc, 'id'), ['1', '0', '2']);
});

test('find all active returns limited results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'b', null), (1, 'c', null), (2, 'a', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const limited = await findAllActiveRows(client, TABLE_NAME, 2);
  t.is(limited.length, 2);
  t.deepEqual(pluck(limited, 'id'), ['0', '1']);
});

test('find all active returns offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'b', null), (1, 'c', null), (2, 'a', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const offsetted = await findAllActiveRows(
    client,
    TABLE_NAME,
    2,
    undefined,
    undefined,
    1
  );
  t.is(offsetted.length, 2);
  t.deepEqual(pluck(offsetted, 'id'), ['1', '2']);
});

test('find all active returns ordered, limited, offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'b', null), (1, 'c', null), (2, 'a', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const offsetted = await findAllActiveRows(
    client,
    TABLE_NAME,
    1,
    'value',
    'DESC',
    2
  );
  t.is(offsetted.length, 1);
  t.deepEqual(pluck(offsetted, 'id'), ['2']);
});

test('find all active where column equals value returns an empty array if the table is empty', async t => {
  t.plan(2);

  const all = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(all.length, 0);
  t.deepEqual(all, []);
});

test('find all active where column equals value returns an empty array if no match exists', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'a', null), (1, 'b', null), (2, 'c', null), (3, 'd', '2018-01-01T00:00:00.000Z')
  `);

  const all = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'd'
  );
  t.is(all.length, 0);
  t.deepEqual(all, []);
});

test('find all active where column equals value returns all matching rows', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, deleted_at) VALUES (0, 'a', null), (1, 'b', null), (2, 'a', null), (3, 'a', '2018-01-01T00:00:00.000Z')
  `);

  const all = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value',
    'a'
  );
  t.is(all.length, 2);
  t.deepEqual(pluck(all, 'id'), ['0', '2']);
});

test('find all active where column equals value returns all rows matching on FLOAT value', async t => {
  t.plan(2);

  await client.query(`
      INSERT INTO ${TABLE_NAME}
      (id, precise_number, deleted_at) VALUES (0, 1, null), (1, .999999, null), (2, 0.999999, null), (3, 0.999999, '2018-01-01T00:00:00.000Z')
    `);

  const all = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'precise_number',
    '.999999'
  );
  t.deepEqual(all.length, 2);
  t.deepEqual(pluck(all, 'id'), ['1', '2']);
});

test('find all active where column equals value returns ordered results', async t => {
  t.plan(4);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2, deleted_at) VALUES (0, 'b', 'z', null), (1, 'c', 'z', null), (2, 'a', 'z', null), (3, 'd', 'x', null), (4, 'e', 'z', '2018-01-01T00:00:00.000Z')
  `);

  const orderedAsc = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    undefined,
    'value'
  );
  t.is(orderedAsc.length, 3);
  t.deepEqual(pluck(orderedAsc, 'id'), ['2', '0', '1']);

  const orderedDesc = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    undefined,
    'value',
    'DESC'
  );
  t.is(orderedDesc.length, 3);
  t.deepEqual(pluck(orderedDesc, 'id'), ['1', '0', '2']);
});

test('find all active where column equals value returns limited results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2, deleted_at) VALUES (0, 'b', 'z', null), (1, 'c', 'z', null), (2, 'a', 'z', null), (3, 'd', 'x', null), (4, 'e', 'z', '2018-01-01T00:00:00.000Z')
  `);

  const limited = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    2
  );
  t.is(limited.length, 2);
  t.deepEqual(pluck(limited, 'id'), ['0', '1']);
});

test('find all active where column equals value returns offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2, deleted_at) VALUES (0, 'b', 'z', null), (1, 'c', 'z', null), (2, 'a', 'z', null), (3, 'd', 'x', null), (4, 'e', 'z', '2018-01-01T00:00:00.000Z')
  `);

  const offsetted = await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    2,
    undefined,
    undefined,
    1
  );
  t.is(offsetted.length, 2);
  t.deepEqual(pluck(offsetted, 'id'), ['1', '2']);
});

test('find all active where column equals value returns ordered, limited, offsetted results', async t => {
  t.plan(2);

  await client.query(`
    INSERT INTO ${TABLE_NAME}
    (id, value, value2, deleted_at) VALUES (0, 'b', 'z', null), (1, 'c', 'z', null), (2, 'a', 'z', null), (3, 'd', 'x', null), (4, 'e', 'z', '2018-01-01T00:00:00.000Z')
  `);

  const offsetted = await await findAllActiveRowsWhereColumnEqualsValue(
    client,
    TABLE_NAME,
    'value2',
    'z',
    1,
    'value',
    'DESC',
    2
  );
  t.is(offsetted.length, 1);
  t.deepEqual(pluck(offsetted, 'id'), ['2']);
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
