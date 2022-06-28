import { Request } from 'express';
import { toFailure, toSuccess } from '../../lib/helpers/error';

import { GET_WALLET_SCHEMA } from '../schemas';

export const parseGetWallet = (
  request: Request
): Either<Error, GetWallet> => {
  // `safeParse` validates without throwing errors: https://www.npmjs.com/package/zod#safeparse
  const body = request.body;
  const maybeGetWalletPayload = GET_WALLET_SCHEMA.safeParse(body);
  if (!maybeGetWalletPayload.success) {
    return toFailure(
      400,
      `this is a parsing error`,
      new Error('GetWallet')
    );
  }

  return toSuccess(200, maybeGetWalletPayload.data);
};
