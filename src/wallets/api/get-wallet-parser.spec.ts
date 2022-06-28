import test, { ExecutionContext } from 'ava';
import { Request } from 'express';
import { close, getClient, getNewPool } from 'lls-lib-postgres';
import { PoolClient } from 'pg';
import { deleteAllTables } from '../test-support/database';
import { parseGameAdvance, parseGameResolution, parsePostGame } from './credit-wallet-parser';

let client: PoolClient;
const pool = getNewPool();

test.beforeEach(async () => {
  client = await getClient(pool);
});

test.afterEach(async () => {
  await deleteAllTables(client);
  client.release();
});

test.after(() => {
  close(pool);
});

const invalidTypePostGameMacro = async (
  t: ExecutionContext<unknown>,
  field: string,
  replacement: unknown,
  message: string
) => {
  const request = {
    body: {
      ...POST_GAME_REQUEST.body,
      [field]: replacement,
    },
  } as Request;
  t.deepEqual(parsePostGame(request), toFailure(400, message));
};

test('When `parsePostGame` is called, Then it returns a `GameCreation`', async (t) => {
  const maybeGameCreation = parsePostGame(POST_GAME_REQUEST as Request);
  t.true(maybeGameCreation.ok);
  t.deepEqual(
    (maybeGameCreation as Success<GameCreation>).value,
    GAME_CREATION
  );
});

test(
  'When `parsePostGame` is called with a request containing an invalid `currency`, Then it returns an `ErrorResponse`',
  invalidTypePostGameMacro,
  GAME_CREATION_FIELDS.CURRENCY,
  'invalid_currency',
  `G00: \`currency\`: Invalid enum value. Expected 'Gold' | 'Sweeps'`
);

test(
  'When `parsePostGame` is called with a request containing too many seatValues, Then it returns an `ErrorResponse`',
  invalidTypePostGameMacro,
  GAME_CREATION_FIELDS.SEAT_VALUES,
  [
    { hand: 1000, bonus: 1000 },
    { hand: 1000, bonus: 1000 },
    { hand: 1000, bonus: 1000 },
    { hand: 1000, bonus: 1000 },
  ],
  `G01: \`seatValues\`: Must contain exactly 3 items.`
);

test(
  'When `parsePostGame` is called with a request containing an empty array as handValues, Then it returns an `ErrorResponse`',
  invalidTypePostGameMacro,
  GAME_CREATION_FIELDS.SEAT_VALUES,
  [],
  `G00: \`seatValues\`: Array must contain at least 1 element(s)`
);

test('When `parsePostGame` is called with an array of bonusValues placed on indexes where the handValues have not been placed, Then it returns an `ErrorResponse`', async (t) => {
  t.deepEqual(
    parsePostGame({
      body: {
        ...POST_GAME_REQUEST.body,
        seatValues: [
          { hand: 1000, bonus: 100 },
          { hand: 0, bonus: 2000 },
          { hand: 2000, bonus: 200 },
        ],
      },
    } as Request),
    toFailure(
      400,
      `G02: \`bonusValues\`: You are not allowed to place a bonus value without placing a hand value on the same seat.`
    )
  );
});

test('When `parsePostGame` is called with all hand play values as zero, Then it returns an `ErrorResponse`', async (t) => {
  t.deepEqual(
    parsePostGame({
      body: {
        ...POST_GAME_REQUEST.body,
        seatValues: [
          { hand: 0, bonus: 100 },
          { hand: 0, bonus: 4000 },
          { hand: 0, bonus: 200 },
        ],
      },
    } as Request),
    toFailure(
      400,
      `G05: \`handValues\`: All hand values are 0. At least one hand value must be greater than 0`
    )
  );
});

test('When `parsePostGame` is called with an array of hand values and bonus values where there is a bonus value placed on a seat where there is no hand value, Then it returns an `ErrorResponse`', async (t) => {
  t.deepEqual(
    parsePostGame({
      body: {
        ...POST_GAME_REQUEST.body,
        seatValues: [
          { hand: 100, bonus: 100 },
          { hand: 0, bonus: 0 },
          { hand: 0, bonus: 1000 },
        ],
      },
    } as Request),
    toFailure(
      400,
      `G02: \`bonusValues\`: You are not allowed to place a bonus value without placing a hand value on the same seat.`
    )
  );
});

test('When `parsePostGame` is called with an array of hand values containing incorrect value values, Then it returns an `ErrorResponse`', async (t) => {
  t.deepEqual(
    parsePostGame({
      body: {
        ...POST_GAME_REQUEST.body,
        seatValues: [
          { hand: 1234, bonus: 1 },
          { hand: 0, bonus: 0 },
          { hand: 100, bonus: 10 },
        ],
      },
    } as Request),
    toFailure(400, `G04: \`handValues\`: The chosen hand values are incorrect.`)
  );
});

test('When `parsePostGame` is called with an array of bonus values and hand values where a bonus value is bigger than its corespondent hand value, Then it returns an `ErrorResponse`', async (t) => {
  t.deepEqual(
    parsePostGame({
      body: {
        ...POST_GAME_REQUEST.body,
        seatValues: [
          { hand: 0, bonus: 0 },
          { hand: 0, bonus: 0 },
          { hand: 1000, bonus: 2000 },
        ],
      },
    } as Request),
    toFailure(
      400,
      `G03: \`bonusValues\`: The bonus value is bigger than the hand value.`
    )
  );
});

test('When `parseGameResolution` is called, Then it returns a `GameAndHandsWithActionStackAndBonusGamesWinnings`', async (t) => {
  const { id: gameId } = await createGame(
    client,
    CURRENCY,
    PLAYER_ID_X,
    SHUFFLED_DECK_INDEX,
    SHUFFLED_DECK,
    DEALER_CARDS,
    TOTAL_PLAY_VALUE
  );
  await createInitialHands(client, SHUFFLED_DECK, [10, 20, 30], gameId);
  await createBonusGame(
    client,
    PLAYER_ID_X,
    gameId,
    BONUS_PLAY_VALUE,
    CURRENCY,
    200,
    [POKER_HANDS.FLUSH],
    [10],
    [20],
    [200],
    0
  );
  const maybeGameAndHandsWithActionStackAndBonusGamesWinnings =
    await parseGameResolution(client, {
      params: { gameId },
    } as unknown as Request);
  t.true(maybeGameAndHandsWithActionStackAndBonusGamesWinnings.ok);
  const game = (
    await findLatestGameAndBonusWinningsByPlayerId(client, PLAYER_ID_X)
  ).game as Game;
  const hands = await findHandsByGameId(client, game.id);
  t.deepEqual(
    (
      maybeGameAndHandsWithActionStackAndBonusGamesWinnings as Success<GameAndHandsWithActionStackAndBonusGamesWinnings>
    ).value,
    {
      game,
      hands: hands.map((hand) => ({ ...hand, actionStack: [] })),
      bonusGamesWinnings: 200,
    }
  );
});

test('When `parseGameResolution` is called with an invalid `gameId`, Then it returns an `ErrorResponse`', async (t) => {
  const maybeGameAdvance = await parseGameResolution(client, {
    params: { gameId: 'invalid_uuid' },
  } as unknown as Request);
  t.deepEqual(maybeGameAdvance, toFailure(400, 'G00: `gameId`: Invalid uuid'));
});

test('Given the game does not exist, When `parseGameResolution` is called with an invalid `gameId`, Then it returns an `ErrorResponse`', async (t) => {
  const maybeGameResolution = await parseGameResolution(client, {
    params: { gameId: GAME_ID },
  } as unknown as Request);
  t.deepEqual(
    maybeGameResolution,
    toFailure(
      404,
      'C08: Could not find any game instance for provided playerId or gameId'
    )
  );
});

test('Given an existing game with no hands, When `parseGameResolution` is called, Then it returns an `ErrorResponse`', async (t) => {
  const { id: gameId } = await createGame(
    client,
    CURRENCY,
    PLAYER_ID_X,
    SHUFFLED_DECK_INDEX,
    SHUFFLED_DECK,
    DEALER_CARDS,
    TOTAL_PLAY_VALUE
  );
  const maybeGameResolution = await parseGameResolution(client, {
    params: { gameId },
  } as unknown as Request);
  t.deepEqual(
    maybeGameResolution,
    toFailure(
      404,
      'C10: Could not find the hands for provided playerId or gameId'
    )
  );
});

test('When `parseGameAdvance` is called, Then it returns a `GameAndHandsWithActionStackAndBonusGamesWinnings`', async (t) => {
  const { id: gameId } = await createGame(
    client,
    CURRENCY,
    PLAYER_ID_X,
    SHUFFLED_DECK_INDEX,
    SHUFFLED_DECK,
    DEALER_CARDS,
    TOTAL_PLAY_VALUE
  );
  await createInitialHands(client, SHUFFLED_DECK, [10, 20, 30], gameId);
  await createBonusGame(
    client,
    PLAYER_ID_X,
    gameId,
    BONUS_PLAY_VALUE,
    CURRENCY,
    200,
    [POKER_HANDS.FLUSH],
    [10],
    [20],
    [200],
    0
  );
  const maybeGameAndHandsWithActionStackAndBonusGamesWinnings =
    await parseGameAdvance(client, {
      params: { gameId },
    } as unknown as Request);
  t.true(maybeGameAndHandsWithActionStackAndBonusGamesWinnings.ok);
  const game = (
    await findLatestGameAndBonusWinningsByPlayerId(client, PLAYER_ID_X)
  ).game as Game;
  const hands = await findHandsByGameId(client, game.id);
  t.deepEqual(
    (
      maybeGameAndHandsWithActionStackAndBonusGamesWinnings as Success<GameAndHandsWithActionStackAndBonusGamesWinnings>
    ).value,
    {
      game,
      hands: hands.map((hand) => ({ ...hand, actionStack: [] })),
      bonusGamesWinnings: 200,
    }
  );
});

test('When `parseGameAdvance` is called with an invalid `gameId`, Then it returns an `ErrorResponse`', async (t) => {
  const maybeGameAdvance = await parseGameAdvance(client, {
    params: { gameId: 'invalid_uuid' },
  } as unknown as Request);
  t.deepEqual(maybeGameAdvance, toFailure(400, 'G00: `gameId`: Invalid uuid'));
});

test('Given the game does not exist, When `parseGameAdvance` is called with an invalid `gameId`, Then it returns an `ErrorResponse`', async (t) => {
  const maybeGameResolution = await parseGameAdvance(client, {
    params: { gameId: GAME_ID },
  } as unknown as Request);
  t.deepEqual(
    maybeGameResolution,
    toFailure(
      404,
      'C08: Could not find any game instance for provided playerId or gameId'
    )
  );
});

test('Given an existing game with no hands, When `parseGameAdvance` is called, Then it returns an `ErrorResponse`', async (t) => {
  const { id: gameId } = await createGame(
    client,
    CURRENCY,
    PLAYER_ID_X,
    SHUFFLED_DECK_INDEX,
    SHUFFLED_DECK,
    DEALER_CARDS,
    TOTAL_PLAY_VALUE
  );
  const maybeGameResolution = await parseGameAdvance(client, {
    params: { gameId },
  } as unknown as Request);
  t.deepEqual(
    maybeGameResolution,
    toFailure(
      404,
      'C10: Could not find the hands for provided playerId or gameId'
    )
  );
});
