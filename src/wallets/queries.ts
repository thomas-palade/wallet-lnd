import { TABLES } from '../enums';

export const DELETE_WALLET_BY_ID = `
  DELETE FROM ${TABLES.WALLETS}
  WHERE id = $1`;

export const DELETE_ALL_WALLETS = `DELETE FROM ${TABLES.WALLETS}`;

export const INSERT_WALLET = `
  INSERT INTO ${TABLES.WALLETS} (coins)
  VALUES ($1)
  RETURNING *`;

export const SELECT_ALL_WALLETS = `
  SELECT *
  FROM ${TABLES.WALLETS}
  ORDER BY created_at DESC`;

export const SELECT_WALLET_BY_ID = `
  SELECT *
  FROM ${TABLES.WALLETS}
  WHERE id = $1
  LIMIT 1`;

export const UPDATE_WALLET_BY_ID = `
  UPDATE ${TABLES.WALLETS}
  SET
    coin = $1  
    WHERE id = $2
  RETURNING *`;
