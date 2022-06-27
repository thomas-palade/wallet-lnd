import { PoolClient } from "pg";

export const dropTableWithTableName = async (client: PoolClient, TABLE: string) => {
  return client.query(`
    DROP TABLE IF EXISTS ${TABLE} CASCADE;
  `);
};

export const createTableWithTableName = async (client: PoolClient, TABLE: string) => {
  return client.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id BIGINT,
      value TEXT,
      value2 TEXT,
      deleted_at TIMESTAMP,
      precise_number FLOAT                                         
    );
    TRUNCATE ${TABLE}
  `);
};