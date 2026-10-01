// How the result of a PGN import travels from the action to the page: in the
// URL the action redirects to, as `?importadas=<stored>.<empty>.<over the limit>`.
// Pure module and without "server-only" so the actions, the pages and their
// tests share it.

import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { IMPORT_REPORT_PARAM, type PgnImportReport } from "@/constants/platform/pgn-import-messages.const";

const REPORT_SHAPE = /^(\d{1,4})\.(\d{1,6})\.(\d{1,6})$/;

/** Adds the result of an import to an internal path, respecting the query it already carries. */
export function withImportReport(path: string, report: PgnImportReport): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${IMPORT_REPORT_PARAM}=${report.imported}.${report.skippedEmpty}.${report.overLimit}`;
}

/**
 * Reads the result back from the URL. Anybody can type that parameter, so what
 * does not have the shape of a result that could have happened is no result:
 * the page then says nothing, instead of «Se importaron 99999 partidas.»
 */
export function readImportReport(raw: string | string[] | undefined): PgnImportReport | null {
  if (typeof raw !== "string") return null;
  const match = REPORT_SHAPE.exec(raw);
  if (!match) return null;
  const [imported = 0, skippedEmpty = 0, overLimit = 0] = match.slice(1).map(Number);
  if (imported < 1 || imported > PGN_MAX_GAMES) return null;
  // Games only stay out for the limit when the limit was reached.
  if (overLimit > 0 && imported < PGN_MAX_GAMES) return null;
  return { imported, skippedEmpty, overLimit };
}
