import { z } from 'zod';

const UUID_SCHEMA = z.string().uuid();

export const GET_WALLET_SCHEMA = z
  .object({
    body: z.object({}).strict(),
    walletId: UUID_SCHEMA
  })
  .strict();

export const CREDIT_WALLET_SCHEMA = z
  .object({
    body: z.object({
      transactionId: z.string(),
      coins: z.number(),
    }).strict(),
    walletId: UUID_SCHEMA
  }).strict();

  export const DEBIT_WALLET_SCHEMA = z
  .object({
    body: z.object({
      transactionId: z.string(),
      coins: z.number(),
    }).strict(),
    walletId: UUID_SCHEMA
  }).strict();