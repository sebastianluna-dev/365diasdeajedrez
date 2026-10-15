import {
  CLASS_FORMAT,
  CLASS_STATUS,
  type ClassStatusCode,
  type TranscriptStatusCode,
} from "@/constants/platform/class-codes.const";
import type { CurrencyCode } from "@/constants/platform/currency-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { formatClassAmount } from "@/lib/format-class-amount";
import { formatClassDay } from "@/lib/format-class-when";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { classDetailInclude, classPhaseOf, classTitleOf, mapClassBlocks } from "@/services/classes/classes.mapper";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import type { StaffClassDetail, StaffClassFilters, StaffClassSummary } from "./staff-classes.types";

// Global view of classes for support. The staff READS everything (payments
// included, which are administrative data) but does not own the classes: it has
// only two actions, in staff-classes.actions.ts. The blocks, the attendance, the
// metadata and the participants belong to the teacher.

export async function listAllClasses(filters: StaffClassFilters = {}): Promise<StaffClassSummary[]> {
  await requireStaff();
  const search = filters.q?.trim();

  const rows = await getPlatformDb().class.findMany({
    where: {
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.statusCode ? { status: { code: filters.statusCode } } : {}),
      ...(filters.from || filters.to
        ? {
            scheduledAt: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) },
          }
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
      format: { select: { code: true } },
      teacher: { select: { displayName: true } },
      _count: { select: { participants: true } },
      participants: {
        where: { seatMovedAt: null },
        select: { attended: true, user: { select: { displayName: true } } },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    title: classTitleOf(row, "staff"),
    teacherId: row.teacherId,
    teacherName: row.teacher.displayName,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    participantCount: row._count.participants,
    attendedCount: row.participants.filter((seat) => seat.attended === true).length,
    href: staffRoutes.staffClassDetail(row.id),
  }));
}

export async function getClassAdminDetail(classId: string): Promise<StaffClassDetail | null> {
  await requireStaff();
  const db = getPlatformDb();
  const now = new Date();

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
        format: { select: { code: true } },
        meetingProvider: { select: { label: true } },
        teacher: { select: { displayName: true } },
        participants: {
          select: {
            userId: true,
            attended: true,
            isFree: true,
            seatMovedAt: true,
            payment: {
              select: { paidOn: true, amount: true, reference: true, currency: { select: { code: true } } },
            },
            user: { select: { displayName: true, email: true } },
          },
          orderBy: { user: { displayName: "asc" } },
        },
        transcript: { select: { text: true, status: { select: { code: true, label: true } } } },
      },
    }),
    // The blocks are mapped with the student's mapper, every one of them: the
    // staff sees what the student sees and what they do not yet (each block
    // carries its visibility).
    db.class.findUnique({ where: { id: classId }, include: classDetailInclude }),
  ]);

  if (!row || !blocksRow) return null;

  return {
    id: row.id,
    title: classTitleOf(
      { ...row, participants: row.participants.filter((seat) => seat.seatMovedAt === null) },
      "staff",
    ),
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
      seatLabel: seatLabelOf(participant, now),
    })),
    blocks: mapClassBlocks(blocksRow.blocks, { audience: "staff", phase: classPhaseOf(blocksRow, now) }),
    transcript: row.transcript
      ? {
          statusCode: row.transcript.status.code as TranscriptStatusCode,
          statusLabel: row.transcript.status.label,
          text: row.transcript.text ?? undefined,
        }
      : undefined,
  };
}

/** «Pago del jue 1 oct · $1,400.00 MXN · Transferencia 8841», «Gratis» or «Sin pago». */
function seatLabelOf(
  seat: {
    isFree: boolean;
    payment: {
      paidOn: Date;
      amount: { toString(): string };
      reference: string | null;
      currency: { code: string };
    } | null;
  },
  now: Date,
): string {
  if (seat.payment) {
    const parts = [
      `Pago del ${formatClassDay(seat.payment.paidOn, STUDY_DAY_TIMEZONE, now)}`,
      formatClassAmount(seat.payment.amount.toString(), seat.payment.currency.code as CurrencyCode, { withCode: true }),
      ...(seat.payment.reference ? [seat.payment.reference] : []),
    ];
    return parts.join(" · ");
  }
  return seat.isFree ? "Gratis" : "Sin pago";
}

/** The group classes still ahead with a seat free, for «Programar» in a group class; the student's own and the full ones are marked. */
export async function listOpenGroupClasses(now: Date, studentId?: string): Promise<OpenGroupClassOption[]> {
  await requireStaff();
  const rows = await getPlatformDb().class.findMany({
    where: {
      format: { code: CLASS_FORMAT.GROUP },
      status: { code: CLASS_STATUS.SCHEDULED },
      scheduledAt: { gt: now },
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      capacity: true,
      teacher: { select: { displayName: true } },
      participants: { where: { seatMovedAt: null }, select: { userId: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
  return rows.map((row) => {
    const seated = row.participants.length;
    const capacity = row.capacity ?? seated;
    const inIt = studentId !== undefined && row.participants.some((seat) => seat.userId === studentId);
    return {
      classId: row.id,
      title: row.title ?? "Clase grupal",
      startIso: row.scheduledAt.toISOString(),
      durationMin: row.durationMin,
      teacherName: row.teacher.displayName,
      seated,
      capacity,
      ...(inIt
        ? { disabledReason: "Ya está en esta clase" }
        : seated >= capacity
          ? { disabledReason: "Completa" }
          : {}),
    };
  });
}

/** The active teachers, for the selects that date a class. */
export async function listActiveTeacherOptions(): Promise<TeacherOption[]> {
  await requireStaff();
  return getPlatformDb().teacher.findMany({
    where: { isActive: true },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}

/** Teachers for the listing's filter. */
export async function listTeacherFilterOptions(): Promise<{ id: string; displayName: string }[]> {
  await requireStaff();
  return getPlatformDb().teacher.findMany({ select: { id: true, displayName: true }, orderBy: { displayName: "asc" } });
}
