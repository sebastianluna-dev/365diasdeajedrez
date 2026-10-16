// Stable codes of the exercise catalogs (the bank of authored exercises, see
// docs/ → Platform → Data model). The training ones (the line trainer's mode,
// an attempt's result and context) stay in training-codes.const.ts.

/**
 * What an exercise asks for (`Exercise.kindId`). A SEQUENCE is played to the
 * end of its solution, the platform answering the opponent's moves; a MATE_IN
 * is solved the same way, and every line of its solution ends in checkmate
 * within `Exercise.mateIn` moves («Mate en N»).
 */
export const EXERCISE_KIND = {
  SEQUENCE: "SEQUENCE",
  MATE_IN: "MATE_IN",
} as const;

export type ExerciseKindCode = (typeof EXERCISE_KIND)[keyof typeof EXERCISE_KIND];

/**
 * Where an exercise is in its life (`Exercise.statusId`): a DRAFT only its
 * author sees; READY reaches its teacher's students; IN_REVIEW waits for the
 * staff; PUBLISHED is in the academy's library; ARCHIVED is kept for its
 * history and offered nowhere.
 */
export const EXERCISE_STATUS = {
  DRAFT: "DRAFT",
  READY: "READY",
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ExerciseStatusCode = (typeof EXERCISE_STATUS)[keyof typeof EXERCISE_STATUS];
