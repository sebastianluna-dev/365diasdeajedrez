import { cache } from "react";
import { SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { rangeStart, type StatsRangeKey } from "@/lib/date-ranges";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { getContinueStudyingCourse } from "@/services/courses/courses.service";
import { activityInclude, mapActivityItems, mapDashboardStats, type StatTotalRow } from "./dashboard.mapper";
import type { ContinueStudyingCard, DashboardData } from "./dashboard.types";

const RECENT_ACTIVITY_LIMIT = 8;
const STATS_RANGES: StatsRangeKey[] = ["week", "month", "year", "all"];

/** Sólo los hechos recientes: la lista de actividad, no las estadísticas. */
const getRecentActivities = cache(async () => {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  return db.userActivity.findMany({
    where: { userId: user.id },
    include: activityInclude,
    orderBy: { occurredAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
  });
});

/**
 * Las estadísticas son un SUM del agregado diario por rango de calendario, y
 * ese SUM lo hace la base: los cuatro rangos son cuatro `groupBy` con distinto
 * filtro de `day`. Antes se leía el histórico entero del alumno y se sumaba
 * en memoria, y ese histórico crece con (día × métrica × tema) por alumno.
 */
async function getStatTotals(userId: string, now: Date): Promise<Record<StatsRangeKey, StatTotalRow[]>> {
  const db = getPlatformDb();
  const grouped = await Promise.all(
    STATS_RANGES.map(async (key) => {
      const start = rangeStart(key, now);
      const rows = await db.userStatDaily.groupBy({
        by: ["metricId", "topicId"],
        where: { userId, ...(start ? { day: { gte: start } } : {}) },
        _sum: { value: true },
      });
      return rows.map((row) => ({ metricId: row.metricId, topicId: row.topicId, total: row._sum.value ?? 0 }));
    }),
  );
  return Object.fromEntries(STATS_RANGES.map((key, index) => [key, grouped[index]])) as Record<
    StatsRangeKey,
    StatTotalRow[]
  >;
}

export async function getUserDashboard(): Promise<DashboardData> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const now = new Date();

  const [recent, statTotals, metrics, topics, inProgress] = await Promise.all([
    getRecentActivities(),
    getStatTotals(user.id, now),
    db.statMetric.findMany({ orderBy: { order: "asc" }, select: { id: true, label: true } }),
    db.topic.findMany({ select: { id: true, label: true } }),
    getContinueStudyingCourse(),
  ]);

  // Nombres de los sujetos de la actividad reciente, por tipo de sujeto.
  const idsFor = (code: string) => recent.filter((row) => row.subjectType.code === code).map((row) => row.subjectId);

  const [lessons, coursesRows, classes, games, exercises] = await Promise.all([
    db.lesson.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.LESSON) } }, select: { id: true, name: true } }),
    db.course.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.COURSE) } }, select: { id: true, name: true } }),
    db.class.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.CLASS) } }, select: { id: true, title: true } }),
    db.game.findMany({
      where: { id: { in: idsFor(SUBJECT_TYPE.GAME) } },
      select: { id: true, white: true, black: true },
    }),
    db.trainingExercise.findMany({
      where: { id: { in: idsFor(SUBJECT_TYPE.EXERCISE) } },
      select: { id: true, lesson: { select: { name: true } } },
    }),
  ]);

  const subjectNames = new Map<string, string>();
  for (const row of lessons) subjectNames.set(row.id, row.name);
  for (const row of coursesRows) subjectNames.set(row.id, row.name);
  for (const row of classes) subjectNames.set(row.id, row.title);
  for (const row of games) subjectNames.set(row.id, `${row.white} – ${row.black}`);
  for (const row of exercises) subjectNames.set(row.id, row.lesson.name);

  // «Continuar estudiando»: el curso en progreso, con su punto de retorno.
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
}
