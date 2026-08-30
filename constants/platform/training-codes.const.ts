// Codes estables de los catálogos de entrenamiento.

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

export const ATTEMPT_CONTEXT = {
  LESSON: "LESSON",
  CHAPTER_QUIZ: "CHAPTER_QUIZ",
  TRAINER: "TRAINER",
} as const;

export type AttemptContextCode = (typeof ATTEMPT_CONTEXT)[keyof typeof ATTEMPT_CONTEXT];
