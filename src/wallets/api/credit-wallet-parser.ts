import { Request } from 'express';
import { PoolClient } from 'pg';
import { toFailure, toSuccess } from '../../lib/helpers/error';

import { CREDIT_WALLET_SCHEMA } from '../schemas';
import { findWalletById } from '../wallet';

export const parseCreditWallet = async (
  client: PoolClient,
  request: Request
): Promise<Either<Error, CreditWallet>> => {
  // `safeParse` validates without throwing errors: https://www.npmjs.com/package/zod#safeparse
  const body = request.body;
  const maybeCreditWalletPayload = CREDIT_WALLET_SCHEMA.safeParse(body);
  if (!maybeCreditWalletPayload.success) {
    return toFailure(
      400,
      `this is a parsing error`,
      new Error('CreditWallet')
    );
  }

  const wallet = await findWalletById(client, Number(request.params.walletId));
  return toSuccess(200, wallet);
};
