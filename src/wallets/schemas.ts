import { z } from 'zod';

export const GET_WALLET_SCHEMA = z
  .object({
    seatValues: z
      .array(
        z.object({
          hand: z.number(),
        })
      )
      .nonempty(),
  })
  .strict();

export const CREDIT_WALLET_SCHEMA = z
  .object({
    seatValues: z
      .array(
        z.object({
          hand: z.number(),
        })
      )
      .nonempty(),
  })
  .strict();

export const DEBIT_WALLET_SCHEMA = z
  .object({
    seatValues: z
      .array(
        z.object({
          hand: z.number(),
        })
      )
      .nonempty(),
  })
  .strict();