import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffDashboard } from "./staff.types";

// Administration panel. Sober metrics and, above all, the actionable list:
// students without an assigned teacher.

const UNASSIGNED_LIMIT = 20;
const UPCOMING_WINDOW_DAYS = 7;

export async function getStaffDashboard(): Promise<StaffDashboard> {
  await requireStaff();
  const db = getPlatformDb();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // A student is an account that is neither teacher nor staff: there is no role
  // column (the role is the existence of the row), so it is filtered by absence.
  const studentWhere = { teacher: null, staff: null } as const;

  const [studentCount, activeTeacherCount, inactiveTeacherCount, statuses, unassigned, upcoming] = await Promise.all([
    db.user.count({ where: studentWhere }),
    db.teacher.count({ where: { isActive: true } }),
    db.teacher.count({ where: { isActive: false } }),
    db.courseStatus.findMany({
      select: { code: true, label: true, _count: { select: { courses: true } } },
      orderBy: { order: "asc" },
    }),
    db.user.findMany({
      where: { ...studentWhere, studentAssignments: { none: { endedAt: null } } },
      select: { id: true, displayName: true, email: true },
      orderBy: { createdAt: "desc" },
      take: UNASSIGNED_LIMIT,
    }),
    db.class.findMany({
      where: { scheduledAt: { gte: now, lt: windowEnd } },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        status: { select: { label: true } },
        teacher: { select: { displayName: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  return {
    studentCount,
    activeTeacherCount,
    inactiveTeacherCount,
    coursesByStatus: statuses.map((status) => ({
      code: status.code,
      label: status.label,
      count: status._count.courses,
    })),
    unassignedStudents: unassigned.map((student) => ({
      id: student.id,
      displayName: student.displayName,
      email: student.email,
      href: staffRoutes.studentDetail(student.id),
    })),
    upcomingClasses: upcoming.map((upcomingClass) => ({
      id: upcomingClass.id,
      title: upcomingClass.title,
      teacherName: upcomingClass.teacher.displayName,
      scheduledAtIso: upcomingClass.scheduledAt.toISOString(),
      dateLabel: formatSpanishDate(upcomingClass.scheduledAt),
      statusLabel: upcomingClass.status.label,
      href: staffRoutes.staffClassDetail(upcomingClass.id),
    })),
  };
}
