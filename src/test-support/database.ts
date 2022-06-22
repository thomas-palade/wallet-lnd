
import { PoolClient } from 'pg';

import { TABLES } from '../enums';
import { deleteAll } from '../lib/postgres/queries/delete';

export const deleteAllTables = async (client: PoolClient) => {
  await deleteAll(client, TABLES.WALLETS);
};
