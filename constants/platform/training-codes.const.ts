// Stable codes of the training catalogs.

export const EXERCISE_MODE = {
  REPRODUCE_LINE: "REPRODUCE_LINE",
  FIND_MOVE: "FIND_MOVE",
} as const;

export type ExerciseModeCode = (typeof EXERCISE_MODE)[keyof typeof EXERCISE_MODE];

export const ATTEMPT_RESULT = {
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;

export type AttemptResultCode = (typeof ATTEMPT_RESULT)[keyof typeof ATTEMPT_RESULT];

/**
 * Where an attempt was made (`TrainingAttempt.contextId`). LESSON,
 * CHAPTER_QUIZ and TRAINER are the line trainer's; the rest are an exercise's:
 * in a series, in free practice, in its spaced review, in a class block and in
 * the «Contrarreloj».
 */
export const ATTEMPT_CONTEXT = {
  LESSON: "LESSON",
  CHAPTER_QUIZ: "CHAPTER_QUIZ",
  TRAINER: "TRAINER",
  SERIES: "SERIES",
  PRACTICE: "PRACTICE",
  REVIEW: "REVIEW",
  CLASS: "CLASS",
  STORM: "STORM",
} as const;

export type AttemptContextCode = (typeof ATTEMPT_CONTEXT)[keyof typeof ATTEMPT_CONTEXT];
