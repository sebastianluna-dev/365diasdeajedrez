// Error messages of the teacher panel forms. They live here and not in the
// `.actions.ts` modules because a "use server" file can only export async
// functions. The actions redirect with `?error=<code>` and the page translates
// the code with this map (the login and studies pattern).

export const TEACHER_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  throttled: "Has hecho demasiados cambios seguidos. Espera un momento y vuelve a intentarlo.",
  title: "El tema de la clase es obligatorio.",
  // What `recordAttendance` (services/shared/class-attendance.service.ts) refuses.
  notStarted: "La lista se pasa cuando la clase ha empezado.",
  classCancelled: "Esta clase está cancelada: no se pasa lista.",
  missingMark: "Falta marcar a algún alumno. Marca a todos para finalizar la clase.",
  markLocked: "Administración cambió una de estas marcas y ya no puedes cambiarla tú.",
  notAllowed: "Esa marca no se puede cambiar en este momento.",
  seatMoved: "La plaza de ese alumno se movió a otra fecha: su marca es historia.",
  notInClass: "Ese alumno no está en la clase.",
  reasonRequired: "Hace falta un motivo para cambiar la asistencia.",
  blockKind: "Tipo de bloque desconocido.",
  blockText: "El bloque de texto no puede estar vacío.",
  blockVideo: "El video necesita una URL http(s) válida.",
  blockRef: "La referencia elegida no existe o no está disponible para ti.",
  blockMissing: "Ese bloque ya no existe.",
  fen: "La posición FEN no es válida.",
  profile: "El nombre para mostrar es obligatorio.",
  blockPgn: "Esa partida no se puede leer. Revisa las jugadas del tablero antes de guardar.",
  blockPgnEmpty: "La partida no tiene ninguna jugada. Juega la partida en el tablero o pega su PGN.",
  blockPgnTooLong: "La partida es demasiado larga.",
};
