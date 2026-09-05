import { makePgn, parsePgn } from "chessops/pgn";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { GAME_RESULT, GAME_RESULT_BY_PGN_TOKEN, type GameResultCode } from "@/constants/platform/study-codes.const";

// De un PGN pegado a filas de `Game`.
//
// Vivía dentro de las acciones de «Mis estudios», que era su único usuario.
// Ahora también importa la colección de partidas de un curso, y tener dos
// lectores de cabeceras distintos acabaría con dos criterios distintos sobre
// qué es una fecha válida o cuándo un Elo es un Elo.
//
// Módulo puro: sólo chessops y catálogos, nada de Prisma ni de sesión. Quien lo
// llama decide en qué base entran las partidas y con qué origen.

const UNKNOWN_PLAYER = "Desconocido";

/** Sólo fechas completas: el PGN admite "????.??.??" y "2024.??.??". */
const FULL_PGN_DATE = /^(\d{4})\.(\d{2})\.(\d{2})$/;

/** Cabecera útil o null: el PGN usa "?" como marcador de dato desconocido. */
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
  // Rechaza el 31 de febrero, que `Date.UTC` convertiría en marzo sin quejarse.
  const isRealDate = date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
  return isRealDate ? date : null;
}

/** Las columnas de una partida, sin decidir todavía a qué base pertenece. */
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
  /** El PGN de ESA partida, reserializado. */
  pgn: string;
}

/**
 * Lee un PGN con una o varias partidas.
 *
 * Devuelve `[]` si el texto no es PGN o no hay nada aprovechable, en vez de
 * lanzar: lo teclea una persona y un texto raro no es un error del programa.
 *
 * Se descartan las partidas sin jugadas Y sin posición de partida, que es lo
 * que queda cuando alguien pega texto suelto entre cabeceras.
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
      // `WhiteTeam` es lo que escriben las retransmisiones de Lichess para la
      // federación; el PGN estándar no tiene cabecera propia para ella.
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
