import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';
import { parseGetWallet } from './get-wallet-parser';

export const getWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  try {
    const maybeWallet = await parseGetWallet(client, req);
    if (!maybeWallet.ok) {
      res.status(400).send({
        message: maybeWallet.error.message
      })
      return;
    }
    const wallet = maybeWallet.value;
    res.status(200).send({
      transactionId: wallet.transactionId,
      coins: wallet.coins
    });
    return;
  } catch (err) {
    console.log(`error:` + err.message);
    res.status(500).send({});
  } finally {
    client.release();
  }
};
