// Mensajes de error de los formularios del panel del profesor. Viven aquí y no
// en los módulos `.actions.ts` porque un archivo "use server" sólo puede
// exportar funciones asíncronas. Las actions redirigen con `?error=<code>` y la
// página traduce el code con este mapa (patrón del login y de studies).

export const TEACHER_ERROR_PARAM = "error";

export const TEACHER_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  throttled: "Has hecho demasiados cambios seguidos. Espera un momento y vuelve a intentarlo.",
  title: "El título de la clase es obligatorio.",
  schedule: "La fecha y la hora de la clase no son válidas.",
  duration: "La duración debe estar entre 15 y 480 minutos.",
  meetingUrl: "El enlace de la reunión debe ser una URL http(s) válida.",
  meetingProvider: "Elige una plataforma de reunión válida.",
  status: "Ese cambio de estado no está permitido desde el estado actual.",
  student: "Ese alumno no está asignado a ti.",
  participantLocked: "No se puede quitar a un alumno que ya asistió o que tiene un pago registrado.",
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
