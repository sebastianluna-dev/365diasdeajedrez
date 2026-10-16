// The limits of an exercise's fields, shared by the editor (each control's
// `min`, `max` and `maxLength`) and by the form's schema on the server
// (services/shared/exercise-form.ts), so the two never disagree. The columns'
// own limits are the database's: VarChar sizes and the CHECKs of the
// `exercises` migration.

export const EXERCISE_LIMITS = {
  /** `Exercise.title`, VarChar(120). */
  title: 120,
  /** `Exercise.prompt`, VarChar(200). */
  prompt: 200,
  /** Each of the author's hints; the column is a text array. */
  hint: 300,
  /** CHECK exercise_hints_max. */
  hints: 3,
  explanation: 4000,
  /** `sourceWhite` and `sourceBlack`, VarChar(120). */
  sourcePlayer: 120,
  /** `sourceEvent`, VarChar(160). */
  sourceEvent: 160,
  /** CHECK exercise_source_year. */
  sourceYearMin: 1400,
  sourceYearMax: 2100,
  /** CHECK exercise_difficulty_range; the editor steps it by 50. */
  difficultyMin: 400,
  difficultyMax: 3000,
  difficultyStep: 50,
  /** A solution with variants and comments; far below the import's PGN ceiling. */
  solutionPgn: 100_000,
} as const;

/** The limits of a series, shared by its popup's controls and its actions. */
export const SERIES_LIMITS = {
  /** `ExerciseSeries.title`, VarChar(120). */
  title: 120,
  /** `ExerciseSeries.description`, VarChar(1000). */
  description: 1000,
  /** The exercises one series holds: a session's work, not a bank. */
  items: 100,
} as const;

/** What a submitted attempt may claim (PLAN.md §5.4); above these the figures are not credible. */
export const EXERCISE_ATTEMPT_LIMITS = {
  /** The player's moves up to the decision. */
  moves: 200,
  /** Hints taken: a press counts once each. */
  hints: 20,
  /** Two hours. */
  durationMs: 2 * 60 * 60 * 1000,
} as const;
