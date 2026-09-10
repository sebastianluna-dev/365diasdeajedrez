// Stable codes of the shared catalogs. The catalog table is the persistent
// source of truth; these constants only provide typing and avoid magic
// strings (spec: no TS or Prisma enums).

export const PROGRESS_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type ProgressStatusCode = (typeof PROGRESS_STATUS)[keyof typeof PROGRESS_STATUS];

export const BOARD_ORIENTATION = {
  WHITE: "WHITE",
  BLACK: "BLACK",
  AUTO: "AUTO",
} as const;

export type BoardOrientationCode = (typeof BOARD_ORIENTATION)[keyof typeof BOARD_ORIENTATION];

/** Subset valid for content (Lesson, Position): AUTO is user-only. */
export const CONTENT_ORIENTATIONS = [BOARD_ORIENTATION.WHITE, BOARD_ORIENTATION.BLACK] as const;

export const OWNER_TYPE = {
  USER: "USER",
  COURSE: "COURSE",
  TEACHER: "TEACHER",
} as const;

export type OwnerTypeCode = (typeof OWNER_TYPE)[keyof typeof OWNER_TYPE];

/** GameDatabase only admits USER or COURSE; TEACHER is valid only in Position. */
export const GAME_DATABASE_OWNER_TYPES = [OWNER_TYPE.USER, OWNER_TYPE.COURSE] as const;

export const TOPIC = {
  TACTICS: "TACTICS",
  OPENING_LINE: "OPENING_LINE",
  PAWN_STRUCTURE: "PAWN_STRUCTURE",
  ENDGAME: "ENDGAME",
  STRATEGY: "STRATEGY",
} as const;

export type TopicCode = (typeof TOPIC)[keyof typeof TOPIC];
