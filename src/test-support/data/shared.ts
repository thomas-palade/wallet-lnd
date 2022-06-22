import { CURRENCIES } from '../../enums';
import { randomUUID, randomDate } from "../../lib/randoms/random";

export const CREATED_AT = randomDate();
export const ID = randomUUID();
export const PLAYER_ID_X = randomUUID();
export const UPDATED_AT = randomDate();
export const CURRENCY = CURRENCIES.SWEEPS;