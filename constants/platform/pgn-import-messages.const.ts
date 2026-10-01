import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";

// What an import of a PGN says when it has gone well. Like the error codes of
// the forms, the result travels in the URL the action redirects to, and the
// page turns it into this text; unlike them it is three numbers and not a
// code, because the text is made of them.

/** The URL parameter the result of an import travels in: `?importadas=12.1.0`. */
export const IMPORT_REPORT_PARAM = "importadas";

export interface PgnImportReport {
  /** Games stored. */
  imported: number;
  /** Entries of the PGN left out for having neither moves nor a starting position. */
  skippedEmpty: number;
  /** Games left out for coming after the limit of a single import. */
  overLimit: number;
}

/** Whether everything that was pasted went in. */
export function isCompleteImport(report: PgnImportReport): boolean {
  return report.skippedEmpty === 0 && report.overLimit === 0;
}

/** «Se importaron 12 partidas.», or how many of how many and why the rest stayed out. */
export function pgnImportNotice(report: PgnImportReport): string {
  const { imported, skippedEmpty, overLimit } = report;
  const went = imported === 1 ? "Se importó 1" : `Se importaron ${imported}`;
  if (isCompleteImport(report)) return `${went} ${imported === 1 ? "partida" : "partidas"}.`;

  const reasons: string[] = [];
  if (skippedEmpty > 0) reasons.push(skippedEmpty === 1 ? "1 no tenía jugadas" : `${skippedEmpty} no tenían jugadas`);
  if (overLimit > 0) {
    const stayed = overLimit === 1 ? "1 quedó fuera" : `${overLimit} quedaron fuera`;
    reasons.push(`${stayed}, porque una importación admite hasta ${PGN_MAX_GAMES}`);
  }
  return `${went} de ${imported + skippedEmpty + overLimit} partidas: ${reasons.join(" y ")}.`;
}
