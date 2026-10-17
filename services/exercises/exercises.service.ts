import "server-only";
import { cache } from "react";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { exerciseFamilyIds } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { solvableInContextWhere, studentVisibleSeriesWhere } from "@/services/shared/exercise-visibility-rules";
import {
  attemptedToday,
  continueWithOf,
  mapSeriesSummary,
  mapSolverExercise,
  mapStudentSeriesView,
  nextInSeries,
  seriesMarks,
  seriesPosition,
  solvableItems,
  triedTodayOf,
  type StudentSeriesRow,
} from "./exercises.mapper";
import type { StudentExercisesHome, StudentSeriesExercise, StudentSeriesView } from "./exercises.types";

// The student's «Ejercicios» (D17, D31, D32, PLAN.md §5): the series their
// teacher gave them, the academy's published series, a series and its n-th
// exercise. Every reader resolves the student
// in the DAL (`getExerciseViewer` → `getCurrentUser`) and reads only through
// the visibility rule (services/shared/exercise-visibility-rules.ts): a series
// they may not open is not found, and an exercise they may not solve is
// neither listed nor counted. The flag is the pages' to check.

/** What a series row reads: its owner and its exercises, in order. */
const SERIES_SELECT = {
  id: true,
  title: true,
  description: true,
  teacherId: true,
  teacher: { select: { displayName: true } },
  items: {
    orderBy: { order: "asc" },
    select: {
      exercise: {
        select: {
          id: true,
          title: true,
          teacherId: true,
          status: { select: { code: true } },
          kind: { select: { code: true } },
          mateIn: true,
          difficulty: true,
          startFen: true,
        },
      },
    },
  },
} as const;

const LEVEL_SELECT = { slug: true, name: true, order: true, eloMin: true, eloMax: true, isActive: true } as const;

/** The series given to the student that they may open now: a teacher's only while assigned to them (D07). */
function givenSeriesWhere(userId: string) {
  return { AND: [studentVisibleSeriesWhere(userId), { shares: { some: { userId } } }] };
}

/** The academy's published series (phase 4, D32), which every student sees. */
const academySeriesWhere = { teacherId: null, publishedAt: { not: null } } as const;

/** The student's attempts in these series, for the marks. */
async function attemptsIn(userId: string, seriesIds: string[]) {
  if (seriesIds.length === 0) return [];
  return getPlatformDb().trainingAttempt.findMany({
    where: { userId, seriesId: { in: seriesIds }, exerciseId: { not: null } },
    select: { seriesId: true, exerciseId: true, result: { select: { code: true } } },
  });
}

/** The exercises of these series the student attempted this study day: where «Continuar» does not lead. */
async function triedTodayIn(userId: string, rows: readonly Pick<StudentSeriesRow, "teacherId" | "items">[]) {
  const ids = [...new Set(rows.flatMap((row) => solvableItems(row).map((exercise) => exercise.id)))];
  if (ids.length === 0) return new Set<string>();
  const states = await getPlatformDb().userExerciseState.findMany({
    where: { userId, exerciseId: { in: ids }, lastAttemptAt: { not: null } },
    select: { exerciseId: true, lastAttemptAt: true },
  });
  return triedTodayOf(states, new Date());
}

/**
 * Whether the student has anything of a teacher's in «Ejercicios» (§5.1): an
 * active teacher, or a series they may open. What the menu's `"withTeacher"`
 * rule asks — the rule of phases 1–3; since phase 4 the menu draws
 * «Ejercicios» for every student (`"all"`) and does not ask. With the flag
 * off, nothing.
 */
export const getStudentExerciseAccess = cache(async (): Promise<boolean> => {
  if (!EXERCISES_ENABLED) return false;
  const viewer = await getExerciseViewer();
  if (viewer.activeTeacherId !== null) return true;
  const series = await getPlatformDb().exerciseSeries.count({ where: givenSeriesWhere(viewer.userId), take: 1 });
  return series > 0;
});

/**
 * The home: the series given to the student, newest first, and the
 * academy's published series, the last published first, with what they
 * solved of each.
 */
export async function getStudentExercisesHome(): Promise<StudentExercisesHome> {
  const viewer = await getExerciseViewer();
  const db = getPlatformDb();
  const [rows, academyRows] = await Promise.all([
    db.exerciseSeries.findMany({
      where: givenSeriesWhere(viewer.userId),
      select: { ...SERIES_SELECT, shares: { where: { userId: viewer.userId }, select: { createdAt: true } } },
    }),
    db.exerciseSeries.findMany({
      where: academySeriesWhere,
      select: SERIES_SELECT,
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    }),
  ]);
  const given = (row: (typeof rows)[number]) => row.shares[0]?.createdAt.getTime() ?? 0;
  const ordered = [...rows].sort((left, right) => given(right) - given(left) || left.id.localeCompare(right.id));
  const all = [...ordered, ...academyRows] as StudentSeriesRow[];
  const [attempts, triedToday] = await Promise.all([
    attemptsIn(
      viewer.userId,
      all.map((row) => row.id),
    ),
    triedTodayIn(viewer.userId, all),
  ]);
  const marks = seriesMarks(attempts);
  const summary = (row: StudentSeriesRow) => mapSeriesSummary(row, marks.get(row.id), triedToday);
  const series = ordered.map((row) => summary(row as StudentSeriesRow));
  const academySeries = academyRows.map((row) => summary(row as StudentSeriesRow));
  return {
    hasTeacher: viewer.activeTeacherId !== null,
    series,
    academySeries,
    continueWith: continueWithOf([...series, ...academySeries]),
  };
}

/** A series the student may open — given to them, or the academy's published — or null: one they may not see is not found. */
export async function getStudentSeries(seriesId: string): Promise<StudentSeriesView | null> {
  const viewer = await getExerciseViewer();
  const db = getPlatformDb();
  const [row, levels] = await Promise.all([
    db.exerciseSeries.findFirst({
      where: { AND: [{ id: seriesId }, studentVisibleSeriesWhere(viewer.userId)] },
      select: SERIES_SELECT,
    }),
    db.level.findMany({ select: LEVEL_SELECT, orderBy: { order: "asc" } }),
  ]);
  if (!row) return null;
  const [attempts, triedToday] = await Promise.all([
    attemptsIn(viewer.userId, [row.id]),
    triedTodayIn(viewer.userId, [row as StudentSeriesRow]),
  ]);
  const marks = seriesMarks(attempts);
  return mapStudentSeriesView(row as StudentSeriesRow, marks.get(row.id) ?? new Map(), levels, triedToday);
}

/**
 * The n-th exercise of a series (1-based, among the ones the student may
 * solve there), or null. The exercise is read again through the rule for the
 * path the attempt will claim (`solvableInContextWhere`), the same `where`
 * the submit checks, and it opens unscored when it was attempted today.
 */
export async function getStudentSeriesExercise(seriesId: string, n: number): Promise<StudentSeriesExercise | null> {
  if (!Number.isInteger(n) || n < 1) return null;
  const viewer = await getExerciseViewer();
  const db = getPlatformDb();
  const series = await db.exerciseSeries.findFirst({
    where: { AND: [{ id: seriesId }, studentVisibleSeriesWhere(viewer.userId)] },
    select: SERIES_SELECT,
  });
  if (!series) return null;
  const items = solvableItems(series as StudentSeriesRow);
  const item = items[n - 1];
  if (!item) return null;

  const attempt = { kind: ATTEMPT_CONTEXT.SERIES, seriesId: series.id } as const;
  const now = new Date();
  const exercise = await db.exercise.findFirst({
    where: { AND: [{ id: item.id }, solvableInContextWhere(attempt, viewer, now)] },
    select: {
      id: true,
      title: true,
      prompt: true,
      kind: { select: { code: true } },
      mateIn: true,
      solutionPgn: true,
      hints: true,
      explanation: true,
      difficulty: true,
      copiedFromId: true,
      lessonId: true,
    },
  });
  if (!exercise) return null;

  // The family of the exercise (§2.7), the writer's own: a library exercise's lesson copies count too.
  const states = await db.userExerciseState.findMany({
    where: { userId: viewer.userId, exerciseId: { in: await exerciseFamilyIds(db, exercise) } },
    select: { lastAttemptAt: true },
  });
  const href = platformRoutes.exerciseSeries(series.id);
  return {
    series: { id: series.id, title: series.title, href },
    exercise: mapSolverExercise(exercise),
    mode: attemptedToday(states, now) ? "unscored" : "solve",
    context: { attempt, position: seriesPosition(n, items.length) },
    next: nextInSeries(series.id, n, items.length),
    back: { href, label: "Volver a la serie" },
  };
}
