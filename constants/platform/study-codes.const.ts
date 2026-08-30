// Codes estables de los catálogos de «Mis estudios» (GameDatabase / Game).

export const DATABASE_KIND = {
  MY_GAMES: "MY_GAMES",
  REPERTOIRE: "REPERTOIRE",
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

/** El label del catálogo lleva el token PGN ("1-0", "0-1", "1/2-1/2", "*"). */
export const GAME_RESULT = {
  WHITE_WINS: "WHITE_WINS",
  BLACK_WINS: "BLACK_WINS",
  DRAW: "DRAW",
  ONGOING: "ONGOING",
} as const;

export type GameResultCode = (typeof GAME_RESULT)[keyof typeof GAME_RESULT];

/** Token PGN → code del catálogo GameResult (para importadores y seeds). */
export const GAME_RESULT_BY_PGN_TOKEN: Record<string, GameResultCode> = {
  "1-0": GAME_RESULT.WHITE_WINS,
  "0-1": GAME_RESULT.BLACK_WINS,
  "1/2-1/2": GAME_RESULT.DRAW,
  "*": GAME_RESULT.ONGOING,
};
