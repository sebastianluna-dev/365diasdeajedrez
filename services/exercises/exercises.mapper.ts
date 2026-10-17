import type {
  ExerciseSolverExercise,
  ExerciseSolverLink,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import type { ExerciseKindCode, ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { playerOfStart } from "@/lib/chess/exercise-labels";
import { platformRoutes } from "@/lib/platform-routes";
import { isSameStudyDay } from "@/services/shared/exercise-attempt.service";
import { exerciseFacts } from "@/services/shared/exercise-facts";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import { exerciseMarksBy } from "@/services/shared/exercise-marks";
import { seriesItemAvailability } from "@/services/shared/exercise-visibility-rules";
import type { StudentSeriesItem, StudentSeriesMark, StudentSeriesSummary, StudentSeriesView } from "./exercises.types";

// From the rows the student's service reads to what the screens draw. Pure,
// so the rules of the marks, the counts and the one accent are tested here.
//
// Which exercises of a series the student sees is the visibility rule's own
// condition (`seriesItemAvailability`, the series branch of §6.3 on one
// item's values), so a series never lists or counts what its exercise page
// would refuse.

/** An exercise of a series, as the service reads it. */
export interface SeriesExerciseRow {
  id: string;
  title: string;
  teacherId: string | null;
  status: { code: string };
  kind: { code: string };
  mateIn: number | null;
  difficulty: number;
  startFen: string;
}

/** A series given to the student, with its exercises in order. */
export interface StudentSeriesRow {
  id: string;
  title: string;
  description: string | null;
  teacherId: string | null;
  teacher: { displayName: string } | null;
  items: { exercise: SeriesExerciseRow }[];
}

/** An attempt of the student in a series, as the marks read it. */
export interface SeriesAttemptRow {
  seriesId: string | null;
  exerciseId: string | null;
  result: { code: string };
}

/** The exercises of a series the student may solve now, in order. */
export function solvableItems(row: Pick<StudentSeriesRow, "teacherId" | "items">): SeriesExerciseRow[] {
  return row.items
    .map((item) => item.exercise)
    .filter(
      (exercise) =>
        seriesItemAvailability(
          { teacherId: exercise.teacherId, statusCode: exercise.status.code as ExerciseStatusCode },
          row.teacherId,
        ) === "available",
    );
}

/**
 * The student's marks, by series and exercise, from their attempts in each
 * series (§5.2): «Resuelto» with a pass there, «Fallado» with attempts and no
 * pass, nothing untried. An attempt elsewhere does not mark a series. The
 * fold is the shared one (`exerciseMarksBy`), the class blocks' too.
 */
export function seriesMarks(attempts: readonly SeriesAttemptRow[]): Map<string, Map<string, StudentSeriesMark>> {
  return exerciseMarksBy(
    attempts.map((attempt) => ({
      containerId: attempt.seriesId,
      exerciseId: attempt.exerciseId,
      result: attempt.result,
    })),
  );
}

/**
 * Where a series goes on: its first exercise not solved yet that can still
 * count today, or null once none can. One attempted this study day is
 * skipped: it would open unscored (§2.7), so the accent would loop the
 * student back to an exercise that cannot count until tomorrow.
 */
function nextUnsolved(
  seriesId: string,
  items: readonly SeriesExerciseRow[],
  marks: ReadonlyMap<string, StudentSeriesMark>,
  triedToday: ReadonlySet<string>,
) {
  const index = items.findIndex((exercise) => marks.get(exercise.id) !== "solved" && !triedToday.has(exercise.id));
  return index < 0 ? null : platformRoutes.exerciseSeriesItem(seriesId, index + 1);
}

/**
 * The exercises attempted this study day, by id, from the student's states.
 * A series item is never a lesson copy, so its solve key is its own id and
 * its family's state is keyed by it (§2.7).
 */
export function triedTodayOf(
  states: readonly { exerciseId: string; lastAttemptAt: Date | null }[],
  now: Date,
): Set<string> {
  return new Set(
    states
      .filter((state) => state.lastAttemptAt !== null && isSameStudyDay(state.lastAttemptAt, now))
      .map((state) => state.exerciseId),
  );
}

export function mapSeriesSummary(
  row: StudentSeriesRow,
  marks: ReadonlyMap<string, StudentSeriesMark> = new Map(),
  triedToday: ReadonlySet<string> = new Set(),
): StudentSeriesSummary {
  const items = solvableItems(row);
  return {
    id: row.id,
    title: row.title,
    href: platformRoutes.exerciseSeries(row.id),
    teacherName: row.teacher?.displayName ?? null,
    total: items.length,
    solved: items.filter((exercise) => marks.get(exercise.id) === "solved").length,
    nextHref: nextUnsolved(row.id, items, marks, triedToday),
    started: items.some((exercise) => marks.has(exercise.id)),
  };
}

/** The home's one accent: the newest series given (they come newest first) with an exercise left. */
export function continueWithOf(series: readonly StudentSeriesSummary[]): { title: string; href: string } | null {
  const found = series.find((summary) => summary.nextHref !== null);
  return found?.nextHref ? { title: found.title, href: found.nextHref } : null;
}

export function mapStudentSeriesView(
  row: StudentSeriesRow,
  marks: ReadonlyMap<string, StudentSeriesMark>,
  levels: readonly DifficultyLevel[],
  triedToday: ReadonlySet<string> = new Set(),
): StudentSeriesView {
  const items = solvableItems(row);
  const rows: StudentSeriesItem[] = items.map((exercise, index) => ({
    n: index + 1,
    href: platformRoutes.exerciseSeriesItem(row.id, index + 1),
    title: exercise.title,
    facts: exerciseFacts(exercise, levels),
    startFen: exercise.startFen,
    orientation: playerOfStart(exercise.startFen),
    mark: marks.get(exercise.id) ?? null,
  }));
  const next = nextUnsolved(row.id, items, marks, triedToday);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    teacherName: row.teacher?.displayName ?? null,
    items: rows,
    solved: rows.filter((item) => item.mark === "solved").length,
    start: next ? { href: next, label: marks.size > 0 ? "Continuar" : "Empezar" } : null,
  };
}

/** «3 / 10». */
export function seriesPosition(n: number, total: number): string {
  return `${n} / ${total}`;
}

/** What comes after the n-th exercise of a series: the next one, or nothing at the last. */
export function nextInSeries(seriesId: string, n: number, total: number): ExerciseSolverLink | null {
  return n < total ? { href: platformRoutes.exerciseSeriesItem(seriesId, n + 1), label: "Siguiente ejercicio" } : null;
}

/**
 * Whether the exercise was attempted this study day (§2.7): any state of its
 * family with its last attempt today. The page then opens it unscored, as the
 * attempt's writer would store nothing.
 */
export function attemptedToday(states: readonly { lastAttemptAt: Date | null }[], now: Date): boolean {
  return states.some((state) => state.lastAttemptAt !== null && isSameStudyDay(state.lastAttemptAt, now));
}

/** An exercise as the solve screen receives it. */
export function mapSolverExercise(row: {
  id: string;
  title: string;
  prompt: string | null;
  kind: { code: string };
  mateIn: number | null;
  solutionPgn: string;
  hints: string[];
  explanation: string | null;
  difficulty: number;
}): ExerciseSolverExercise {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    kind: row.kind.code as ExerciseKindCode,
    mateIn: row.mateIn,
    solutionPgn: row.solutionPgn,
    hints: row.hints,
    explanation: row.explanation,
    difficulty: row.difficulty,
  };
}
