import "server-only";
import { cache } from "react";
import { STAT_METRIC } from "@/constants/platform/activity-codes.const";
import { EXERCISES_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { ATTEMPT_RESULT } from "@/constants/platform/training-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { bucketColumns, rangeEnd, statsPeriodOf, type DayRange, type StatsPeriodKey } from "@/lib/stats-period";
import { dayKey, startOfDay, weeksUpTo } from "@/lib/study-streak";
import { botLevelSummaryOf, botScoreboardOf } from "@/services/play/play.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { buildSolvableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { getStudyGoal, streakOverviewOf, studyMinutesByDayOf } from "@/services/study-goal/study-goal.service";
import {
  didComparisons,
  exerciseThemes,
  rootLabels,
  sumIn,
  topicSlices,
  weeklySums,
  type DayValue,
  type ExerciseAttemptCount,
} from "./stats.mapper";
import type { ExerciseStatistics, PlayStatistics, StudentStatistics, StudyStatistics } from "./stats.types";

// The student's «Estadísticas» (`/perfil/estadisticas`, 2026-10-25): the
// own person's only — it takes no slug and resolves the session in the DAL.
// Everything is READ from what already exists: the lessons finished (the
// minutes), the activity log and its daily aggregate (the streak, the topics,
// «Lo que hiciste»), the scored attempts and the review state (the
// exercises), and the games against the bots (the level and the record). No
// table and no writer are new. The games are read apart, by the play
// service, and never enter the minutes, the streak or the topics: those come
// only from the activity, which playing never writes (no-activity.test.ts).

/** The sparklines' weeks: the last eight, this one included. */
const SPARK_WEEKS = 8;

/** A study day as the daily aggregate stores it: that date at UTC midnight. */
const statDay = (key: string) => new Date(`${key}T00:00:00.000Z`);

/** The aggregate's rows of a range, summed per metric (and topic). */
function statSums(userId: string, range: DayRange) {
  return getPlatformDb().userStatDaily.groupBy({
    by: ["metricId", "topicId"],
    where: { userId, day: { gte: statDay(range.from), lte: statDay(range.to) } },
    _sum: { value: true },
  });
}

type StatSums = Awaited<ReturnType<typeof statSums>>;

/** The totals of a range by metric code (the rows without a topic). */
function totalsByCode(rows: StatSums, codeOf: ReadonlyMap<number, string>): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const code = codeOf.get(row.metricId);
    if (row.topicId === null && code) totals.set(code, (totals.get(code) ?? 0) + (row._sum.value ?? 0));
  }
  return totals;
}

/** The ranges of the eight sparkline weeks, from the first Monday to today. */
function sparkWeeks(today: string) {
  const weeks = weeksUpTo(today, SPARK_WEEKS).map((week) => week.filter((day) => day <= today));
  return { weeks, range: { from: weeks[0]?.[0] ?? today, to: today } };
}

async function studyOf(
  userId: string,
  period: StudentStatistics["period"],
  today: string,
  catalog: Catalog,
): Promise<StudyStatistics> {
  const spark = sparkWeeks(today);
  const earliest = [period.range.from, spark.range.from, period.previous?.whole.from ?? today].sort()[0] ?? today;
  const [minutesByDay, goal, streak, current, previous] = await Promise.all([
    studyMinutesByDayOf(userId, earliest, today),
    getStudyGoal(),
    streakOverviewOf(userId),
    statSums(userId, period.range),
    period.previous ? statSums(userId, period.previous.whole) : Promise.resolve(null),
  ]);
  const minutes: DayValue[] = minutesByDay.map((day) => ({ day: day.day, value: day.minutes }));
  const columns = bucketColumns(period, minutes);
  const currentTotals = totalsByCode(current, catalog.metricCodes);

  return {
    minutes: sumIn(minutes, period.range),
    previousSoFar: period.previous ? sumIn(minutes, period.previous.sameSoFar) : null,
    columns,
    goalMinutes: goal.goalMinutes,
    goalDays:
      period.bucket === "day" && goal.goalMinutes > 0
        ? columns.filter((column) => column.value >= goal.goalMinutes).length
        : null,
    weekly: weeklySums(minutes, spark.weeks),
    streak,
    topics: topicSlices(
      current.flatMap((row) => (row.topicId === null ? [] : [{ topicId: row.topicId, value: row._sum.value ?? 0 }])),
      catalog.topicRoots,
    ),
    did: didComparisons(
      currentTotals,
      previous ? totalsByCode(previous, catalog.metricCodes) : null,
      EXERCISES_ENABLED,
    ),
    coursesCompleted: currentTotals.get(STAT_METRIC.COURSES_COMPLETED) ?? 0,
  };
}

/**
 * The exercises' figures. The attempts are the scored ones the solver keeps
 * (one per exercise and study day), without those made from a class block:
 * those count for the class, not for the student's own figures (D49).
 */
async function exercisesOf(
  userId: string,
  period: StudentStatistics["period"],
  today: string,
  catalog: Catalog,
): Promise<ExerciseStatistics> {
  const db = getPlatformDb();
  const spark = sparkWeeks(today);
  const passedMetric = catalog.metricIds.get(STAT_METRIC.EXERCISES_PASSED);
  const attemptWhere = {
    userId,
    exerciseId: { not: null },
    classBlockId: null,
    createdAt: {
      gte: startOfDay(period.range.from, STUDY_DAY_TIMEZONE),
      lt: startOfDay(rangeEnd(period.range), STUDY_DAY_TIMEZONE),
    },
  };
  const passed = { result: { code: ATTEMPT_RESULT.PASSED } };
  const failed = { result: { code: ATTEMPT_RESULT.FAILED } };
  const now = new Date();
  const viewer = await getExerciseViewer();

  const [passedDays, clean, hinted, wrong, shown, byExercise, passedByExercise, reviewDue] = await Promise.all([
    passedMetric === undefined
      ? Promise.resolve([])
      : db.userStatDaily.findMany({
          where: {
            userId,
            metricId: passedMetric,
            topicId: null,
            day: { gte: statDay([period.range.from, spark.range.from].sort()[0] ?? today), lte: statDay(today) },
          },
          select: { day: true, value: true },
        }),
    db.trainingAttempt.count({ where: { ...attemptWhere, ...passed, hintsUsed: 0 } }),
    db.trainingAttempt.count({ where: { ...attemptWhere, ...passed, hintsUsed: { gt: 0 } } }),
    db.trainingAttempt.count({ where: { ...attemptWhere, ...failed, solutionShown: false } }),
    db.trainingAttempt.count({ where: { ...attemptWhere, ...failed, solutionShown: true } }),
    db.trainingAttempt.groupBy({ by: ["exerciseId"], where: attemptWhere, _count: { _all: true } }),
    db.trainingAttempt.groupBy({ by: ["exerciseId"], where: { ...attemptWhere, ...passed }, _count: { _all: true } }),
    db.userExerciseState.count({
      where: { userId, nextReviewAt: { lte: now }, exercise: buildSolvableExercisesWhere(viewer, now) },
    }),
  ]);

  const solvedOf = new Map(passedByExercise.map((row) => [row.exerciseId, row._count._all]));
  const attempts: ExerciseAttemptCount[] = byExercise.flatMap((row) =>
    row.exerciseId === null
      ? []
      : [{ exerciseId: row.exerciseId, tried: row._count._all, solved: solvedOf.get(row.exerciseId) ?? 0 }],
  );
  const topicRows =
    attempts.length === 0
      ? []
      : await db.exerciseTopic.findMany({
          where: { exerciseId: { in: attempts.map((attempt) => attempt.exerciseId) } },
          select: { exerciseId: true, topicId: true },
        });
  const topicsOf = new Map<string, string[]>();
  for (const row of topicRows) {
    const label = catalog.topicRoots.get(row.topicId);
    if (label) topicsOf.set(row.exerciseId, [...(topicsOf.get(row.exerciseId) ?? []), label]);
  }
  const passedValues: DayValue[] = passedDays.map((row) => ({
    day: row.day.toISOString().slice(0, 10),
    value: row.value,
  }));

  return {
    passed: sumIn(passedValues, period.range),
    weeklyPassed: weeklySums(passedValues, spark.weeks),
    outcomes: { clean, hinted, wrong, shown },
    themes: exerciseThemes(attempts, topicsOf),
    reviewDue,
  };
}

async function playOf(userId: string, period: StudentStatistics["period"]): Promise<PlayStatistics> {
  const [level, scores] = await Promise.all([
    botLevelSummaryOf(userId),
    botScoreboardOf(userId, startOfDay(period.range.from, STUDY_DAY_TIMEZONE)),
  ]);
  const record = { wins: 0, losses: 0, draws: 0, open: 0 };
  for (const score of scores) {
    record.wins += score.wins;
    record.losses += score.losses;
    record.draws += score.draws;
    record.open += score.open;
  }
  return { level, record };
}

/** The catalogs the figures are named by: the metrics by code and id, the topics by the root of their tree. */
interface Catalog {
  metricCodes: Map<number, string>;
  metricIds: Map<string, number>;
  topicRoots: Map<number, string>;
}

const readCatalog = cache(async (): Promise<Catalog> => {
  const db = getPlatformDb();
  const [metrics, topics] = await Promise.all([
    db.statMetric.findMany({ select: { id: true, code: true } }),
    db.topic.findMany({ select: { id: true, label: true, parentId: true } }),
  ]);
  return {
    metricCodes: new Map(metrics.map((metric) => [metric.id, metric.code])),
    metricIds: new Map(metrics.map((metric) => [metric.code, metric.id])),
    topicRoots: rootLabels(topics),
  };
});

/**
 * The current person's statistics for one period. «Ejercicios» is read only
 * with `EXERCISES_ENABLED`, «Jugar» only with `PLAY_ENABLED`; each section
 * runs its queries in parallel with the others.
 */
export const getStudentStatistics = cache(async (key: StatsPeriodKey): Promise<StudentStatistics> => {
  const user = await getCurrentUser();
  const today = dayKey(new Date(), STUDY_DAY_TIMEZONE);
  const period = statsPeriodOf(key, today, dayKey(user.createdAt, STUDY_DAY_TIMEZONE));
  const catalog = await readCatalog();
  const [study, exercises, play] = await Promise.all([
    studyOf(user.id, period, today, catalog),
    EXERCISES_ENABLED ? exercisesOf(user.id, period, today, catalog) : Promise.resolve(null),
    PLAY_ENABLED ? playOf(user.id, period) : Promise.resolve(null),
  ]);
  return { period, today, study, exercises, play };
});
