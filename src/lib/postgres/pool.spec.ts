import test from 'ava';
import { Pool, PoolClient } from 'pg';

import { close, getClient, getNewPool } from './pool';

test('When `close` is called with an existing Pool Then it does not throw an error', t => {
  t.plan(1);

  const pool = getNewPool();
  t.notThrows(() => close(pool));
});
test('When `close` is called without an existing Pool Then it does not throw an error', t => {
  t.plan(1);

  t.notThrows(close);
});

test("When `getClient` is called with an existing Pool Then it returns the Pool's `connect` response", async t => {
  t.plan(1);

  const expected = ({ foo: 'bar' } as unknown) as PoolClient;
  const pool = ({
    connect: () => expected
  } as unknown) as Pool;
  t.is(await getClient(pool), expected);
});
