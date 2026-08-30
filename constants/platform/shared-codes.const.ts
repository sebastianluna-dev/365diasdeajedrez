// Codes estables de los catálogos compartidos. La tabla catálogo es la fuente
// de verdad persistente; estas constantes sólo dan tipado y evitan strings
// mágicos (spec: sin enums de TS ni de Prisma).

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

/** Subconjunto válido para contenido (Lesson, Position): AUTO es sólo de usuario. */
export const CONTENT_ORIENTATIONS = [BOARD_ORIENTATION.WHITE, BOARD_ORIENTATION.BLACK] as const;

export const OWNER_TYPE = {
  USER: "USER",
  COURSE: "COURSE",
  TEACHER: "TEACHER",
} as const;

export type OwnerTypeCode = (typeof OWNER_TYPE)[keyof typeof OWNER_TYPE];

/** GameDatabase sólo admite USER o COURSE; TEACHER es válido únicamente en Position. */
export const GAME_DATABASE_OWNER_TYPES = [OWNER_TYPE.USER, OWNER_TYPE.COURSE] as const;

export const TOPIC = {
  TACTICS: "TACTICS",
  OPENING_LINE: "OPENING_LINE",
  PAWN_STRUCTURE: "PAWN_STRUCTURE",
  ENDGAME: "ENDGAME",
  STRATEGY: "STRATEGY",
} as const;

export type TopicCode = (typeof TOPIC)[keyof typeof TOPIC];
