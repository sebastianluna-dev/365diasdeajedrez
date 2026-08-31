import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import type {
  StaffStudentDetail,
  StaffStudentSummary,
  StudentAssignmentHistoryItem,
} from "./staff-students.types";

// Panel de Administración: alumnos. El staff ve TODAS las cuentas, pero no su
// contenido privado — ni estudios ni partidas aparecen por aquí. Operar cuentas
// no es lo mismo que leer lo que la gente guarda.

/** Sólo la asignación activa; el historial se lee en la ficha. */
const activeAssignmentSelect = {
  where: { endedAt: null },
  select: { teacher: { select: { displayName: true } } },
  take: 1,
} as const;

export async function listStudents(query?: string): Promise<StaffStudentSummary[]> {
  await requireStaff();
  const search = query?.trim();

  const users = await getPlatformDb().user.findMany({
    where: search
      ? {
          OR: [
            { displayName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    select: {
      id: true,
      displayName: true,
      email: true,
      passwordHash: true,
      lastLoginAt: true,
      createdAt: true,
      studentAssignments: activeAssignmentSelect,
    },
    orderBy: { displayName: "asc" },
  });

  return users.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    // El hash nunca sale del servicio: sólo si existe o no.
    hasPassword: user.passwordHash !== null,
    activeTeacherName: user.studentAssignments[0]?.teacher.displayName,
    lastLoginAtIso: user.lastLoginAt?.toISOString(),
    lastLoginAtLabel: user.lastLoginAt ? formatSpanishDate(user.lastLoginAt) : undefined,
    createdAtLabel: formatSpanishDate(user.createdAt),
    href: staffRoutes.studentDetail(user.id),
  }));
}

export async function getStudentAdminDetail(userId: string): Promise<StaffStudentDetail | null> {
  await requireStaff();

  const user = await getPlatformDb().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      passwordHash: true,
      createdAt: true,
      lastLoginAt: true,
      passwordUpdatedAt: true,
      studentAssignments: {
        select: {
          id: true,
          teacherId: true,
          assignedAt: true,
          endedAt: true,
          note: true,
          teacher: { select: { displayName: true } },
          assigner: { select: { displayName: true } },
        },
        orderBy: { assignedAt: "desc" },
      },
      classParticipants: {
        select: {
          attended: true,
          paidAt: true,
          class: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              status: { select: { label: true } },
              teacher: { select: { displayName: true } },
            },
          },
        },
        orderBy: { class: { scheduledAt: "desc" } },
      },
    },
  });

  if (!user) return null;

  const assignments: StudentAssignmentHistoryItem[] = user.studentAssignments.map((assignment) => ({
    id: assignment.id,
    teacherId: assignment.teacherId,
    teacherName: assignment.teacher.displayName,
    assignedAtIso: assignment.assignedAt.toISOString(),
    assignedAtLabel: formatSpanishDate(assignment.assignedAt),
    endedAtIso: assignment.endedAt?.toISOString(),
    endedAtLabel: assignment.endedAt ? formatSpanishDate(assignment.endedAt) : undefined,
    assignedByName: assignment.assigner?.displayName,
    note: assignment.note ?? undefined,
    isActive: assignment.endedAt === null,
  }));

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    hasPassword: user.passwordHash !== null,
    createdAtLabel: formatSpanishDate(user.createdAt),
    lastLoginAtLabel: user.lastLoginAt ? formatSpanishDate(user.lastLoginAt) : undefined,
    passwordUpdatedAtLabel: user.passwordUpdatedAt ? formatSpanishDate(user.passwordUpdatedAt) : undefined,
    assignments,
    classes: user.classParticipants.map((participation) => ({
      classId: participation.class.id,
      title: participation.class.title,
      teacherName: participation.class.teacher.displayName,
      scheduledAtIso: participation.class.scheduledAt.toISOString(),
      dateLabel: formatSpanishDate(participation.class.scheduledAt),
      statusLabel: participation.class.status.label,
      attended: participation.attended,
      hasPayment: participation.paidAt !== null,
    })),
  };
}
