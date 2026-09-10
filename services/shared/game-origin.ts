import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";

// Where a game comes from. It is not a catalog in the database: it is DERIVED
// from who owns its database and from what roles that owner has, just as the
// rest of the platform deduces roles from the existence of a row.
//
// It matters in the position search: seeing that a continuation was played by
// thirty students does not mean the same as seeing it in thirty master games of
// a course.

export const GAME_ORIGIN = {
  /** A student's personal database. */
  STUDENT_STUDY: "STUDENT_STUDY",
  /** A course's database: model games of the published material. */
  COURSE: "COURSE",
  /** A teacher's or an editor's personal database. */
  EDITOR: "EDITOR",
} as const;

export type GameOriginCode = (typeof GAME_ORIGIN)[keyof typeof GAME_ORIGIN];

export const GAME_ORIGIN_LABEL: Record<GameOriginCode, string> = {
  [GAME_ORIGIN.STUDENT_STUDY]: "Estudio de alumno",
  [GAME_ORIGIN.COURSE]: "Curso",
  [GAME_ORIGIN.EDITOR]: "Profesorado",
};

export interface GameOriginInput {
  /** Code of the OwnerType catalog of the database containing the game. */
  ownerTypeCode: string;
  /** Roles of the owner when the database belongs to a user; null when it belongs to a course. */
  owner: { isTeacher: boolean; isStaff: boolean } | null;
}

/**
 * Classifies a game into one of the three origins.
 *
 * The order of the checks is what rules: a course database belongs to the
 * course even if an editor created it, and a teacher's personal database counts
 * as teaching-staff material even if they are themselves a student of another course.
 *
 * "Seen in class" is not an origin and is not decided here: a class game always
 * lives in someone's database as well, so it travels as a separate mark over
 * the same view model.
 */
export function gameOriginOf({ ownerTypeCode, owner }: GameOriginInput): GameOriginCode {
  if (ownerTypeCode === OWNER_TYPE.COURSE) return GAME_ORIGIN.COURSE;
  if (owner?.isStaff || owner?.isTeacher) return GAME_ORIGIN.EDITOR;
  return GAME_ORIGIN.STUDENT_STUDY;
}
