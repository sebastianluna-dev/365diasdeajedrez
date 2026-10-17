import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";

// What the student's «Ejercicios» screens read (PLAN.md §5): the home, a
// series and the n-th exercise of a series. Only what the student may see:
// an exercise they cannot solve is neither listed nor counted.

/** How the student stands with an exercise of a series, in that series (§5.2). */
export type StudentSeriesMark = "solved" | "failed" | null;

/** A series given to the student, on the home's «De tu profesor». */
export interface StudentSeriesSummary {
  id: string;
  title: string;
  href: string;
  teacherName: string | null;
  /** The exercises the student may solve in it, and how many of them they solved there. */
  total: number;
  solved: number;
  /** Where «Empezar»/«Continuar» leads: the first exercise not solved yet and not tried today; null once none is left. */
  nextHref: string | null;
  /** Whether anything of it was tried: «Continuar» rather than «Empezar». */
  started: boolean;
}

export interface StudentExercisesHome {
  /** An active teacher: the empty state says «Tu profesor aún no te ha dado ejercicios.». */
  hasTeacher: boolean;
  /** Newest given first. */
  series: StudentSeriesSummary[];
  /** «Series de la academia» (phase 4, D32): the published ones, the last published first; drawn only with some. */
  academySeries: StudentSeriesSummary[];
  /** The screen's one accent: the newest series with an exercise left that can count today — the teacher's first, then the academy's. */
  continueWith: { title: string; href: string } | null;
}

/** An exercise of a series, as its row draws it. */
export interface StudentSeriesItem {
  /** 1-based, among the exercises the student may solve in it. */
  n: number;
  href: string;
  title: string;
  /** «Mate en 2 · 1400 · Intermedio». */
  facts: string;
  startFen: string;
  orientation: "white" | "black";
  mark: StudentSeriesMark;
}

export interface StudentSeriesView {
  id: string;
  title: string;
  description: string | null;
  teacherName: string | null;
  items: StudentSeriesItem[];
  solved: number;
  /** The page's accent: to the first exercise not solved yet and not tried today; null once none is left. */
  start: ExerciseSolverLink | null;
}

/** The n-th exercise of a series, ready to solve. */
export interface StudentSeriesExercise {
  /** `position` is 1-based, of `total` solvable exercises: the ring of the solve page. */
  series: { id: string; title: string; href: string; position: number; total: number };
  exercise: ExerciseSolverExercise;
  /** `unscored` when the exercise was already attempted this study day (§2.7). */
  mode: Extract<ExerciseSolverMode, "solve" | "unscored">;
  context: ExerciseSolverContext;
  next: ExerciseSolverLink | null;
  back: ExerciseSolverLink;
}
