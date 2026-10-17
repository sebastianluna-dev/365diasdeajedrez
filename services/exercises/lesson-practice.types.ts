import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";

// What the student's lesson reads of its exercises (D25, D26; PLAN.md §7.1):
// the card after the game — or the list where the board would be, in a
// practice-only lesson — and the n-th exercise, to solve. Only the exercises
// in play of a published lesson; «resuelto» is by solve key (§2.7).

/** One of the lesson's exercises, as the list draws it. */
export interface LessonPracticeItem {
  /** 1-based, among the lesson's exercises in play. */
  n: number;
  href: string;
  title: string;
  /** «Mate en 2 · 1400 · Intermedio». */
  facts: string;
  startFen: string;
  orientation: "white" | "black";
  /** Any row of its family has `firstSolvedAt`: the original counts for the copy and back (D22, D28). */
  solved: boolean;
}

/** The lesson's exercises and how the student stands with them. */
export interface LessonPractice {
  total: number;
  /** By solve key: a lesson copy counts as solved when its library original was. */
  solved: number;
  items: LessonPracticeItem[];
  /** «Empezar»/«Continuar»: the first not solved yet and not tried today; null once none is left. */
  start: ExerciseSolverLink | null;
}

/** The n-th exercise of a lesson, ready to solve. */
export interface LessonPracticeExercise {
  lesson: { id: string; name: string; href: string };
  exercise: ExerciseSolverExercise;
  /** `unscored` when the exercise's family was attempted this study day (§2.7). */
  mode: Extract<ExerciseSolverMode, "solve" | "unscored">;
  context: ExerciseSolverContext;
  /** The next exercise of the lesson, or null at the last. */
  next: ExerciseSolverLink | null;
  back: ExerciseSolverLink;
}
