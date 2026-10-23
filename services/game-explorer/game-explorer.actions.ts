"use server";

import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { allowAction } from "@/lib/rate-limit";
import { GAME_ORIGIN, type GameOriginCode } from "@/services/shared/game-origin";
import { searchGamesByPosition } from "./game-explorer.service";
import type { PositionSearchFilters, PositionSearchResult } from "./game-explorer.types";

// The explorer's board is a client component, so it asks through here. It is
// the platform's data pattern: there are no route handlers of its own nor a
// data client in the browser.
//
// Like every server action, it is reachable by direct POST: the identity is
// resolved inside (the service calls the DAL) and the FEN is validated there
// before touching the database.

const EMPTY_RESULT: PositionSearchResult = {
  totalGames: 0,
  originCounts: { STUDENT_STUDY: 0, COURSE: 0, EDITOR: 0 },
  nextMoves: [],
  games: [],
};

/** A valid FEN does not reach 90 characters; more is rubbish or an abuse attempt. */
const FEN_MAX_LENGTH = 120;

const ORIGIN_CODES: ReadonlySet<string> = new Set(Object.values(GAME_ORIGIN));

/** The filters as the service may take them: only the origins that exist, whatever was posted. */
function cleanFilters(filters: unknown): PositionSearchFilters {
  const origins = (filters as PositionSearchFilters | null | undefined)?.origins;
  if (!Array.isArray(origins)) return {};
  return { origins: origins.filter((code): code is GameOriginCode => ORIGIN_CODES.has(code)) };
}

export async function searchPosition(fen: string, filters: PositionSearchFilters = {}): Promise<PositionSearchResult> {
  if (typeof fen !== "string" || fen.length === 0 || fen.length > FEN_MAX_LENGTH) return EMPTY_RESULT;

  const user = await getCurrentUser();
  // Generous on purpose: a search per move is the board's normal use, and
  // whoever navigates quickly through a long game must not run into the cap.
  if (!(await allowAction(`${user.id}:search-position`, 240, 60_000))) return { ...EMPTY_RESULT, throttled: true };

  return searchGamesByPosition(fen, cleanFilters(filters));
}
