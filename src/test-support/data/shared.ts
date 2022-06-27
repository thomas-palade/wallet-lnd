import { CURRENCIES } from '../../enums';
import { randomUUID, randomDate, randomInteger } from "../../lib/helpers/random";

export const CREATED_AT = randomDate();
export const ID = randomInteger();
export const COINS = 5000;
export const PLAYER_ID = randomUUID();
export const UPDATED_AT = randomDate();
export const CURRENCY = CURRENCIES.SWEEPS;