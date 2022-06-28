import { Request } from 'express';
import { toFailure, toSuccess } from '../../lib/helpers/error';

import { CREDIT_WALLET } from '../schemas';

export const parseCreditWallet = (
  request: Request
): Either<Error, CreditWallet> => {
  // `safeParse` validates without throwing errors: https://www.npmjs.com/package/zod#safeparse
  const body = request.body;
  const maybeCreditWalletPayload = CREDIT_WALLET.safeParse(body);
  if (!maybeCreditWalletPayload.success) {
    return toFailure(
      400,
      `this is a parsing error`,
      new Error('CreditWallet')
    );
  }
  
  return toSuccess(200, maybeCreditWalletPayload.data);
};
