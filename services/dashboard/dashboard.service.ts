import { cache } from "react";
import { SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import type { StatsRangeKey } from "@/lib/date-ranges";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { getContinueStudyingCourse } from "@/services/courses/courses.service";
import {
  activityInclude,
  bucketStatRangeSums,
  mapActivityItems,
  mapDashboardStats,
  statRangeSumsQuery,
  type StatRangeSumsRow,
  type StatTotalRow,
} from "./dashboard.mapper";
import type { ContinueStudyingCard, DashboardData } from "./dashboard.types";

const RECENT_ACTIVITY_LIMIT = 8;

/** Only the recent facts: the activity list, not the statistics. */
function getRecentActivities(userId: string) {
  return getPlatformDb().userActivity.findMany({
    where: { userId },
    include: activityInclude,
    orderBy: { occurredAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
  });
}

/**
 * The statistics are a SUM of the daily aggregate per calendar range, and that
 * SUM is done by the database: the four ranges are ONE query
 * (`statRangeSumsQuery`, a `SUM … FILTER` per range), split per range by
 * `bucketStatRangeSums`. They were four `groupBy` with a different `day`
 * filter; before that, the student's whole history was read and summed in
 * memory, and that history grows with (day × metric × topic) per student.
 */
async function getStatTotals(userId: string, now: Date): Promise<Record<StatsRangeKey, StatTotalRow[]>> {
  const rows = await getPlatformDb().$queryRaw<StatRangeSumsRow[]>(statRangeSumsQuery(userId, now));
  return bucketStatRangeSums(rows);
}

/**
 * The rows of these ids, or none without asking when there are no ids: a
 * subject type absent from the recent activity costs no query.
 */
function readByIds<T>(ids: string[], read: (ids: string[]) => Promise<T[]>): Promise<T[]> {
  return ids.length > 0 ? read(ids) : Promise.resolve([]);
}

/**
 * Four sections of `/inicio` read their slice of this (profile, «Continuar
 * estudiando», statistics, recent activity), so it is memoised per request:
 * without `cache()` each section ran every query of the dashboard again — the
 * sums four times over, and the course in progress and the names with them.
 */
export const getUserDashboard = cache(async (): Promise<DashboardData> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const now = new Date();

  const [recent, statTotals, metrics, topics, inProgress] = await Promise.all([
    getRecentActivities(user.id),
    getStatTotals(user.id, now),
    db.statMetric.findMany({ orderBy: { order: "asc" }, select: { id: true, label: true } }),
    db.topic.findMany({ select: { id: true, label: true } }),
    getContinueStudyingCourse(),
  ]);

  // Names of the subjects of the recent activity: one query per subject type
  // that appears in it, all of them together.
  const idsFor = (code: string) => recent.filter((row) => row.subjectType.code === code).map((row) => row.subjectId);

  const [lessons, coursesRows, classes, games, exercises] = await Promise.all([
    readByIds(idsFor(SUBJECT_TYPE.LESSON), (ids) =>
      db.lesson.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }),
    ),
    readByIds(idsFor(SUBJECT_TYPE.COURSE), (ids) =>
      db.course.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }),
    ),
    readByIds(idsFor(SUBJECT_TYPE.CLASS), (ids) =>
      db.class.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } }),
    ),
    readByIds(idsFor(SUBJECT_TYPE.GAME), (ids) =>
      db.game.findMany({ where: { id: { in: ids } }, select: { id: true, white: true, black: true } }),
    ),
    // An exercise is named after its lesson, read in the same query (Prisma's
    // join strategy, the default here: `relationJoins` in schema.prisma).
    readByIds(idsFor(SUBJECT_TYPE.EXERCISE), (ids) =>
      db.trainingExercise.findMany({
        where: { id: { in: ids } },
        select: { id: true, lesson: { select: { name: true } } },
      }),
    ),
  ]);

  const subjectNames = new Map<string, string>();
  for (const row of lessons) subjectNames.set(row.id, row.name);
  for (const row of coursesRows) subjectNames.set(row.id, row.name);
  for (const row of classes) subjectNames.set(row.id, row.title);
  for (const row of games) subjectNames.set(row.id, `${row.white} – ${row.black}`);
  for (const row of exercises) subjectNames.set(row.id, row.lesson.name);

  // "Continuar estudiando": the course in progress, with its return point.
  const continueStudying: ContinueStudyingCard | undefined = inProgress
    ? {
        courseName: inProgress.name,
        lessonName: inProgress.lastLessonName ?? "Primera lección",
        percent: inProgress.progress.percent,
        completedLessons: inProgress.progress.completedLessons,
        totalLessons: inProgress.progress.totalLessons,
        href: inProgress.continueHref,
      }
    : undefined;

  return {
    profile: {
      displayName: user.displayName,
      email: user.email,
      memberSinceLabel: formatSpanishDate(user.createdAt),
    },
    stats: mapDashboardStats(statTotals, { metrics, topics: new Map(topics.map((row) => [row.id, row.label])) }),
    continueStudying,
    recentActivity: mapActivityItems(recent, subjectNames),
  };
});
