import { cache } from "react";
import type { ClassStatusCode } from "@/constants/platform/class-codes.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { teacherRoutes } from "@/lib/platform-routes";
import { gameViewInclude, studyDetailInclude, studySummaryInclude } from "@/services/studies/studies.mapper";
import type { GameView, StudyDetail } from "@/services/studies/studies.types";
import { mapStudentGameView, mapStudentStudyDetail, mapStudentStudySummary } from "./teacher-students.mapper";
import type {
  AssignedStudentDetail,
  AssignedStudentSummary,
  StudentActivityItem,
  StudentCourseProgress,
  StudentSharedClass,
} from "./teacher-students.types";

// "Mis alumnos": only those with an ACTIVE assignment to this teacher. That
// condition ALWAYS travels inside the `where` — never "read and then check" — so
// that entering an unassigned student's study by direct URL does not return a
// row that has to be discarded afterwards: it returns nothing.
//
// Everything here is read-only, by product decision: the teacher consults their
// student's studies, they do not edit them. That is why this domain has no
// `.actions.ts`.

const ACTIVITY_LIMIT = 8;

/** Active assignment or null. It is the key to everything else. */
const findActiveAssignment = cache(async (teacherId: string, studentId: string) => {
  return getPlatformDb().teacherStudent.findFirst({
    where: { teacherId, studentId, endedAt: null },
    select: { id: true, assignedAt: true, note: true },
  });
});

export async function getAssignedStudents(query?: string): Promise<AssignedStudentSummary[]> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const search = query?.trim();

  const assignments = await db.teacherStudent.findMany({
    where: {
      teacherId: teacher.id,
      endedAt: null,
      ...(search
        ? {
            student: {
              OR: [
                { displayName: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            },
          }
        : {}),
    },
    select: {
      assignedAt: true,
      student: { select: { id: true, displayName: true, email: true } },
    },
    orderBy: { student: { displayName: "asc" } },
  });

  if (assignments.length === 0) return [];
  const studentIds = assignments.map((assignment) => assignment.student.id);

  // Two aggregate queries instead of two per student: the "Mis alumnos" page
  // cannot degrade into an N+1 as the list grows.
  const [lastActivities, nextClasses] = await Promise.all([
    db.userActivity.groupBy({
      by: ["userId"],
      where: { userId: { in: studentIds } },
      _max: { occurredAt: true },
    }),
    db.classParticipant.findMany({
      where: {
        userId: { in: studentIds },
        class: { teacherId: teacher.id, scheduledAt: { gte: new Date() } },
      },
      select: { userId: true, class: { select: { title: true, scheduledAt: true } } },
      orderBy: { class: { scheduledAt: "asc" } },
    }),
  ]);

  const lastActivityByUser = new Map(lastActivities.map((row) => [row.userId, row._max.occurredAt]));
  const nextClassByUser = new Map<string, { title: string; scheduledAt: Date }>();
  for (const participation of nextClasses) {
    if (!nextClassByUser.has(participation.userId)) nextClassByUser.set(participation.userId, participation.class);
  }

  return assignments.map((assignment) => {
    const { student } = assignment;
    const lastActivity = lastActivityByUser.get(student.id) ?? null;
    const nextClass = nextClassByUser.get(student.id);

    return {
      id: student.id,
      displayName: student.displayName,
      email: student.email,
      assignedAtIso: assignment.assignedAt.toISOString(),
      assignedAtLabel: formatSpanishDate(assignment.assignedAt),
      nextClassLabel: nextClass ? `${nextClass.title} · ${formatSpanishDate(nextClass.scheduledAt)}` : undefined,
      nextClassIso: nextClass?.scheduledAt.toISOString(),
      lastActivityLabel: lastActivity ? formatSpanishDate(lastActivity) : undefined,
      lastActivityIso: lastActivity?.toISOString(),
      href: teacherRoutes.studentDetail(student.id),
    };
  });
}

export async function getAssignedStudentDetail(studentId: string): Promise<AssignedStudentDetail | null> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();

  const assignment = await findActiveAssignment(teacher.id, studentId);
  if (!assignment) return null;

  const now = new Date();
  const [student, courseRows, classRows, studyRows, activityRows, completedLessons, studyTotals] = await Promise.all([
    db.user.findUnique({ where: { id: studentId }, select: { id: true, displayName: true, email: true } }),
    db.courseProgress.findMany({
      where: { userId: studentId },
      select: {
        courseId: true,
        status: { select: { label: true } },
        course: {
          select: {
            name: true,
            chapters: { select: { _count: { select: { lessons: true } } } },
          },
        },
        lastLesson: { select: { name: true } },
      },
    }),
    db.classParticipant.findMany({
      where: { userId: studentId, class: { teacherId: teacher.id } },
      select: {
        attended: true,
        class: {
          select: { id: true, title: true, scheduledAt: true, status: { select: { code: true, label: true } } },
        },
      },
      orderBy: { class: { scheduledAt: "desc" } },
    }),
    db.gameDatabase.findMany({
      where: { userId: studentId },
      include: studySummaryInclude,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    }),
    db.userActivity.findMany({
      where: { userId: studentId },
      select: {
        id: true,
        occurredAt: true,
        type: { select: { label: true } },
        subjectType: { select: { label: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: ACTIVITY_LIMIT,
    }),
    // Completed lessons with their course, in ONE query: the percentage per course
    // is counted in memory instead of with a query per course.
    db.lessonProgress.findMany({
      where: { userId: studentId, status: { code: PROGRESS_STATUS.COMPLETED } },
      select: { lesson: { select: { chapter: { select: { courseId: true } } } } },
    }),
    // The studies' totals: the include's own count is the cited games (see
    // `studySummaryInclude`), so the total comes in one query for all of them.
    db.game.groupBy({
      by: ["databaseId"],
      where: { database: { userId: studentId } },
      _count: { _all: true },
    }),
  ]);

  if (!student) return null;

  const completedCountByCourse = new Map<string, number>();
  for (const progress of completedLessons) {
    const courseId = progress.lesson.chapter.courseId;
    completedCountByCourse.set(courseId, (completedCountByCourse.get(courseId) ?? 0) + 1);
  }

  const courses: StudentCourseProgress[] = courseRows.map((row) => {
    const totalLessons = row.course.chapters.reduce((total, chapter) => total + chapter._count.lessons, 0);
    const completed = completedCountByCourse.get(row.courseId) ?? 0;
    return {
      courseId: row.courseId,
      courseName: row.course.name,
      statusLabel: row.status.label,
      percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
      completedLessons: completed,
      totalLessons,
      lastLessonName: row.lastLesson?.name,
    };
  });

  const mapSharedClass = (row: (typeof classRows)[number]): StudentSharedClass => ({
    id: row.class.id,
    title: row.class.title,
    scheduledAtIso: row.class.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.class.scheduledAt),
    statusCode: row.class.status.code as ClassStatusCode,
    statusLabel: row.class.status.label,
    attended: row.attended,
    href: teacherRoutes.classDetail(row.class.id),
  });

  const activity: StudentActivityItem[] = activityRows.map((row) => ({
    id: row.id,
    typeLabel: row.type.label,
    subjectTypeLabel: row.subjectType.label,
    occurredAtIso: row.occurredAt.toISOString(),
    occurredAtLabel: formatSpanishDate(row.occurredAt),
  }));

  const totalOf = new Map(studyTotals.map((total) => [total.databaseId, total._count._all]));

  return {
    id: student.id,
    displayName: student.displayName,
    email: student.email,
    assignedAtIso: assignment.assignedAt.toISOString(),
    assignedAtLabel: formatSpanishDate(assignment.assignedAt),
    note: assignment.note ?? undefined,
    courses,
    upcomingClasses: classRows
      .filter((row) => row.class.scheduledAt >= now)
      .reverse()
      .map(mapSharedClass),
    pastClasses: classRows.filter((row) => row.class.scheduledAt < now).map(mapSharedClass),
    studies: studyRows.map((row) => mapStudentStudySummary(studentId, row, totalOf.get(row.id) ?? 0)),
    activity,
  };
}

export async function getStudentStudy(studentId: string, studyId: string): Promise<StudyDetail | null> {
  const { teacher } = await requireTeacher();
  const row = await getPlatformDb().gameDatabase.findFirst({
    where: {
      id: studyId,
      userId: studentId,
      user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } },
    },
    include: studyDetailInclude,
  });
  return row ? mapStudentStudyDetail(studentId, row) : null;
}

export async function getStudentGame(studentId: string, studyId: string, gameId: string): Promise<GameView | null> {
  const { teacher } = await requireTeacher();
  const row = await getPlatformDb().game.findFirst({
    where: {
      id: gameId,
      databaseId: studyId,
      database: {
        userId: studentId,
        user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } },
      },
    },
    include: gameViewInclude,
  });
  return row ? mapStudentGameView(studentId, row) : null;
}
