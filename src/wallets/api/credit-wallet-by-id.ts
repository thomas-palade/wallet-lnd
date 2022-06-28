import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';
import { createWallet, findWalletById, updateWallet } from '../wallet';

export const creditWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  try {
    const wallet = await findWalletById(client, Number(req.params.walletId));
    const { coins, transactionId } = req.body;
    if (!wallet) {
      const createdWallet = await createWallet(client, coins, transactionId);
      res.status(200).send({
        transactionId: createdWallet.transactionId,
        coins: createdWallet.coins
      });
      return;
    }
    const updatedWallet = await updateWallet(client, {
      ...wallet,
      coins: wallet.coins + coins,
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
