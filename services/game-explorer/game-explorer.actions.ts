"use server";

import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { allowAction } from "@/lib/rate-limit";
import { searchGamesByPosition } from "./game-explorer.service";
import type { PositionSearchFilters, PositionSearchResult } from "./game-explorer.types";

// El tablero del explorador es un componente de cliente, así que pide por aquí.
// Es el patrón de datos de la plataforma: no hay route handlers propios ni
// cliente de datos en el navegador.
//
// Como toda server action, es alcanzable por POST directo: la identidad se
// resuelve dentro (el servicio llama al DAL) y el FEN se valida allí antes de
// tocar la base.

const EMPTY_RESULT: PositionSearchResult = { totalGames: 0, nextMoves: [], games: [] };

/** Un FEN válido no llega a 90 caracteres; más es basura o un intento de abuso. */
const FEN_MAX_LENGTH = 120;

export async function searchPosition(
  fen: string,
  filters: PositionSearchFilters = {},
): Promise<PositionSearchResult> {
  if (typeof fen !== "string" || fen.length === 0 || fen.length > FEN_MAX_LENGTH) return EMPTY_RESULT;

  const user = await getCurrentUser();
  // Holgado a propósito: una búsqueda por jugada es el uso normal del tablero,
  // y quien navega rápido por una partida larga no debe toparse con el tope.
  if (!(await allowAction(`${user.id}:search-position`, 240, 60_000))) return EMPTY_RESULT;

  return searchGamesByPosition(fen, filters);
}
