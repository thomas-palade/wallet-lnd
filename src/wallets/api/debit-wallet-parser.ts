import { Request } from 'express';
import { toFailure, toSuccess } from '../../lib/helpers/error';

import { DEBIT_WALLET_SCHEMA } from '../schemas';

export const parseDebitWallet = (
  request: Request
): Either<Error, DebitWallet> => {
  // `safeParse` validates without throwing errors: https://www.npmjs.com/package/zod#safeparse
  const body = request.body;
  const maybeDebitWalletPayload = DEBIT_WALLET_SCHEMA.safeParse(body);
  if (!maybeDebitWalletPayload.success) {
    return toFailure(
      400,
      `this is a parsing error`,
      new Error('DebitWallet')
    );
  }

  return toSuccess(200, maybeDebitWalletPayload.data);
};