import test from 'ava';
import {
  toFailure,
  toSuccess,
} from './error';


test('When `toFailure` is called with an object T, Then it returns an object of type Failure<T>', (t) => {
  const res = toFailure(400, 'error message');
  t.deepEqual(res, {
    ok: false,
    status: 400,
    error: new Error('error message'),
  });
});

test('When `toSuccess` is called with an object T, Then it returns an object of type Success<T>', (t) => {
  const res = toSuccess(200, { message: 'expected data' });
  t.deepEqual(res, {
    ok: true,
    status: 200,
    value: { message: 'expected data' },
  });
});