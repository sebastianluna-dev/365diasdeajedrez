// Stable codes of «Jugar»: the games played on the platform, against a bot
// today and against a person later.

/**
 * How a played game ended. The board decides the first five, a person the
 * rest:
 *
 * - `RESIGNATION`: «Abandonar» was pressed; a loss for whoever pressed it.
 * - `ABANDONED`: a real game (two or more moves of one's own) left for a new
 *   one; a loss.
 * - `ABORTED`: closed before either side had played two moves; it has no
 *   result.
 * - `TIMEOUT` and `DRAW_AGREED`: only between people, with a clock; they exist
 *   from the start so that day needs no migration.
 */
export const GAME_TERMINATION = {
  CHECKMATE: "CHECKMATE",
  STALEMATE: "STALEMATE",
  INSUFFICIENT_MATERIAL: "INSUFFICIENT_MATERIAL",
  THREEFOLD_REPETITION: "THREEFOLD_REPETITION",
  FIFTY_MOVES: "FIFTY_MOVES",
  RESIGNATION: "RESIGNATION",
  ABANDONED: "ABANDONED",
  ABORTED: "ABORTED",
  TIMEOUT: "TIMEOUT",
  DRAW_AGREED: "DRAW_AGREED",
} as const;

export type GameTerminationCode = (typeof GAME_TERMINATION)[keyof typeof GAME_TERMINATION];

/** What each ending is called, as the catalog's label says it. */
export const GAME_TERMINATION_LABELS: Record<GameTerminationCode, string> = {
  CHECKMATE: "Jaque mate",
  STALEMATE: "Ahogado",
  INSUFFICIENT_MATERIAL: "Material insuficiente",
  THREEFOLD_REPETITION: "Triple repetición",
  FIFTY_MOVES: "Cincuenta jugadas",
  RESIGNATION: "Abandono",
  ABANDONED: "Abandonada",
  ABORTED: "Anulada",
  TIMEOUT: "Tiempo agotado",
  DRAW_AGREED: "Tablas acordadas",
};
