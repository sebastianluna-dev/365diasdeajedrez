import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { teacherRoutes } from "@/lib/platform-routes";
import { mapTeacherClassBrief, teacherClassBriefInclude } from "./teacher.mapper";
import type { TeacherDashboard, TeacherPendingClass, TeacherProfile } from "./teacher.types";

// Servicios del panel del profesor. Identidad y rol SIEMPRE por requireTeacher()
// (nunca un id que venga del cliente) y la autorización va dentro del `where`:
// no existe «leer y luego comprobar».

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
    // «Pendientes de documentar»: clases ya terminadas sin asistencia marcada o
    // sin resumen. Es la lista de trabajo real del profesor tras dar la clase.
    db.class.findMany({
      where: {
        teacherId: teacher.id,
        status: { code: CLASS_STATUS.COMPLETED },
        OR: [{ summary: null }, { participants: { some: { attended: false } } }],
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        summary: true,
        _count: { select: { participants: { where: { attended: false } } } },
      },
      orderBy: { scheduledAt: "desc" },
      take: PENDING_LIMIT,
    }),
  ]);

  const pending: TeacherPendingClass[] = pendingRows.map((row) => ({
    id: row.id,
    title: row.title,
    dateLabel: formatSpanishDate(row.scheduledAt),
    scheduledAtIso: row.scheduledAt.toISOString(),
    needsAttendance: row._count.participants > 0,
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
