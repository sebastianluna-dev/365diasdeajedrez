// Codes estables de los catálogos de actividad y estadísticas.

export const ACTIVITY_TYPE = {
  LESSON_COMPLETED: "LESSON_COMPLETED",
  COURSE_COMPLETED: "COURSE_COMPLETED",
  CLASS_ATTENDED: "CLASS_ATTENDED",
  GAME_ANALYZED: "GAME_ANALYZED",
  EXERCISE_PASSED: "EXERCISE_PASSED",
} as const;

export type ActivityTypeCode = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const SUBJECT_TYPE = {
  COURSE: "COURSE",
  CHAPTER: "CHAPTER",
  LESSON: "LESSON",
  CLASS: "CLASS",
  GAME: "GAME",
  EXERCISE: "EXERCISE",
} as const;

export type SubjectTypeCode = (typeof SUBJECT_TYPE)[keyof typeof SUBJECT_TYPE];

export const STAT_METRIC = {
  LESSONS_COMPLETED: "LESSONS_COMPLETED",
  COURSES_COMPLETED: "COURSES_COMPLETED",
  CLASSES_ATTENDED: "CLASSES_ATTENDED",
  GAMES_ANALYZED: "GAMES_ANALYZED",
  EXERCISES_PASSED: "EXERCISES_PASSED",
} as const;

export type StatMetricCode = (typeof STAT_METRIC)[keyof typeof STAT_METRIC];
