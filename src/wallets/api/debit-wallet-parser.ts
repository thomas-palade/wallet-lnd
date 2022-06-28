import { Request } from 'express';
import { PoolClient } from 'pg';
import { toFailure, toSuccess } from '../../lib/helpers/error';

import { DEBIT_WALLET_SCHEMA } from '../schemas';
import { findWalletById } from '../wallet';

export const parseDebitWallet = async (
  client: PoolClient,
  request: Request
): Promise<Either<Error, DebitWallet>> => {
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

  const wallet = await findWalletById(client, Number(request.params.walletId));
  return toSuccess(200, wallet);
};