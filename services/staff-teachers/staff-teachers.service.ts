import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import type { AssignableStudent, LinkableUser, StaffTeacherDetail, StaffTeacherSummary } from "./staff-teachers.types";

// Administration panel: teachers and assignments. A teacher is NEVER deleted
// (it would drag along classes and historical assignments): they are deactivated.

export async function listTeachers(): Promise<StaffTeacherSummary[]> {
  await requireStaff();

  const teachers = await getPlatformDb().teacher.findMany({
    select: {
      id: true,
      displayName: true,
      title: true,
      isActive: true,
      user: { select: { email: true } },
      _count: { select: { classes: true, students: { where: { endedAt: null } } } },
    },
    orderBy: [{ isActive: "desc" }, { displayName: "asc" }],
  });

  return teachers.map((teacher) => ({
    id: teacher.id,
    displayName: teacher.displayName,
    title: teacher.title ?? undefined,
    email: teacher.user.email,
    isActive: teacher.isActive,
    activeStudentCount: teacher._count.students,
    classCount: teacher._count.classes,
    href: staffRoutes.teacherDetail(teacher.id),
  }));
}

export async function getTeacherAdminDetail(teacherId: string): Promise<StaffTeacherDetail | null> {
  await requireStaff();

  const teacher = await getPlatformDb().teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      userId: true,
      displayName: true,
      title: true,
      bio: true,
      photo: true,
      timezone: true,
      isActive: true,
      user: { select: { email: true } },
      students: {
        where: { endedAt: null },
        select: {
          id: true,
          assignedAt: true,
          note: true,
          student: { select: { id: true, displayName: true, email: true } },
        },
        orderBy: { student: { displayName: "asc" } },
      },
      classes: {
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          status: { select: { label: true } },
          _count: { select: { participants: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 20,
      },
    },
  });

  if (!teacher) return null;

  return {
    id: teacher.id,
    userId: teacher.userId,
    displayName: teacher.displayName,
    title: teacher.title ?? undefined,
    bio: teacher.bio ?? undefined,
    photo: teacher.photo ?? undefined,
    timezone: teacher.timezone ?? undefined,
    email: teacher.user.email,
    isActive: teacher.isActive,
    students: teacher.students.map((assignment) => ({
      assignmentId: assignment.id,
      studentId: assignment.student.id,
      studentName: assignment.student.displayName,
      studentEmail: assignment.student.email,
      assignedAtIso: assignment.assignedAt.toISOString(),
      assignedAtLabel: formatSpanishDate(assignment.assignedAt),
      note: assignment.note ?? undefined,
      studentHref: staffRoutes.studentDetail(assignment.student.id),
    })),
    classes: teacher.classes.map((teacherClass) => ({
      id: teacherClass.id,
      title: teacherClass.title,
      scheduledAtIso: teacherClass.scheduledAt.toISOString(),
      dateLabel: formatSpanishDate(teacherClass.scheduledAt),
      statusLabel: teacherClass.status.label,
      participantCount: teacherClass._count.participants,
    })),
  };
}

/** Active teachers: the only ones who can receive assignments. */
export async function listActiveTeachers(): Promise<{ id: string; displayName: string }[]> {
  await requireStaff();
  return getPlatformDb().teacher.findMany({
    where: { isActive: true },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}

/**
 * Students who can be assigned, with the teacher they have now (so it can be
 * said that assigning them is reassigning them). Accounts that are teacher or
 * staff are excluded: they are nobody's students.
 */
export async function listAssignableStudents(): Promise<AssignableStudent[]> {
  await requireStaff();

  const users = await getPlatformDb().user.findMany({
    where: { teacher: null, staff: null },
    select: {
      id: true,
      displayName: true,
      email: true,
      studentAssignments: {
        where: { endedAt: null },
        select: { teacher: { select: { displayName: true } } },
        take: 1,
      },
    },
    orderBy: { displayName: "asc" },
  });

  return users.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    currentTeacherName: user.studentAssignments[0]?.teacher.displayName,
  }));
}

/** Accounts without a teacher record, for the "link existing user" mode. */
export async function listLinkableUsers(): Promise<LinkableUser[]> {
  await requireStaff();
  return getPlatformDb().user.findMany({
    where: { teacher: null },
    select: { id: true, displayName: true, email: true },
    orderBy: { displayName: "asc" },
  });
}
