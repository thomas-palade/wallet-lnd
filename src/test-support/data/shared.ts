import { CURRENCIES } from '../../enums';
import { randomDate, randomInteger } from "../../lib/helpers/random";

export const CREATED_AT = randomDate();
export const ID = randomInteger();
export const COINS = 5000;
export const UPDATED_AT = randomDate();
export const CURRENCY = CURRENCIES.SWEEPS;