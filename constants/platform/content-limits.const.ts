// Caps on chess content, shared by the student's game import and by the
// staff lesson editor: the same data (a PGN) cannot have two limits depending
// on who writes it.

/** A tournament PGN file can bring thousands of games: 2 MB ceiling. */
export const PGN_MAX_LENGTH = 2_000_000;

/** Games accepted from a single import. */
export const PGN_MAX_GAMES = 500;

/**
 * Options of the transaction that saves and indexes an import. By default
 * Prisma cuts an interactive transaction at 5 s, and five hundred games are
 * about fifteen hundred round trips to the database (a `create` plus the
 * deletion and insertion of ~80 positions per game): the tournament PGN the
 * cap above allows for blows up with P2028 and is rolled back whole. Two
 * minutes cover that case with margin; `maxWait` is how long to wait for a connection.
 */
export const PGN_IMPORT_TRANSACTION = { maxWait: 5_000, timeout: 120_000 } as const;
