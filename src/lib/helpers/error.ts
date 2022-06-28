export const FAILURE: Pick<Failure<unknown>, 'ok'> = { ok: false };
export const SUCCESS: Pick<Success<unknown>, 'ok'> = { ok: true };

export const toFailure = (
  status: number,
  message: string,
  cause?: Error
): Failure<Error> => ({
  ...FAILURE,
  status,
  error: new Error(message),
});

export const toSuccess = <T>(status: number, value: T): Success<T> => ({
  ...SUCCESS,
  status,
  value,
});