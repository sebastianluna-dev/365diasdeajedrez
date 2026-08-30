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

/**
 * Métrica del agregado diario que incrementa cada tipo de actividad.
 * UserActivity sigue siendo la fuente de verdad; UserStatDaily es la copia
 * agregada que hace baratos los rangos temporales.
 */
export const STAT_METRIC_BY_ACTIVITY_TYPE: Record<ActivityTypeCode, StatMetricCode> = {
  [ACTIVITY_TYPE.LESSON_COMPLETED]: STAT_METRIC.LESSONS_COMPLETED,
  [ACTIVITY_TYPE.COURSE_COMPLETED]: STAT_METRIC.COURSES_COMPLETED,
  [ACTIVITY_TYPE.CLASS_ATTENDED]: STAT_METRIC.CLASSES_ATTENDED,
  [ACTIVITY_TYPE.GAME_ANALYZED]: STAT_METRIC.GAMES_ANALYZED,
  [ACTIVITY_TYPE.EXERCISE_PASSED]: STAT_METRIC.EXERCISES_PASSED,
};
