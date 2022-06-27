import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';
import { findWalletById } from '../wallet';

export const getWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  try {
    const wallet = await findWalletById(client, req.body.id);
    if (!wallet) {
      res.status(404).send({});
      return;
    }
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
