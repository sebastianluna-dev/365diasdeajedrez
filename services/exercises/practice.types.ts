import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";

// What «Práctica libre» reads (D18, D32; PLAN.md §5.6): the topics and the
// levels to choose from, and the exercise served for a choice.

/** A topic to practise, as the filter lists it: the first level with its children under it. */
export interface PracticeTopicOption {
  code: string;
  label: string;
  parentCode: string | null;
}

/** A level to practise at, by slug (the Level catalog's bands). */
export interface PracticeLevelOption {
  slug: string;
  name: string;
  /** «1200–1599», «desde 2000». */
  range: string;
}

/** What the filters offer: only the topics that have a library exercise, and the active levels. */
export interface PracticeFilters {
  topics: PracticeTopicOption[];
  levels: PracticeLevelOption[];
  /** The library holds nothing yet: the card and the page say so instead of offering a choice. */
  libraryEmpty: boolean;
}

/** The choice in the address: `?tema=<code>&nivel=<slug>`. */
export interface PracticeChoice {
  topicCode: string | null;
  levelSlug: string | null;
}

/** A practice exercise ready to solve, or why none is served. */
export type PracticeServing =
  | {
      kind: "exercise";
      exercise: ExerciseSolverExercise;
      /** `unscored` when its family was attempted this study day (§2.7). */
      mode: Extract<ExerciseSolverMode, "solve" | "unscored">;
      context: ExerciseSolverContext;
      /** «Siguiente»: the same choice again, skipping this exercise. */
      next: ExerciseSolverLink;
      back: ExerciseSolverLink;
      /** Every exercise of the choice was solved already: the page says they repeat. */
      exhausted: boolean;
      /** «Táctica · Intermedio», for the page's head. */
      choiceLabel: string;
    }
  /** No library exercise matches the choice. */
  | { kind: "empty"; choiceLabel: string }
  /** Nothing chosen yet, or a choice that is not in the catalogs. */
  | { kind: "choose" };
