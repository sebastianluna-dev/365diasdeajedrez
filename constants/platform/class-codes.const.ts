// Codes estables de los catálogos de clases.

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
