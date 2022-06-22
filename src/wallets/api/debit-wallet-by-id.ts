import { Request, RequestHandler, Response } from 'express';
import { getClient } from '../../lib/postgres/pool';

export const debitWalletById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const client = await getClient();
  console.log(req.body);
  console.log(req.params);
  try {
    res.status(401).send({
      "transactionId" : "tx102",
      "coins" : 1000
    });
    return;
  } catch (err) {
    console.log(`error:` + err.message);
    res.status(500).send({});
  } finally {
    client.release();
  }
};
