import test from 'ava';

import { randomDate, randomInteger,  randomUUID, isValidDateString, UUID_REGEXP } from './random';

test('When `randomInteger` is called, Then it returns a random integer between `0` and `max`', (t) => {
  t.is(typeof randomInteger(), 'number');
  t.true(randomInteger() >= 0);
  t.true(randomInteger() <= Number.MAX_SAFE_INTEGER);

  t.is(typeof randomInteger(1), 'number');
  t.true(randomInteger(1) >= 0);
  t.true(randomInteger(1) <= 1);
});
test('When `randomDate` is called, Then it returns a random date in the past', (t) => {
  t.true(isValidDateString(randomDate().toISOString()));
  t.true(randomDate().getTime() < Date.now());
});
test('When `randomDate` is called with a timestamp, Then it returns a random date before that timestamp', (t) => {
  t.true(isValidDateString(randomDate(5).toISOString()));
  t.true(randomDate(5).getTime() < 5);
});
test('When `randomUUID` is called, Then it returns a valid UUID', (t) => {
  const regexp = new RegExp(UUID_REGEXP, 'i');
  t.true(regexp.test(randomUUID()));
});