// Stable codes of the class catalogs.

export const CLASS_STATUS = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type ClassStatusCode = (typeof CLASS_STATUS)[keyof typeof CLASS_STATUS];

export const MEETING_PROVIDER = {
  ZOOM: "ZOOM",
  MEET: "MEET",
  OTHER: "OTHER",
} as const;

export type MeetingProviderCode = (typeof MEETING_PROVIDER)[keyof typeof MEETING_PROVIDER];

export const CLASS_BLOCK_KIND = {
  TEXT: "TEXT",
  VIDEO: "VIDEO",
  GAME_REF: "GAME_REF",
  LESSON_REF: "LESSON_REF",
  POSITION_REF: "POSITION_REF",
  FILE: "FILE",
} as const;

export type ClassBlockKindCode = (typeof CLASS_BLOCK_KIND)[keyof typeof CLASS_BLOCK_KIND];

export const TRANSCRIPT_STATUS = {
  PENDING: "PENDING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

export type TranscriptStatusCode = (typeof TRANSCRIPT_STATUS)[keyof typeof TRANSCRIPT_STATUS];

/** Whether a class has one student or several (`Class.formatId`). */
export const CLASS_FORMAT = {
  INDIVIDUAL: "INDIVIDUAL",
  GROUP: "GROUP",
} as const;

export type ClassFormatCode = (typeof CLASS_FORMAT)[keyof typeof CLASS_FORMAT];

/**
 * When a block of the class reaches the student (`ClassBlock.visibilityId`):
 * to prepare, from the moment it is added; after the class, from the moment
 * the class ends; or never, the teacher's own script.
 */
export const CLASS_BLOCK_VISIBILITY = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  TEACHER: "TEACHER",
} as const;

export type ClassBlockVisibilityCode = (typeof CLASS_BLOCK_VISIBILITY)[keyof typeof CLASS_BLOCK_VISIBILITY];

/**
 * The phase of a class, DERIVED from its status and the clock (`classPhase` in
 * `services/shared/class-phase.ts`): it is not a catalog and is never stored.
 * «En vivo» is a phase of the hour, not a status the teacher presses.
 */
export const CLASS_PHASE = {
  UPCOMING: "UPCOMING",
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_CLOSE: "AWAITING_CLOSE",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export type ClassPhaseCode = (typeof CLASS_PHASE)[keyof typeof CLASS_PHASE];
