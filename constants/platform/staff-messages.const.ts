// Messages of the Administration panel forms. They live here and not in the
// `.actions.ts` modules because a "use server" file can only export async
// functions.
//
// Account creation and password resets are the ONLY exception to this pattern
// (they use `useActionState`, see §14.2 of the plan): a password cannot travel
// in a query param.

export const STAFF_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  throttled: "Demasiadas operaciones seguidas. Espera un momento y vuelve a intentarlo.",
  email: "Ese email no tiene un formato válido.",
  emailTaken: "Ya existe una cuenta con ese email.",
  displayName: "El nombre para mostrar es obligatorio.",
  teacherInactive: "Ese profesor está desactivado y no puede recibir alumnos.",
  teacherMissing: "Ese profesor no existe.",
  studentMissing: "Ese alumno no existe.",
  alreadyAssigned: "El alumno ya tiene profesor asignado. Recarga la ficha y vuelve a intentarlo.",
  assignmentMissing: "Esa asignación ya no está activa.",
  userTaken: "Esa cuenta ya tiene ficha de profesor.",
  courseSlug: "Ese identificador (slug) ya está en uso.",
  courseMissing: "Ese curso no existe.",
  publishRequirements: "Para publicar, el curso necesita al menos un capítulo con una lección con PGN.",
  deleteBlocked: "No se puede borrar: el curso no está en borrador o ya hay alumnos con progreso.",
  pgn: "Ese PGN no se puede leer. Revísalo antes de guardar.",
  pgnTooLong: "El PGN es demasiado grande.",
  roleTaken: "Este curso ya tiene ese capítulo. Sólo puede haber una introducción y un cierre.",
  gameInUse: "Esa partida la usan una o varias lecciones. Desvincúlala de ellas antes de quitarla de la colección.",
  sans: "Alguna jugada de la secuencia no es legal en esta posición.",
  fen: "La posición FEN no es válida.",
  order: "No se pudo reordenar. Recarga la página y vuelve a intentarlo.",
  noMainline:
    "Para entrenarla de memoria, la lección necesita al menos una jugada en su línea principal. Añade el PGN antes de marcarla.",
  illegalLine:
    "La línea principal del PGN tiene una jugada que no se puede jugar. Corrígela antes de marcarla como entrenable.",
  colorHasNoMoves:
    "Con ese bando no queda ninguna jugada que entrenar: la línea principal sólo tiene la jugada del rival. Alarga la línea o cambia el bando.",
};
