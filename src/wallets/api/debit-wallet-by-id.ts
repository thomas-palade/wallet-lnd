import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';
import { findWalletById, updateWallet } from '../wallet';

export const debitWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  try {
    const wallet = await findWalletById(client, Number(req.params.walletId));
    const { coins, transactionId } = req.body;
    if (!wallet) {
      res.status(404).send({});
      return;
    }
    if (coins > wallet.coins) {
      console.log(`error: trying to debit more than is available`);
      res.status(400).send({});
      return;
    }
    const updatedWallet = await updateWallet(client, {
      ...wallet,
      coins: wallet.coins - coins,
      transactionId: transactionId
    });
    res.status(201).send({
      transactionId: updatedWallet.transactionId,
      coins: updatedWallet.coins
    });
    return;
  } catch (err) {
    console.log(`error:` + err.message);
    res.status(500).send({});
  } finally {
    client.release();
  }
};
