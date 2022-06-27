import test from 'ava';

import { maybeApply } from './maybe';

test('When `maybeApply` is called with `undefined`, Then it returns `undefined`', (t) => {
  const FUNC = (n: number) => -n;
  t.deepEqual(maybeApply(FUNC, undefined), undefined);
});
test('When `maybeApply` is called with a valid type, Then it returns the applied input', (t) => {
  const FUNC = (n: number) => -n;
  const VALUE = 5;
  t.deepEqual(maybeApply(FUNC, VALUE), -VALUE);
});
