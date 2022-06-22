import { Pool, PoolClient } from 'pg';

const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const host = process.env.DATABASE_HOST;
const database = process.env.DATABASE_NAME;
const port = Number(process.env.DATABASE_PORT);
const max = Number(process.env.POSTGRES_MAX || '800');

export const getNewPool = (): Pool =>
  new Pool({
    database,
    host,
    max,
    password,
    port,
    user
  });

const pool = getNewPool();

export const close = (p: Pool | null = null): Promise<void> => {
  return (p || pool).end();
};

export const getClient = async (p: Pool | null = null): Promise<PoolClient> => {
  return (p || pool).connect();
};

export default pool;
