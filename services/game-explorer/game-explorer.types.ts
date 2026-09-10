import type { GameOriginCode } from "@/services/shared/game-origin";

/** A continuation played from the searched position. */
export interface ExplorerNextMove {
  san: string;
  uci: string;
  /** Times it was played among the visible games. */
  count: number;
  /** Percentage over the total of listed continuations; they add up to 100. */
  percentage: number;
}

export interface ExplorerGame {
  id: string;
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  /** PGN token of the result: "1-0", "0-1", "1/2-1/2", "*". */
  resultLabel: string;
  playedAtLabel?: string;
  event?: string;
  /** Where the game comes from (student study, course, teaching staff). */
  origin: GameOriginCode;
  originLabel: string;
  /** Additionally, it was discussed in a class the searcher attended. */
  seenInClass: boolean;
  /** Where the searcher can open it; absent when they have no view of it. */
  href?: string;
}

export interface PositionSearchResult {
  /** Visible games that went through the position. It can exceed `games`. */
  totalGames: number;
  nextMoves: ExplorerNextMove[];
  /** Capped sample of games, most recent first. */
  games: ExplorerGame[];
}

/**
 * Filters of the search. Today only the origin is used; the rest of the
 * signature exists so that adding student, colour, Elo or date does not force
 * redoing the service.
 */
export interface PositionSearchFilters {
  origins?: GameOriginCode[];
}
