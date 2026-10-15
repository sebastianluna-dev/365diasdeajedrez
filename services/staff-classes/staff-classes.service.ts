import { cache } from "react";
import type { ClassAgendaDay } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import {
  CLASS_FORMAT,
  CLASS_PHASE,
  CLASS_STATUS,
  type ClassFormatCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { formatClassDay, formatClassWhen, formatLongDay } from "@/lib/format-class-when";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { staffRoutes } from "@/lib/platform-routes";
import { dayKeyIn, formatDateTimeLocal, parseDateTimeLocal } from "@/lib/timezone";
import { classDetailInclude, classPhaseOf, mapClassBlocks } from "@/services/classes/classes.mapper";
import { buildClassHistory } from "@/services/shared/class-history";
import { editableClassFields } from "@/services/shared/class-rules";
import { meetingVisibleFrom } from "@/services/shared/meeting-visible-from";
import { unpaidSeatWhere } from "@/services/shared/payment-seats";
import { balanceLine } from "@/services/staff-payments/staff-payments.mapper";
import {
  listSeatsToSchedule,
  listStudentBalances,
  paymentOrdinals,
} from "@/services/staff-payments/staff-payments.service";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import {
  agendaHeadline,
  agoLabel,
  groupAgendaDays,
  mapAgendaRow,
  mapPastRow,
  mapStaffSeat,
  paymentDayLabel,
  staffClassTitle,
  type StaffAgendaClassRow,
  type StaffSeatRow,
} from "./staff-classes.mapper";
import type {
  NewClassDefaults,
  SchedulableStudent,
  StaffAgendaFilters,
  StaffAgendaView,
  StaffClassDetail,
  StaffQueuesView,
} from "./staff-classes.types";

// The staff's reads about classes: the agenda and what needs attention, a
// class's record with every seat and its history, and what the forms that
// create a class or seat a student need to know. Every reader opens with
// `requireStaff()`. The staff reads the payments too (they are theirs), but
// only as «which payment», never as an amount: the amounts stay in
// services/staff-payments.

const PAGE_SIZE = 50;
const DAY_MS = 24 * 60 * 60 * 1000;
const WARNING_AFTER_MS = DAY_MS;
const NO_LINK_HORIZON_MS = 48 * 60 * 60 * 1000;

const agendaSelect = {
  id: true,
  title: true,
  scheduledAt: true,
  endsAt: true,
  durationMin: true,
  capacity: true,
  meetingUrl: true,
  meetingUrlVisibleFrom: true,
  status: { select: { code: true } },
  format: { select: { code: true } },
  teacher: { select: { id: true, displayName: true, isActive: true } },
  participants: {
    select: {
      userId: true,
      isFree: true,
      paymentId: true,
      seatMovedAt: true,
      attended: true,
      user: { select: { displayName: true } },
    },
  },
} satisfies Prisma.ClassSelect;

type AgendaDbRow = Prisma.ClassGetPayload<{ select: typeof agendaSelect }>;

function toAgendaRow(row: AgendaDbRow): StaffAgendaClassRow {
  return {
    id: row.id,
    title: row.title,
    scheduledAt: row.scheduledAt,
    endsAt: row.endsAt,
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    formatCode: row.format.code as ClassFormatCode,
    capacity: row.capacity,
    meetingUrl: row.meetingUrl,
    meetingUrlVisibleFrom: row.meetingUrlVisibleFrom,
    teacher: row.teacher,
    seats: row.participants.map((seat) => ({
      userId: seat.userId,
      displayName: seat.user.displayName,
      isFree: seat.isFree,
      paymentId: seat.paymentId,
      seatMovedAt: seat.seatMovedAt,
      attended: seat.attended,
    })),
  };
}

const shiftKey = (key: string, days: number) =>
  new Date(Date.parse(`${key}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** The first instant of a day in the academy's zone. */
function dayStart(key: string): Date {
  const instant = parseDateTimeLocal(`${key}T00:00`, STUDY_DAY_TIMEZONE);
  if (!instant) throw new Error(`«${key}» is not a day`);
  return instant;
}

/** The agenda's filters as a Prisma `where`: the teacher, and the text in the topic or a student's name. */
function agendaWhere(filters: StaffAgendaFilters): Prisma.ClassWhereInput {
  const q = filters.q?.trim();
  return {
    ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { participants: { some: { user: { displayName: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };
}

/**
 * The agenda (ADM-1): «Próximas» by day from today until `hasta`, «Pasadas»
 * paged and newest first, «Canceladas». The headline counts today's classes
 * and the week's whatever the tab.
 */
export async function getStaffAgenda(filters: StaffAgendaFilters): Promise<StaffAgendaView> {
  await requireStaff();
  const db = getPlatformDb();
  const now = new Date();
  const timeZone = STUDY_DAY_TIMEZONE;
  const todayKey = dayKeyIn(now, timeZone);
  const hastaKey =
    filters.hasta && DAY_KEY.test(filters.hasta) && filters.hasta >= todayKey ? filters.hasta : shiftKey(todayKey, 6);
  const notCancelled = { status: { code: { not: CLASS_STATUS.CANCELLED } } } as const;
  const where = agendaWhere(filters);

  const [todayCount, weekCount] = await Promise.all([
    db.class.count({
      where: {
        ...where,
        ...notCancelled,
        scheduledAt: { gte: dayStart(todayKey), lt: dayStart(shiftKey(todayKey, 1)) },
      },
    }),
    db.class.count({
      where: {
        ...where,
        ...notCancelled,
        scheduledAt: { gte: dayStart(todayKey), lt: dayStart(shiftKey(todayKey, 7)) },
      },
    }),
  ]);

  let days: ClassAgendaDay[] = [];
  let past: StaffAgendaView["past"] = { rows: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  let cancelled: StaffAgendaView["cancelled"] = [];

  if (filters.vista === "proximas") {
    const rows = await db.class.findMany({
      where: {
        ...where,
        ...notCancelled,
        scheduledAt: { gte: dayStart(todayKey), lt: dayStart(shiftKey(hastaKey, 1)) },
      },
      select: agendaSelect,
      orderBy: { scheduledAt: "asc" },
    });
    days = groupAgendaDays(
      rows.map((row) => mapAgendaRow(toAgendaRow(row), now, timeZone)),
      timeZone,
      now,
    );
  } else if (filters.vista === "pasadas") {
    const pastWhere = { ...where, ...notCancelled, endsAt: { lt: now } };
    const total = await db.class.count({ where: pastWhere });
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, filters.pagina), pages);
    const rows = await db.class.findMany({
      where: pastWhere,
      select: agendaSelect,
      orderBy: { scheduledAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    past = { rows: rows.map((row) => mapPastRow(toAgendaRow(row), now, timeZone)), total, page, pageSize: PAGE_SIZE };
  } else {
    const rows = await db.class.findMany({
      where: { ...where, status: { code: CLASS_STATUS.CANCELLED } },
      select: agendaSelect,
      orderBy: { scheduledAt: "desc" },
      take: 100,
    });
    cancelled = rows.map((row) => mapAgendaRow(toAgendaRow(row), now, timeZone));
  }

  return {
    filters: { ...filters, hasta: hastaKey },
    timeZone,
    nowIso: now.toISOString(),
    headline: agendaHeadline(todayKey, todayCount, weekCount),
    days,
    foot: {
      untilLabel: `Hasta el ${formatLongDay(hastaKey, todayKey)}`,
      nextHref: staffRoutes.classesFiltered({
        vista: "proximas",
        profesor: filters.teacherId,
        q: filters.q,
        hasta: shiftKey(hastaKey, 7),
      }),
    },
    past,
    cancelled,
  };
}

/** What needs the staff's attention (ADM-1's right column). */
export async function getStaffQueues(): Promise<StaffQueuesView> {
  await requireStaff();
  const db = getPlatformDb();
  const now = new Date();
  const timeZone = STUDY_DAY_TIMEZONE;

  const [toSchedule, toFinalizeRows, noLinkRows, unpaidRows, inactiveRows, balances] = await Promise.all([
    listSeatsToSchedule(now),
    db.class.findMany({
      where: { status: { code: CLASS_STATUS.SCHEDULED }, endsAt: { lt: now } },
      select: agendaSelect,
      orderBy: { endsAt: "asc" },
    }),
    db.class.findMany({
      where: {
        status: { code: CLASS_STATUS.SCHEDULED },
        meetingUrl: null,
        scheduledAt: { gte: now, lt: new Date(now.getTime() + NO_LINK_HORIZON_MS) },
      },
      select: agendaSelect,
      orderBy: { scheduledAt: "asc" },
    }),
    db.classParticipant.findMany({
      where: unpaidSeatWhere,
      select: {
        classId: true,
        user: { select: { id: true, displayName: true, email: true } },
        class: { select: agendaSelect },
      },
      orderBy: { class: { scheduledAt: "asc" } },
    }),
    db.class.findMany({
      where: { status: { code: CLASS_STATUS.SCHEDULED }, scheduledAt: { gte: now }, teacher: { isActive: false } },
      select: agendaSelect,
      orderBy: { scheduledAt: "asc" },
    }),
    listStudentBalances(now),
  ]);

  return {
    toSchedule,
    toFinalize: toFinalizeRows.map((row) => {
      const cls = toAgendaRow(row);
      return {
        classId: cls.id,
        href: staffRoutes.staffClassDetail(cls.id),
        title: staffClassTitle(cls),
        line: `${formatClassDay(cls.scheduledAt, timeZone, now)} · ${cls.teacher.displayName} · terminó ${agoLabel(cls.endsAt, now)}`,
        warning: now.getTime() - cls.endsAt.getTime() >= WARNING_AFTER_MS,
      };
    }),
    noLink: noLinkRows.map((row) => {
      const cls = toAgendaRow(row);
      return {
        classId: cls.id,
        href: staffRoutes.staffClassDetail(cls.id),
        title: staffClassTitle(cls),
        line: formatClassWhen({ start: cls.scheduledAt, durationMin: cls.durationMin, timeZone, now }),
        current: {
          meetingUrl: null,
          visibleFromIso: null,
          startIso: cls.scheduledAt.toISOString(),
          durationMin: cls.durationMin,
        },
      };
    }),
    unpaid: unpaidRows.map((seat) => {
      const cls = toAgendaRow(seat.class);
      return {
        classId: cls.id,
        href: staffRoutes.staffClassDetail(cls.id),
        student: seat.user,
        title: staffClassTitle(cls),
        line: formatClassDay(cls.scheduledAt, timeZone, now),
      };
    }),
    inactiveTeacher: inactiveRows.map((row) => {
      const cls = toAgendaRow(row);
      return {
        classId: cls.id,
        href: staffRoutes.staffClassDetail(cls.id),
        title: staffClassTitle(cls),
        line: `${formatClassWhen({ start: cls.scheduledAt, durationMin: cls.durationMin, timeZone, now })} · ${cls.teacher.displayName}`,
      };
    }),
    toRenew: balances
      .filter((row) => row.hasPayments && row.left <= 1)
      .map((row) => ({
        student: { id: row.student.id, displayName: row.student.displayName, email: row.student.email },
        line:
          row.left === 0
            ? "no le quedan clases"
            : balanceLine(row.left, row.nextScheduled, now).replace(/^Le queda/, "le queda"),
        href: staffRoutes.studentPayments(row.student.id),
      })),
  };
}

const detailSelect = {
  id: true,
  title: true,
  description: true,
  scheduledAt: true,
  endsAt: true,
  durationMin: true,
  capacity: true,
  meetingUrl: true,
  meetingUrlVisibleFrom: true,
  recordingUrl: true,
  summary: true,
  createdAt: true,
  previousScheduledAt: true,
  rescheduledAt: true,
  rescheduleNote: true,
  cancelledAt: true,
  cancelReason: true,
  cancelNote: true,
  closedAt: true,
  status: { select: { code: true } },
  format: { select: { code: true } },
  meetingProvider: { select: { label: true } },
  teacher: {
    select: {
      id: true,
      displayName: true,
      isActive: true,
      students: { where: { endedAt: null }, select: { studentId: true } },
    },
  },
  createdBy: { select: { displayName: true } },
  rescheduledBy: { select: { displayName: true } },
  cancelledBy: { select: { displayName: true } },
  closedBy: { select: { displayName: true } },
  participants: {
    select: {
      userId: true,
      isFree: true,
      attended: true,
      createdAt: true,
      seatMovedAt: true,
      seatMoveNote: true,
      user: { select: { displayName: true, email: true } },
      payment: { select: { id: true, paidOn: true, classCount: true } },
      addedBy: { select: { displayName: true } },
      seatMovedBy: { select: { displayName: true } },
      seatMovedToClass: { select: { id: true, scheduledAt: true } },
      attendanceChanges: {
        orderBy: { changedAt: "asc" },
        select: {
          changedAt: true,
          fromAttended: true,
          toAttended: true,
          reason: true,
          isOverride: true,
          changedBy: { select: { displayName: true } },
        },
      },
    },
    orderBy: [{ seatMovedAt: { sort: "asc", nulls: "first" } }, { user: { displayName: "asc" } }],
  },
  // The seats of OTHER classes that were moved here: this class is their replacement.
  seatsMovedIn: { select: { userId: true, class: { select: { scheduledAt: true } } } },
} satisfies Prisma.ClassSelect;

/**
 * A class's record (ADM-4, ADM-8): every seat with its coverage, its mark
 * and what the staff may do with it, the lane's facts, what was written
 * after the class, the blocks as the student will see them, and the history.
 * Cached per request: the page and its metadata read it once.
 */
export const getClassAdminDetail = cache(async (classId: string): Promise<StaffClassDetail | null> => {
  await requireStaff();
  const db = getPlatformDb();
  const now = new Date();
  const timeZone = STUDY_DAY_TIMEZONE;

  const [row, blocksRow] = await Promise.all([
    db.class.findUnique({ where: { id: classId }, select: detailSelect }),
    db.class.findUnique({ where: { id: classId }, include: classDetailInclude }),
  ]);
  if (!row || !blocksRow) return null;

  const statusCode = row.status.code as ClassStatusCode;
  const phase = classPhaseOf({ ...row, status: row.status }, now);
  const ordinals = await paymentOrdinals(
    [...new Set(row.participants.flatMap((seat) => (seat.payment ? [seat.payment.id] : [])))],
    now,
  );
  const movedInBy = new Map(row.seatsMovedIn.map((seat) => [seat.userId, seat.class]));
  const assignedIds = new Set(row.teacher.students.map((assignment) => assignment.studentId));

  const seatRows: StaffSeatRow[] = row.participants.map((seat) => ({
    userId: seat.userId,
    displayName: seat.user.displayName,
    email: seat.user.email,
    isFree: seat.isFree,
    payment: seat.payment,
    attended: seat.attended,
    seatMovedAt: seat.seatMovedAt,
    seatMovedToClass: seat.seatMovedToClass,
    replaces: movedInBy.get(seat.userId) ?? null,
    changes: seat.attendanceChanges.map((change) => ({
      changedAt: change.changedAt,
      byName: change.changedBy?.displayName ?? null,
      fromAttended: change.fromAttended,
      toAttended: change.toAttended,
      reason: change.reason,
      isOverride: change.isOverride,
    })),
  }));
  const context = {
    phase,
    statusCode,
    scheduledAt: row.scheduledAt,
    teacherName: row.teacher.displayName,
    assignedIds,
    ordinalOf: (paymentId: string) => ordinals.get(paymentId)?.ordinalOf[classId],
    timeZone,
    now,
  };
  const seats = seatRows.map((seat) => mapStaffSeat(seat, context));
  const seated = seats.filter((seat) => !seat.moved);
  const agendaRow = toAgendaRow({
    ...row,
    participants: row.participants.map((seat) => ({ ...seat, paymentId: seat.payment?.id ?? null })),
  });

  const history = buildClassHistory(
    {
      createdAt: row.createdAt,
      createdByName: row.createdBy?.displayName ?? null,
      seats: row.participants.map((seat) => ({
        studentName: seat.user.displayName,
        addedAt: seat.createdAt,
        addedByName: seat.addedBy?.displayName ?? null,
        paymentLabel: seat.payment ? `pago del ${paymentDayLabel(seat.payment.paidOn, now)}` : null,
        isFree: seat.isFree,
      })),
      reschedule:
        row.rescheduledAt && row.previousScheduledAt
          ? {
              at: row.rescheduledAt,
              byName: row.rescheduledBy?.displayName ?? null,
              previous: row.previousScheduledAt,
              current: row.scheduledAt,
              note: row.rescheduleNote,
            }
          : null,
      cancel: row.cancelledAt
        ? { at: row.cancelledAt, byName: row.cancelledBy?.displayName ?? null, reason: row.cancelReason }
        : null,
      close: row.closedAt
        ? {
            at: row.closedAt,
            byName: row.closedBy?.displayName ?? null,
            marks: row.participants
              .filter(
                (seat) => seat.seatMovedAt === null || seat.seatMovedAt.getTime() > (row.closedAt?.getTime() ?? 0),
              )
              .flatMap((seat) => {
                const first = seat.attendanceChanges[0];
                return first ? [{ studentName: seat.user.displayName, attended: first.toAttended }] : [];
              }),
          }
        : null,
      changes: row.participants.flatMap((seat) =>
        seat.attendanceChanges
          .filter((change) => change.fromAttended !== null)
          .map((change) => ({
            at: change.changedAt,
            byName: change.changedBy?.displayName ?? null,
            studentName: seat.user.displayName,
            from: change.fromAttended,
            to: change.toAttended,
            reason: change.reason,
            isOverride: change.isOverride,
          })),
      ),
      moves: row.participants
        .filter((seat) => seat.seatMovedAt !== null)
        .map((seat) => ({
          at: seat.seatMovedAt as Date,
          byName: seat.seatMovedBy?.displayName ?? null,
          studentName: seat.user.displayName,
          toStart: seat.seatMovedToClass?.scheduledAt ?? null,
        })),
    },
    timeZone,
    now,
  );

  return {
    id: row.id,
    title: staffClassTitle(agendaRow),
    topic: row.title,
    description: row.description,
    formatCode: row.format.code as ClassFormatCode,
    capacity: row.capacity,
    phase,
    teacher: { id: row.teacher.id, displayName: row.teacher.displayName, isActive: row.teacher.isActive },
    startIso: row.scheduledAt.toISOString(),
    durationMin: row.durationMin,
    timeZone,
    nowIso: now.toISOString(),
    meeting: {
      meetingUrl: row.meetingUrl,
      visibleFromIso: row.meetingUrl ? (row.meetingUrlVisibleFrom?.toISOString() ?? null) : null,
      startIso: row.scheduledAt.toISOString(),
      durationMin: row.durationMin,
      providerLabel: row.meetingProvider?.label ?? null,
      effectiveVisibleFromIso:
        meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom)?.toISOString() ?? null,
    },
    seats,
    counts: {
      seated: seated.length,
      unpaid: seated.filter((seat) => seat.coverage.kind === "unpaid").length,
      free: seated.filter((seat) => seat.coverage.kind === "free").length,
      attended: seated.filter((seat) => seat.attended === true).length,
      marked: seated.filter((seat) => seat.attended !== null).length,
    },
    editable: editableClassFields(phase),
    afterNotes: row.closedAt
      ? {
          closedByName: row.closedBy?.displayName ?? null,
          closedAtIso: row.closedAt.toISOString(),
          summary: row.summary,
          recordingUrl: row.recordingUrl,
        }
      : null,
    cancellation: row.cancelledAt
      ? {
          byName: row.cancelledBy?.displayName ?? null,
          atIso: row.cancelledAt.toISOString(),
          reason: row.cancelReason,
          note: row.cancelNote,
        }
      : null,
    reschedule:
      row.rescheduledAt && row.previousScheduledAt
        ? {
            previousStartIso: row.previousScheduledAt.toISOString(),
            byName: row.rescheduledBy?.displayName ?? null,
            atIso: row.rescheduledAt.toISOString(),
            note: row.rescheduleNote,
          }
        : null,
    blocks: mapClassBlocks(blocksRow.blocks, { audience: "staff", phase }),
    history,
    finalize: {
      classId: row.id,
      classTitle: staffClassTitle(agendaRow),
      whenLine: `${formatClassWhen({ start: row.scheduledAt, durationMin: row.durationMin, timeZone, now })} · ${
        row.format.code === CLASS_FORMAT.GROUP ? `${seated.length} alumnos` : (seated[0]?.displayName ?? "")
      }`,
      isGroup: row.format.code === CLASS_FORMAT.GROUP,
      teacherName: row.teacher.displayName,
      students: seated.map((seat) => ({
        id: seat.userId,
        displayName: seat.displayName,
        details: [seat.email],
        mark: seat.mark,
      })),
      summary: row.summary,
      recordingUrl: row.recordingUrl,
    },
  };
});

/** Every student, with what «Crear clase» and «Agregar alumnos» say under each name. */
export async function listSchedulableStudents(): Promise<SchedulableStudent[]> {
  const now = new Date();
  const balances = await listStudentBalances(now);
  return balances.map((row) => ({
    id: row.student.id,
    displayName: row.student.displayName,
    email: row.student.email,
    teacherId: row.student.teacherId,
    teacherName: row.student.teacherName,
    toSchedule: row.toSchedule,
    oldestPaymentLabel: row.oldestPaymentWithLeft
      ? `pago del ${paymentDayLabel(row.oldestPaymentWithLeft.paidOn, now)}`
      : null,
    hasPayments: row.hasPayments,
  }));
}

/** A class as «Crear clase» copies it (`?duplicar=`): a week later, without its students. */
export async function getClassDuplicate(classId: string): Promise<NewClassDefaults | null> {
  await requireStaff();
  const row = await getPlatformDb().class.findUnique({
    where: { id: classId },
    select: {
      title: true,
      description: true,
      scheduledAt: true,
      durationMin: true,
      capacity: true,
      meetingUrl: true,
      format: { select: { code: true } },
      teacher: { select: { id: true, isActive: true, displayName: true } },
      participants: { where: { seatMovedAt: null }, select: { user: { select: { displayName: true } } } },
    },
  });
  if (!row) return null;
  const now = new Date();
  const local = formatDateTimeLocal(new Date(row.scheduledAt.getTime() + 7 * DAY_MS), STUDY_DAY_TIMEZONE);
  const formatCode = row.format.code as ClassFormatCode;
  const title = staffClassTitle({
    id: classId,
    title: row.title,
    scheduledAt: row.scheduledAt,
    endsAt: row.scheduledAt,
    durationMin: row.durationMin,
    statusCode: CLASS_STATUS.SCHEDULED,
    formatCode,
    capacity: row.capacity,
    meetingUrl: row.meetingUrl,
    meetingUrlVisibleFrom: null,
    teacher: row.teacher,
    seats: row.participants.map((seat) => ({
      userId: "",
      displayName: seat.user.displayName,
      isFree: false,
      paymentId: null,
      seatMovedAt: null,
      attended: null,
    })),
  });
  return {
    format: formatCode,
    capacity: formatCode === CLASS_FORMAT.GROUP ? row.capacity : null,
    title: row.title ?? "",
    description: row.description ?? "",
    teacherId: row.teacher.isActive ? row.teacher.id : null,
    date: local.slice(0, 10),
    time: local.slice(11, 16),
    durationMin: row.durationMin,
    meetingUrl: row.meetingUrl ?? "",
    studentId: null,
    duplicateOf: `Copia de «${title}» (${formatClassDay(row.scheduledAt, STUDY_DAY_TIMEZONE, now)})`,
  };
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

/** Teachers for the agenda's filter, deactivated ones included: their classes are still listed. */
export async function listTeacherFilterOptions(): Promise<{ id: string; displayName: string }[]> {
  await requireStaff();
  return getPlatformDb().teacher.findMany({ select: { id: true, displayName: true }, orderBy: { displayName: "asc" } });
}

/** The phase a class is in right now, for an action that checks what the phase allows. */
export async function readClassPhase(classId: string, now: Date) {
  const row = await getPlatformDb().class.findUnique({
    where: { id: classId },
    select: {
      scheduledAt: true,
      endsAt: true,
      durationMin: true,
      meetingUrl: true,
      meetingUrlVisibleFrom: true,
      title: true,
      description: true,
      teacherId: true,
      status: { select: { code: true } },
      format: { select: { code: true } },
    },
  });
  if (!row) return null;
  return { ...row, phase: classPhaseOf(row, now), isDone: classPhaseOf(row, now) === CLASS_PHASE.DONE };
}
