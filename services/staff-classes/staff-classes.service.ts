import type { ClassStatusCode, TranscriptStatusCode } from "@/constants/platform/class-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { classDetailInclude, mapClassDetail } from "@/services/classes/classes.mapper";
import type { StaffClassDetail, StaffClassFilters, StaffClassSummary } from "./staff-classes.types";

// Vista global de clases para soporte. El staff LEE todo (incluidos los pagos,
// que son un dato administrativo) pero no es dueño de las clases: sólo tiene
// dos acciones, en staff-classes.actions.ts. Los bloques, la asistencia, los
// metadatos y los participantes son del profesor.

export async function listAllClasses(filters: StaffClassFilters = {}): Promise<StaffClassSummary[]> {
  await requireStaff();
  const search = filters.q?.trim();

  const rows = await getPlatformDb().class.findMany({
    where: {
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.statusCode ? { status: { code: filters.statusCode } } : {}),
      ...(filters.from || filters.to
        ? { scheduledAt: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
        : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      title: true,
      teacherId: true,
      scheduledAt: true,
      durationMin: true,
      status: { select: { code: true, label: true } },
      teacher: { select: { displayName: true } },
      _count: { select: { participants: true } },
      participants: { where: { attended: true }, select: { userId: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    teacherId: row.teacherId,
    teacherName: row.teacher.displayName,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    participantCount: row._count.participants,
    attendedCount: row.participants.length,
    href: staffRoutes.staffClassDetail(row.id),
  }));
}

export async function getClassAdminDetail(classId: string): Promise<StaffClassDetail | null> {
  await requireStaff();
  const db = getPlatformDb();

  const [row, blocksRow] = await Promise.all([
    db.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        durationMin: true,
        meetingUrl: true,
        recordingUrl: true,
        summary: true,
        status: { select: { code: true, label: true } },
        meetingProvider: { select: { label: true } },
        teacher: { select: { displayName: true } },
        participants: {
          select: {
            userId: true,
            attended: true,
            paidAt: true,
            amount: true,
            currency: true,
            paymentRef: true,
            user: { select: { displayName: true, email: true } },
          },
          orderBy: { user: { displayName: "asc" } },
        },
        transcript: { select: { text: true, status: { select: { code: true, label: true } } } },
      },
    }),
    // Los bloques se mapean con el mapper del ALUMNO: soporte tiene que ver
    // exactamente lo que ve quien asistió a la clase.
    db.class.findUnique({ where: { id: classId }, include: classDetailInclude }),
  ]);

  if (!row || !blocksRow) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    teacherName: row.teacher.displayName,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    meetingProviderLabel: row.meetingProvider?.label,
    meetingUrl: row.meetingUrl ?? undefined,
    recordingUrl: row.recordingUrl ?? undefined,
    summary: row.summary ?? undefined,
    participants: row.participants.map((participant) => ({
      userId: participant.userId,
      displayName: participant.user.displayName,
      email: participant.user.email,
      attended: participant.attended,
      paidAtLabel: participant.paidAt ? formatSpanishDate(participant.paidAt) : undefined,
      amountLabel: participant.amount ? `${participant.amount.toString()} ${participant.currency ?? ""}`.trim() : undefined,
      paymentRef: participant.paymentRef ?? undefined,
    })),
    blocks: mapClassDetail(blocksRow, new Date()).blocks,
    transcript: row.transcript
      ? {
          statusCode: row.transcript.status.code as TranscriptStatusCode,
          statusLabel: row.transcript.status.label,
          text: row.transcript.text ?? undefined,
        }
      : undefined,
  };
}

/** Profesores para el filtro del listado. */
export async function listTeacherFilterOptions(): Promise<{ id: string; displayName: string }[]> {
  await requireStaff();
  return getPlatformDb().teacher.findMany({ select: { id: true, displayName: true }, orderBy: { displayName: "asc" } });
}
