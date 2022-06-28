import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';
import { createWallet, updateWallet } from '../wallet';
import { parseCreditWallet } from './credit-wallet-parser';

export const creditWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  try {
    const maybeWallet = await parseCreditWallet(client, req);
    if (!maybeWallet.ok) {
      res.status(400).send({
        message: maybeWallet.error.message
      })
      return;
    }

    const wallet = maybeWallet.value;
    const { coins, transactionId } = wallet;

    if (!wallet) {
      const createdWallet = await createWallet(client, coins, transactionId);
      res.status(201).send({
        transactionId: createdWallet.transactionId,
        coins: createdWallet.coins
      });
      return;
    }
    if (wallet.transactionId === transactionId) {
      res.status(202).send({
        transactionId: wallet.transactionId,
        coins: wallet.coins
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
