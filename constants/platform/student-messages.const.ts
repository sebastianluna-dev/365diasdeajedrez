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

/** The text for a code, or the generic one when the code is unknown. */
export function studentErrorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return STUDENT_ERROR_MESSAGES[code] ?? "No se pudo completar la acción.";
}
