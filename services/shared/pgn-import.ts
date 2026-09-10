import { makePgn, parsePgn } from "chessops/pgn";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { GAME_RESULT, GAME_RESULT_BY_PGN_TOKEN, type GameResultCode } from "@/constants/platform/study-codes.const";

// From a pasted PGN to `Game` rows.
//
// It used to live inside the "Mis estudios" actions, which were its only user.
// Now a course's game collection is also imported, and having two different
// header readers would end up with two different criteria about what a valid
// date is or when an Elo is an Elo.
//
// Pure module: only chessops and catalogs, no Prisma and no session. Whoever
// calls it decides which database the games go into and with what origin.

const UNKNOWN_PLAYER = "Desconocido";

/** Full dates only: the PGN admits "????.??.??" and "2024.??.??". */
const FULL_PGN_DATE = /^(\d{4})\.(\d{2})\.(\d{2})$/;

/** A useful header or null: the PGN uses "?" as the marker for unknown data. */
function readHeader(headers: Map<string, string>, key: string): string | null {
  const value = headers.get(key)?.trim();
  return value && value !== "?" ? value : null;
}

function readEloHeader(headers: Map<string, string>, key: string): number | null {
  const value = readHeader(headers, key);
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

function readDateHeader(headers: Map<string, string>): Date | null {
  const value = readHeader(headers, "Date");
  const match = value ? FULL_PGN_DATE.exec(value) : null;
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  // Rejects 31 February, which `Date.UTC` would turn into March without complaining.
  const isRealDate = date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
  return isRealDate ? date : null;
}

/** A game's columns, without deciding yet which database it belongs to. */
export interface ImportedGame {
  white: string;
  black: string;
  whiteElo: number | null;
  blackElo: number | null;
  whiteTitle: string | null;
  blackTitle: string | null;
  whiteCountry: string | null;
  blackCountry: string | null;
  resultCode: GameResultCode;
  playedAt: Date | null;
  event: string | null;
  site: string | null;
  round: string | null;
  eco: string | null;
  initialFen: string | null;
  /** THAT game's PGN, reserialised. */
  pgn: string;
}

/**
 * Reads a PGN with one or several games.
 *
 * It returns `[]` if the text is not PGN or there is nothing usable, instead of
 * throwing: a person types it and odd text is not a program error.
 *
 * Games without moves AND without a starting position are discarded, which is
 * what is left when someone pastes loose text between headers.
 */
export function parseImportedGames(pgnText: string): ImportedGame[] {
  let parsed: ReturnType<typeof parsePgn>;
  try {
    parsed = parsePgn(pgnText);
  } catch {
    return [];
  }

  const games: ImportedGame[] = [];
  for (const game of parsed.slice(0, PGN_MAX_GAMES)) {
    const headers = game.headers;
    const initialFen = readHeader(headers, "FEN");
    if (game.moves.children.length === 0 && initialFen === null) continue;

    const resultToken = readHeader(headers, "Result") ?? "";
    games.push({
      white: readHeader(headers, "White") ?? UNKNOWN_PLAYER,
      black: readHeader(headers, "Black") ?? UNKNOWN_PLAYER,
      whiteElo: readEloHeader(headers, "WhiteElo"),
      blackElo: readEloHeader(headers, "BlackElo"),
      whiteTitle: readHeader(headers, "WhiteTitle"),
      blackTitle: readHeader(headers, "BlackTitle"),
      // `WhiteTeam` is what Lichess's broadcasts write for the federation; the
      // standard PGN has no header of its own for it.
      whiteCountry: readHeader(headers, "WhiteTeam"),
      blackCountry: readHeader(headers, "BlackTeam"),
      resultCode: GAME_RESULT_BY_PGN_TOKEN[resultToken] ?? GAME_RESULT.ONGOING,
      playedAt: readDateHeader(headers),
      event: readHeader(headers, "Event"),
      site: readHeader(headers, "Site"),
      round: readHeader(headers, "Round"),
      eco: readHeader(headers, "ECO"),
      initialFen,
      pgn: makePgn(game),
    });
  }
  return games;
}
