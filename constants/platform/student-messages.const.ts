// Error messages of the student's forms. Same pattern as the teacher and staff
// panels: a `"use server"` module can only export async functions, so the
// actions redirect with `?error=<code>` and the page translates the code here.

export const STUDENT_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  throttled: "Has hecho demasiados cambios seguidos. Espera un momento y vuelve a intentarlo.",
  goal: "Elige uno de los objetivos de la lista.",
  pgnEmpty: "No se encontró ninguna partida en ese PGN.",
  pgnTooLong: "El PGN es demasiado largo. Divídelo en varias importaciones.",
};

/**
 * What the study screens can bounce with, on top of the common codes: the
 * game page and the empty study page show the same notices, because the
 * forms that raise them (new game, delete study) are mounted on both.
 */
export const STUDY_ERROR_MESSAGES: Record<string, string> = {
  ...STUDENT_ERROR_MESSAGES,
  confirmStudyDelete: "Este estudio tiene contenido. Marca la casilla para confirmar que quieres borrarlo.",
  fen: "Esa posición de partida no es válida. Revisa el FEN.",
  gameInClasses:
    "Esta partida está usada en el contenido de alguna clase. Si la borras, esos bloques se quedarán vacíos. Marca la casilla para confirmarlo.",
};

/** The text for a code, or the generic one when the code is unknown. */
export function studentErrorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return STUDENT_ERROR_MESSAGES[code] ?? "No se pudo completar la acción.";
}
