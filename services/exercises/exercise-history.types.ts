import type { ExerciseAttemptRowData } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.types";

// The student's «Historial» (D51; PLAN.md §9, phase 6): every scored attempt
// of theirs, as rows the history draws, and the filters that narrow them.
// Pure types: the section hands the rows (the service's, or the sample ones
// while nothing persists) to the client component, which filters in place.

/** Where an attempt came from, as the filter groups it. */
export type ExerciseHistorySource = "series" | "course" | "class" | "practice";

/** The result filter: every attempt, the passes (with or without a hint), the failures («Ver la solución» included). */
export type ExerciseHistoryResult = "all" | "solved" | "failed";

/** The period filter. */
export type ExerciseHistoryPeriod = "7" | "30" | "all";

export interface ExerciseHistoryRow extends ExerciseAttemptRowData {
  source: ExerciseHistorySource;
  /** Where the exercise can be tried again, while that place still exists; null otherwise. */
  retryHref: string | null;
}

export interface ExerciseHistoryFilters {
  result: ExerciseHistoryResult;
  source: ExerciseHistorySource | "all";
  period: ExerciseHistoryPeriod;
}

export const EXERCISE_HISTORY_DEFAULT_FILTERS: ExerciseHistoryFilters = { result: "all", source: "all", period: "all" };

/** How many rows a page shows; «Ver más» adds another page (PLAN.md: 25, accumulating like the teacher's tab). */
export const EXERCISE_HISTORY_PAGE_SIZE = 25;

/** The rows that pass the filters, the latest first. Pure, so the client and a test share it. */
export function filterExerciseHistory(
  rows: readonly ExerciseHistoryRow[],
  filters: ExerciseHistoryFilters,
  now: Date,
): ExerciseHistoryRow[] {
  const since = filters.period === "all" ? null : now.getTime() - Number(filters.period) * 24 * 60 * 60 * 1000;
  return rows
    .filter((row) => {
      if (filters.result === "solved" && row.outcome !== "solved" && row.outcome !== "hinted") return false;
      if (filters.result === "failed" && row.outcome !== "failed" && row.outcome !== "solutionShown") return false;
      if (filters.source !== "all" && row.source !== filters.source) return false;
      if (since !== null && new Date(row.atIso).getTime() < since) return false;
      return true;
    })
    .sort((left, right) => right.atIso.localeCompare(left.atIso));
}
