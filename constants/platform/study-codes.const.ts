// Stable codes of the "Mis estudios" catalogs (GameDatabase / Game).

/**
 * The four study kinds. What can be done with each is NOT here but in
 * services/studies/study-rules.ts: this is only the catalog.
 *
 * - `MY_GAMES`: created with the account, there is exactly one and it is not deleted.
 * - `TOURNAMENT`: the games the student played in one competition.
 * - `STUDY`: free material the student gathers to analyse.
 * - `COLLECTION`: content that REACHES them — from a course or a teacher — and
 *   is read-only for them.
 */
export const DATABASE_KIND = {
  MY_GAMES: "MY_GAMES",
  TOURNAMENT: "TOURNAMENT",
  STUDY: "STUDY",
  COLLECTION: "COLLECTION",
} as const;

export type DatabaseKindCode = (typeof DATABASE_KIND)[keyof typeof DATABASE_KIND];

export const GAME_SOURCE = {
  MANUAL: "MANUAL",
  PGN_IMPORT: "PGN_IMPORT",
  PLATFORM_GAME: "PLATFORM_GAME",
} as const;

export type GameSourceCode = (typeof GAME_SOURCE)[keyof typeof GAME_SOURCE];

/** The catalog label carries the PGN token ("1-0", "0-1", "1/2-1/2", "*"). */
export const GAME_RESULT = {
  WHITE_WINS: "WHITE_WINS",
  BLACK_WINS: "BLACK_WINS",
  DRAW: "DRAW",
  ONGOING: "ONGOING",
} as const;

export type GameResultCode = (typeof GAME_RESULT)[keyof typeof GAME_RESULT];

/** PGN token → GameResult catalog code (for importers and seeds). */
export const GAME_RESULT_BY_PGN_TOKEN: Record<string, GameResultCode> = {
  "1-0": GAME_RESULT.WHITE_WINS,
  "0-1": GAME_RESULT.BLACK_WINS,
  "1/2-1/2": GAME_RESULT.DRAW,
  "*": GAME_RESULT.ONGOING,
};
