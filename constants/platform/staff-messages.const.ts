// Mensajes de los formularios del panel de Administración. Van aquí y no en los
// módulos `.actions.ts` porque un archivo "use server" sólo puede exportar
// funciones asíncronas.
//
// Las altas y los reinicios de contraseña son la ÚNICA excepción a este patrón
// (usan `useActionState`, ver §14.2 del plan): una contraseña no puede viajar
// en un query param.

export const STAFF_ERROR_PARAM = "error";

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
  gameInUse:
    "Esa partida la usan una o varias lecciones. Desvincúlala de ellas antes de quitarla de la colección.",
  sans: "Alguna jugada de la secuencia no es legal en esta posición.",
  fen: "La posición FEN no es válida.",
  order: "No se pudo reordenar. Recarga la página y vuelve a intentarlo.",
  noMainline:
    "Para entrenarla de memoria, la lección necesita al menos una jugada en su línea principal. Añade el PGN antes de marcarla.",
  illegalLine: "La línea principal del PGN tiene una jugada que no se puede jugar. Corrígela antes de marcarla como entrenable.",
  colorHasNoMoves:
    "Con ese bando no queda ninguna jugada que entrenar: la línea principal sólo tiene la jugada del rival. Alarga la línea o cambia el bando.",
};

/** Textos del alta de cuenta, que devuelve estado en vez de redirigir. */
export const STAFF_ACCOUNT_MESSAGES = {
  passwordShownOnce: "Anótala ahora: no se volverá a mostrar.",
  created: "Cuenta creada.",
  passwordReset: "Contraseña restablecida. Se han cerrado todas las sesiones de esa cuenta.",
};
