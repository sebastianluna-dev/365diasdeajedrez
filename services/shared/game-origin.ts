import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";

// De dónde viene una partida. No es un catálogo de la base: se DERIVA de quién
// es el dueño de su base y de qué roles tiene ese dueño, igual que el resto de
// la plataforma deduce los roles de la existencia de una fila.
//
// Importa en el buscador por posición: ver que una continuación la jugaron
// treinta alumnos no significa lo mismo que verla en treinta partidas
// magistrales de un curso.

export const GAME_ORIGIN = {
  /** Base personal de un alumno. */
  STUDENT_STUDY: "STUDENT_STUDY",
  /** Base de un curso: partidas modelo del material publicado. */
  COURSE: "COURSE",
  /** Base personal de un profesor o de un editor. */
  EDITOR: "EDITOR",
} as const;

export type GameOriginCode = (typeof GAME_ORIGIN)[keyof typeof GAME_ORIGIN];

export const GAME_ORIGIN_LABEL: Record<GameOriginCode, string> = {
  [GAME_ORIGIN.STUDENT_STUDY]: "Estudio de alumno",
  [GAME_ORIGIN.COURSE]: "Curso",
  [GAME_ORIGIN.EDITOR]: "Profesorado",
};

export interface GameOriginInput {
  /** Code del catálogo OwnerType de la base que contiene la partida. */
  ownerTypeCode: string;
  /** Roles del dueño cuando la base es de un usuario; null si es de un curso. */
  owner: { isTeacher: boolean; isStaff: boolean } | null;
}

/**
 * Clasifica una partida en uno de los tres orígenes.
 *
 * El orden de las comprobaciones es el que manda: una base de curso es del
 * curso aunque la creara un editor, y la base personal de un profesor cuenta
 * como material del profesorado aunque él mismo sea alumno de otro curso.
 *
 * «Vista en clase» no es un origen y no se decide aquí: una partida de clase
 * siempre vive además en la base de alguien, así que viaja como una marca
 * aparte sobre el mismo view-model.
 */
export function gameOriginOf({ ownerTypeCode, owner }: GameOriginInput): GameOriginCode {
  if (ownerTypeCode === OWNER_TYPE.COURSE) return GAME_ORIGIN.COURSE;
  if (owner?.isStaff || owner?.isTeacher) return GAME_ORIGIN.EDITOR;
  return GAME_ORIGIN.STUDENT_STUDY;
}
