import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { teacherRoutes } from "@/lib/platform-routes";
import { classTitleOf } from "@/services/classes/classes.mapper";
import { mapTeacherClassBrief, teacherClassBriefInclude } from "./teacher.mapper";
import type { TeacherDashboard, TeacherPendingClass, TeacherProfile } from "./teacher.types";

// Services of the teacher panel. Identity and role ALWAYS through
// requireTeacher() (never an id coming from the client) and the authorisation
// goes inside the `where`: there is no "read and then check".

const UPCOMING_WINDOW_DAYS = 7;
const PENDING_LIMIT = 8;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function getTeacherDashboard(): Promise<TeacherDashboard> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const windowEnd = new Date(dayEnd.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [todayRows, upcomingRows, activeStudentCount, pendingRows] = await Promise.all([
    db.class.findMany({
      where: { teacherId: teacher.id, scheduledAt: { gte: dayStart, lt: dayEnd } },
      include: teacherClassBriefInclude,
      orderBy: { scheduledAt: "asc" },
    }),
    db.class.findMany({
      where: { teacherId: teacher.id, scheduledAt: { gte: dayEnd, lt: windowEnd } },
      include: teacherClassBriefInclude,
      orderBy: { scheduledAt: "asc" },
    }),
    db.teacherStudent.count({ where: { teacherId: teacher.id, endedAt: null } }),
    // "Pending": classes that ended and nobody finalized, and finished ones with
    // a seat nobody marked or without a summary. It is the teacher's real work
    // list after giving the class.
    db.class.findMany({
      where: {
        teacherId: teacher.id,
        OR: [
          { status: { code: CLASS_STATUS.SCHEDULED }, endsAt: { lt: now } },
          { status: { code: CLASS_STATUS.COMPLETED }, summary: null },
          { status: { code: CLASS_STATUS.COMPLETED }, participants: { some: { attended: null, seatMovedAt: null } } },
        ],
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        summary: true,
        format: { select: { code: true } },
        teacher: { select: { displayName: true } },
        participants: {
          where: { seatMovedAt: null },
          select: { attended: true, user: { select: { displayName: true } } },
        },
      },
      orderBy: { scheduledAt: "desc" },
      take: PENDING_LIMIT,
    }),
  ]);

  const pending: TeacherPendingClass[] = pendingRows.map((row) => ({
    id: row.id,
    title: classTitleOf(row, "teacher"),
    dateLabel: formatSpanishDate(row.scheduledAt),
    scheduledAtIso: row.scheduledAt.toISOString(),
    needsAttendance: row.participants.some((seat) => seat.attended === null),
    needsSummary: row.summary === null || row.summary.trim().length === 0,
    href: teacherRoutes.classDetail(row.id),
  }));

  return {
    displayName: teacher.displayName,
    today: todayRows.map(mapTeacherClassBrief),
    upcoming: upcomingRows.map(mapTeacherClassBrief),
    activeStudentCount,
    pending,
  };
}

export async function getTeacherProfile(): Promise<TeacherProfile> {
  const { teacher, user } = await requireTeacher();
  const db = getPlatformDb();

  const row = await db.teacher.findUniqueOrThrow({
    where: { id: teacher.id },
    select: { displayName: true, title: true, bio: true, photo: true, timezone: true },
  });

  return {
    displayName: row.displayName,
    title: row.title ?? undefined,
    bio: row.bio ?? undefined,
    photo: row.photo ?? undefined,
    timezone: row.timezone ?? undefined,
    email: user.email,
  };
}
