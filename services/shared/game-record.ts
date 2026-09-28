import { makePgn, parsePgn } from "chessops/pgn";
import { z } from "zod";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { formOptionalText, formTextIfPresent } from "./form-schema";

// A game's record — who played, where, when, how it ended — and the two
// things done with it wherever a game is edited: reading it from the form and
// writing it into the PGN's headers.
//
// Pure module, without DAL or database. Two screens edit games, the student's
// studies and the staff's chapter collections, each behind its own border
// (ownership of the study, `requireStaff()`). What a record IS must not depend
// on which of the two saved it, so both actions come here for it.

export const UNKNOWN_PLAYER = "Desconocido";
export const GAME_FIELD_MAX_LENGTH = 120;

/** Elo range that is accepted; outside it, it is a typo, not data. */
const ELO_MIN = 100;
const ELO_MAX = 4000;
/** The form uses <input type="date">, which sends ISO. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** An Elo, or null when it is empty or not credible: a typo is discarded, not stored. */
const eloField = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value || !/^\d+$/.test(value)) return null;
    const elo = Number.parseInt(value, 10);
    return elo >= ELO_MIN && elo <= ELO_MAX ? elo : null;
  });

/** Date from the form (ISO), or null. An impossible date is discarded, not corrected. */
const isoDateField = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    const match = ISO_DATE.exec(value ?? "");
    if (!match) return null;
    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const isRealDate = date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
    return isRealDate ? date : null;
  });

/** The fields of a game's record. Free text is bounded; the numbers and the date are lenient. */
export const GAME_FIELDS_SCHEMA = z.object({
  title: formOptionalText(GAME_FIELD_MAX_LENGTH),
  white: formOptionalText(GAME_FIELD_MAX_LENGTH),
  black: formOptionalText(GAME_FIELD_MAX_LENGTH),
  whiteElo: eloField,
  blackElo: eloField,
  // Absent ≠ empty for these four: a form that does not carry them must not erase them.
  whiteTitle: formTextIfPresent(GAME_FIELD_MAX_LENGTH),
  blackTitle: formTextIfPresent(GAME_FIELD_MAX_LENGTH),
  whiteCountry: formTextIfPresent(GAME_FIELD_MAX_LENGTH),
  blackCountry: formTextIfPresent(GAME_FIELD_MAX_LENGTH),
  resultCode: z.string().trim().max(32).optional(),
  playedAt: isoDateField,
  event: formOptionalText(GAME_FIELD_MAX_LENGTH),
  site: formOptionalText(GAME_FIELD_MAX_LENGTH),
  round: formOptionalText(GAME_FIELD_MAX_LENGTH),
  eco: formOptionalText(GAME_FIELD_MAX_LENGTH),
});

export type GameRecordFields = z.infer<typeof GAME_FIELDS_SCHEMA>;

export function isGameResultCode(value: string): value is GameResultCode {
  return (Object.values(GAME_RESULT) as string[]).includes(value);
}

/** The result the form chose, or "in play" when it sent none or one that does not exist. */
export function resultCodeOf(fields: Pick<GameRecordFields, "resultCode">): GameResultCode {
  const code = fields.resultCode ?? "";
  return isGameResultCode(code) ? code : GAME_RESULT.ONGOING;
}

/** PGN header: the value is written, it is removed when null, it is left when undefined. */
function setHeader(headers: Map<string, string>, key: string, value: string | null | undefined): void {
  if (value === undefined) return;
  if (value === null || value.length === 0) headers.delete(key);
  else headers.set(key, value);
}

/** Date in the PGN's format ("2024.03.17"). */
function pgnDate(date: Date | null): string | null {
  if (!date) return null;
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}.${month}.${day}`;
}

export interface GameRecordWrite {
  /** The game's columns, except the result, which is a relation. */
  columns: {
    title: string | null;
    white: string;
    black: string;
    whiteElo: number | null;
    blackElo: number | null;
    whiteTitle: string | null | undefined;
    blackTitle: string | null | undefined;
    whiteCountry: string | null | undefined;
    blackCountry: string | null | undefined;
    playedAt: Date | null;
    event: string | null;
    site: string | null;
    round: string | null;
    eco: string | null;
    pgn: string;
  };
}

/**
 * What saving a game's record writes: its columns and its PGN with the headers
 * saying the same.
 *
 * The headers are rewritten TOO. Otherwise an exported PGN would say one thing
 * and the record another about the same game, and there would be no way to
 * know which of the two is the good one. The moves and the starting position
 * are not touched: this only changes who played and where.
 *
 * @param resultToken what the PGN writes for the result ("1-0", "*"…): the
 *   label of the catalog's row, which whoever calls has read.
 */
export function writeGameRecord(fields: GameRecordFields, currentPgn: string, resultToken: string): GameRecordWrite {
  const { whiteElo, blackElo, playedAt, event, site, round, eco, whiteTitle, blackTitle, whiteCountry, blackCountry } =
    fields;
  const white = fields.white ?? UNKNOWN_PLAYER;
  const black = fields.black ?? UNKNOWN_PLAYER;

  let pgn = currentPgn;
  const parsed = parsePgnTree(pgn) === null ? null : parsePgn(pgn)[0];
  if (parsed) {
    setHeader(parsed.headers, "White", white);
    setHeader(parsed.headers, "Black", black);
    setHeader(parsed.headers, "WhiteElo", whiteElo === null ? null : String(whiteElo));
    setHeader(parsed.headers, "BlackElo", blackElo === null ? null : String(blackElo));
    setHeader(parsed.headers, "Event", event);
    setHeader(parsed.headers, "Site", site);
    setHeader(parsed.headers, "Round", round);
    setHeader(parsed.headers, "ECO", eco);
    setHeader(parsed.headers, "Date", pgnDate(playedAt));
    setHeader(parsed.headers, "Result", resultToken);
    setHeader(parsed.headers, "WhiteTitle", whiteTitle);
    setHeader(parsed.headers, "BlackTitle", blackTitle);
    // The federation travels in `WhiteTeam`/`BlackTeam`, which is the header the
    // broadcasts use: the standard PGN does not have one for the country.
    setHeader(parsed.headers, "WhiteTeam", whiteCountry);
    setHeader(parsed.headers, "BlackTeam", blackCountry);
    pgn = makePgn(parsed);
  }

  return {
    columns: {
      title: fields.title,
      white,
      black,
      whiteElo,
      blackElo,
      whiteTitle,
      blackTitle,
      whiteCountry,
      blackCountry,
      playedAt,
      event,
      site,
      round,
      eco,
      pgn,
    },
  };
}

export interface AutosaveResult {
  ok: boolean;
  /** Why it was not saved, so it can be said on screen. */
  reason?: "invalid" | "denied" | "throttled" | "training";
}

/**
 * Whether two PGNs hold the same MOVES: the same starting position and the
 * same tree, move by move. Comments, glyphs, arrows and headers do not count.
 *
 * It is what separates annotating a game from changing it. A lesson's
 * exercises are frozen against the moves of its game, so only a change of
 * moves leaves them stale; a comment corrected must not make the staff
 * freeze them all again.
 *
 * A PGN that cannot be read is never "the same": in doubt, it changed.
 */
export function sameMoves(previousPgn: string, nextPgn: string): boolean {
  const previous = parsePgnTree(previousPgn);
  const next = parsePgnTree(nextPgn);
  if (!previous || !next) return false;
  if (previous.initialFen !== next.initialFen) return false;
  if (previous.nodesByPath.size !== next.nodesByPath.size) return false;

  for (const [path, node] of previous.nodesByPath) {
    if (next.nodesByPath.get(path)?.san !== node.san) return false;
  }
  return true;
}
