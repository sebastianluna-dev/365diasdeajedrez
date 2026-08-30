import { cache } from "react";
import { SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { getUserCourses } from "@/services/courses/courses.service";
import { activityInclude, mapActivityItems, mapDashboardStats } from "./dashboard.mapper";
import type { ContinueStudyingCard, DashboardData } from "./dashboard.types";

const RECENT_ACTIVITY_LIMIT = 8;

const getUserActivities = cache(async () => {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  return db.userActivity.findMany({
    where: { userId: user.id },
    include: activityInclude,
    orderBy: { occurredAt: "desc" },
  });
});

export async function getUserDashboard(): Promise<DashboardData> {
  const db = getPlatformDb();
  const [user, activities, courses] = await Promise.all([getCurrentUser(), getUserActivities(), getUserCourses()]);
  const now = new Date();

  const typeLabels = await db.activityType.findMany({ orderBy: { order: "asc" }, select: { label: true } });

  // Nombres de los sujetos de la actividad reciente, por tipo de sujeto.
  const recent = activities.slice(0, RECENT_ACTIVITY_LIMIT);
  const idsFor = (code: string) =>
    recent.filter((row) => row.subjectType.code === code).map((row) => row.subjectId);

  const [lessons, coursesRows, classes, games, exercises] = await Promise.all([
    db.lesson.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.LESSON) } }, select: { id: true, name: true } }),
    db.course.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.COURSE) } }, select: { id: true, name: true } }),
    db.class.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.CLASS) } }, select: { id: true, title: true } }),
    db.game.findMany({ where: { id: { in: idsFor(SUBJECT_TYPE.GAME) } }, select: { id: true, white: true, black: true } }),
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

  // «Continuar estudiando»: el primer curso en progreso, con su punto de retorno.
  const inProgress = courses.find((course) => course.progress.statusCode === PROGRESS_STATUS.IN_PROGRESS);
  let continueStudying: ContinueStudyingCard | undefined;
  if (inProgress) {
    const progressRow = await db.courseProgress.findFirst({
      where: { userId: user.id, courseId: inProgress.id },
      select: { lastLesson: { select: { name: true } } },
    });
    continueStudying = {
      courseName: inProgress.name,
      lessonName: progressRow?.lastLesson?.name ?? "Primera lección",
      percent: inProgress.progress.percent,
      completedLessons: inProgress.progress.completedLessons,
      totalLessons: inProgress.progress.totalLessons,
      href: inProgress.continueHref,
    };
  }

  return {
    profile: {
      displayName: user.displayName,
      email: user.email,
      memberSinceLabel: formatSpanishDate(user.createdAt),
    },
    stats: mapDashboardStats(activities, typeLabels.map((row) => row.label), now),
    continueStudying,
    recentActivity: mapActivityItems(recent, subjectNames),
  };
}
