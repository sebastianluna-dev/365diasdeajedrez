import type { GameOriginCode } from "@/services/shared/game-origin";

/** Una continuación jugada desde la posición buscada. */
export interface ExplorerNextMove {
  san: string;
  uci: string;
  /** Veces que se jugó entre las partidas visibles. */
  count: number;
  /** Porcentaje sobre el total de continuaciones listadas; suman 100. */
  percentage: number;
}

export interface ExplorerGame {
  id: string;
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  /** Token PGN del resultado: "1-0", "0-1", "1/2-1/2", "*". */
  resultLabel: string;
  playedAtLabel?: string;
  event?: string;
  /** De dónde sale la partida (estudio de alumno, curso, profesorado). */
  origin: GameOriginCode;
  originLabel: string;
  /** Además, se comentó en una clase a la que asistió quien busca. */
  seenInClass: boolean;
  /** Dónde puede abrirla quien busca; ausente si no tiene ninguna vista. */
  href?: string;
}

export interface PositionSearchResult {
  /** Partidas visibles que pasaron por la posición. Puede superar a `games`. */
  totalGames: number;
  nextMoves: ExplorerNextMove[];
  /** Muestra acotada de partidas, la más reciente primero. */
  games: ExplorerGame[];
}

/**
 * Filtros del buscador. Hoy sólo se usa el origen; el resto de la firma existe
 * para que añadir alumno, color, Elo o fecha no obligue a rehacer el servicio.
 */
export interface PositionSearchFilters {
  origins?: GameOriginCode[];
}
