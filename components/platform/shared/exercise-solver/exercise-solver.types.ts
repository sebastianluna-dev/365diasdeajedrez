import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import type { PlayedMove } from "@/lib/chess/exercise-solver";
import type { AttemptContextInput } from "@/services/shared/exercise-visibility-rules";

// What `ExerciseSolver` receives, as data: the exercise, where it is solved,
// what comes after it, how it is scored and the action that records it. A
// separate module so the services that map into it import no component.

/** The exercise as the solve screen needs it: the solution and what the student is told. */
export interface ExerciseSolverExercise {
  id: string;
  title: string;
  /** The author's «Juegan blancas y ganan»; null for the default from the side to move. */
  prompt: string | null;
  kind: ExerciseKindCode;
  mateIn: number | null;
  /** The source, `[FEN]` and moves, as it is stored. */
  solutionPgn: string;
  hints: string[];
  /** Shown once it is over (D13). */
  explanation: string | null;
  difficulty: number;
}

/**
 * How the attempt counts: `solve` submits it; `block` submits it too, from a
 * class block on a day the exercise was already scored (D49): it is stored
 * for the block's mark and the teacher's count, and nothing else counts;
 * `unscored` is a retry the same study day (§2.7), and `preview` the editor's
 * «Probar» — neither submits.
 */
export type ExerciseSolverMode = "solve" | "block" | "unscored" | "preview";

/** Where it is solved: the path the attempt claims, and where it stands in it («3 / 10»). */
export interface ExerciseSolverContext {
  attempt: AttemptContextInput;
  position?: string;
}

export interface ExerciseSolverLink {
  href: string;
  label: string;
}

/** What the solver sends once the attempt is decided (PLAN.md §5.4). */
export interface ExerciseAttemptSubmission {
  exerciseId: string;
  context: AttemptContextInput;
  /** The player's moves up to the decision, each with the hints taken before it. */
  moves: PlayedMove[];
  hintsUsed: number;
  solutionShown: boolean;
  durationMs: number;
}

/** Why an attempt was not stored. */
export type ExerciseAttemptRefusal = "disabled" | "throttled" | "invalid" | "notFound" | "refused";

export type ExerciseAttemptReply =
  /**
   * `scored: false`: the exercise was already attempted this study day, so
   * nothing moved; `stored` then says whether the row was kept all the same
   * — a class block's, for its mark (D49).
   */
  { ok: true; scored: boolean; firstSolve: boolean; stored: boolean } | { ok: false; reason: ExerciseAttemptRefusal };

/** The server action that records an attempt; a stub in Storybook. */
export type SubmitExerciseAttempt = (input: ExerciseAttemptSubmission) => Promise<ExerciseAttemptReply>;

/**
 * The full solve page of «Ejercicios» (the Lichess-like screen, in the new
 * design system): beside the material board, the status card, the moves, the
 * visit's history («Esta sesión») and the two switches of the rating. Without
 * it, the solver is the board and its panel alone (a lesson, a class block,
 * the editor's «Probar»). The page's toolbar — its trail, the series' place,
 * the level — is the section's, around it.
 */
export interface ExerciseSolverAside {
  /** The visit the history belongs to: «practice», or a series by id. */
  scope: string;
  /** This exercise's own page, for its pill in the history; null when it has none. */
  href: string | null;
  /** The topic it was served by, for its chip and the topic's tally; none on «Todos los temas» and in a series. */
  topic?: { code: string; label: string };
}
