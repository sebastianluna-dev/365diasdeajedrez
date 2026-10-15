import { cache } from "react";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import type { CurrencyCode } from "@/constants/platform/currency-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { formatClassAmount } from "@/lib/format-class-amount";
import { formatClassDay } from "@/lib/format-class-when";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { staffRoutes } from "@/lib/platform-routes";
import { suggestRhythm } from "@/services/shared/class-schedule-rules";
import { unpaidSeatWhere } from "@/services/shared/payment-seats";
import {
  balanceLine,
  mapPayment,
  mapUnpaidSeat,
  paidOnLabel,
  type PaymentRow,
  type PaymentSeatRow,
} from "./staff-payments.mapper";
import type {
  BusySlotView,
  PaymentContext,
  SeatToSchedule,
  StudentPaymentsView,
  UnpaidSeatView,
} from "./staff-payments.types";

// The staff's reads about money: a student's payments and what they cover,
// what «Registrar pago» needs to know about a student, and the queue of paid
// classes without a date. Every reader opens with `requireStaff()`: the
// student and the teacher never read these.

const BUSY_WEEKS = 12;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const seatInclude = {
  class: {
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      endsAt: true,
      durationMin: true,
      meetingUrl: true,
      meetingUrlVisibleFrom: true,
      status: { select: { code: true } },
      format: { select: { code: true } },
      teacher: { select: { displayName: true } },
      participants: { where: { seatMovedAt: null }, select: { user: { select: { displayName: true } } } },
    },
  },
} satisfies Prisma.ClassParticipantInclude;

type SeatDbRow = Prisma.ClassParticipantGetPayload<{ include: typeof seatInclude }>;

function toSeatRow(seat: SeatDbRow): PaymentSeatRow {
  return {
    classId: seat.classId,
    attended: seat.attended,
    seatMovedAt: seat.seatMovedAt,
    seatMovedToClassId: seat.seatMovedToClassId,
    isFree: seat.isFree,
    paymentId: seat.paymentId,
    class: {
      id: seat.class.id,
      title: seat.class.title,
      scheduledAt: seat.class.scheduledAt,
      endsAt: seat.class.endsAt,
      durationMin: seat.class.durationMin,
      statusCode: seat.class.status.code as ClassStatusCode,
      formatCode: seat.class.format.code,
      teacherName: seat.class.teacher.displayName,
      studentNames: seat.class.participants.map((row) => row.user.displayName),
      meetingUrl: seat.class.meetingUrl,
      meetingUrlVisibleFrom: seat.class.meetingUrlVisibleFrom,
    },
  };
}

const paymentInclude = {
  currency: { select: { code: true } },
  recordedBy: { select: { displayName: true } },
  seats: { include: seatInclude },
} satisfies Prisma.ClassPaymentInclude;

type PaymentDbRow = Prisma.ClassPaymentGetPayload<{ include: typeof paymentInclude }>;

function toPaymentRow(payment: PaymentDbRow): PaymentRow {
  return {
    id: payment.id,
    paidOn: payment.paidOn,
    amount: payment.amount.toString(),
    currencyCode: payment.currency.code as CurrencyCode,
    classCount: payment.classCount,
    reference: payment.reference,
    note: payment.note,
    recordedByName: payment.recordedBy?.displayName ?? null,
    seats: payment.seats.map(toSeatRow),
  };
}

const studentSelect = {
  id: true,
  displayName: true,
  email: true,
  studentAssignments: {
    where: { endedAt: null },
    select: { teacherId: true, teacher: { select: { displayName: true } } },
    take: 1,
  },
} satisfies Prisma.UserSelect;

type StudentDbRow = Prisma.UserGetPayload<{ select: typeof studentSelect }>;

function toStudent(row: StudentDbRow) {
  const assignment = row.studentAssignments[0] ?? null;
  return {
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    teacherId: assignment?.teacherId ?? null,
    teacherName: assignment?.teacher.displayName ?? null,
  };
}

async function readUnpaidSeats(userId: string, now: Date): Promise<UnpaidSeatView[]> {
  const rows = await getPlatformDb().classParticipant.findMany({
    where: { userId, ...unpaidSeatWhere },
    include: seatInclude,
    orderBy: { class: { scheduledAt: "asc" } },
  });
  return rows.map((row) => mapUnpaidSeat(toSeatRow(row), now));
}

/** A student's «Pagos y clases»: the balance, each payment with its seats, and the classes that wait for a payment. */
export const getStudentPayments = cache(async (userId: string): Promise<StudentPaymentsView | null> => {
  await requireStaff();
  const db = getPlatformDb();
  const now = new Date();

  const [student, payments, unpaidSeats] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: studentSelect }),
    db.classPayment.findMany({
      where: { studentId: userId },
      include: paymentInclude,
      orderBy: [{ paidOn: "desc" }, { id: "desc" }],
    }),
    readUnpaidSeats(userId, now),
  ]);
  if (!student) return null;

  const cards = payments.map((payment) => mapPayment(toPaymentRow(payment), now));
  const balance = cards.reduce(
    (total, card) => ({
      left: total.left + card.scheduled + card.toSchedule,
      scheduled: total.scheduled + card.scheduled,
      toSchedule: total.toSchedule + card.toSchedule,
      taken: total.taken + card.taken,
    }),
    { left: 0, scheduled: 0, toSchedule: 0, taken: 0 },
  );

  return {
    student: toStudent(student),
    balance,
    payments: cards,
    unpaidSeats,
    timeZone: STUDY_DAY_TIMEZONE,
    nowIso: now.toISOString(),
  };
});

function toBusy(
  rows: { title: string | null; scheduledAt: Date; endsAt: Date; studentName?: string }[],
): BusySlotView[] {
  return rows.map((row) => ({
    title: row.title ?? "Clase",
    startIso: row.scheduledAt.toISOString(),
    endIso: row.endsAt.toISOString(),
    ...(row.studentName ? { studentName: row.studentName } : {}),
  }));
}

/** The classes a teacher gives between two instants, cancelled ones aside, for the overlap warnings. */
export async function getTeacherBusy(teacherId: string, from: Date, to: Date): Promise<BusySlotView[]> {
  await requireStaff();
  const rows = await getPlatformDb().class.findMany({
    where: { teacherId, scheduledAt: { gte: from, lt: to }, status: { code: { not: CLASS_STATUS.CANCELLED } } },
    select: { title: true, scheduledAt: true, endsAt: true },
    orderBy: { scheduledAt: "asc" },
  });
  return toBusy(rows);
}

/** What «Registrar pago» needs about a student: who they are, their last payment, their rhythm, their balance, and their calendar. */
export async function getPaymentContext(userId: string, now: Date): Promise<PaymentContext | null> {
  await requireStaff();
  const db = getPlatformDb();
  const horizon = new Date(now.getTime() + BUSY_WEEKS * WEEK_MS);

  const [student, lastPayment, lastClass, lastWithLink, payments, unpaidSeats, studentClasses] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: studentSelect }),
    db.classPayment.findFirst({
      where: { studentId: userId },
      orderBy: [{ paidOn: "desc" }, { id: "desc" }],
      select: { paidOn: true, classCount: true, amount: true, currency: { select: { code: true } } },
    }),
    db.classParticipant.findFirst({
      where: { userId, seatMovedAt: null, class: { status: { code: { not: CLASS_STATUS.CANCELLED } } } },
      orderBy: { class: { scheduledAt: "desc" } },
      select: { class: { select: { teacherId: true, scheduledAt: true, durationMin: true } } },
    }),
    db.classParticipant.findFirst({
      where: { userId, class: { meetingUrl: { not: null } } },
      orderBy: { class: { scheduledAt: "desc" } },
      select: { class: { select: { meetingUrl: true } } },
    }),
    db.classPayment.findMany({ where: { studentId: userId }, include: paymentInclude }),
    readUnpaidSeats(userId, now),
    db.classParticipant.findMany({
      where: {
        userId,
        seatMovedAt: null,
        class: { scheduledAt: { gte: now, lt: horizon }, status: { code: { not: CLASS_STATUS.CANCELLED } } },
      },
      select: { class: { select: { title: true, scheduledAt: true, endsAt: true } } },
      orderBy: { class: { scheduledAt: "asc" } },
    }),
  ]);
  if (!student) return null;

  const who = toStudent(student);
  const cards = payments.map((payment) => mapPayment(toPaymentRow(payment), now));
  const left = cards.reduce((total, card) => total + card.scheduled + card.toSchedule, 0);
  const nextScheduled = payments
    .flatMap((payment) => payment.seats.map(toSeatRow))
    .filter((seat) => seat.seatMovedAt === null && seat.class.statusCode !== CLASS_STATUS.CANCELLED)
    .filter((seat) => seat.class.scheduledAt.getTime() >= now.getTime())
    .sort((left, right) => left.class.scheduledAt.getTime() - right.class.scheduledAt.getTime())[0];

  const rhythmTeacherId = lastClass?.class.teacherId ?? who.teacherId;
  const rhythm = suggestRhythm(
    lastClass ? { scheduledAt: lastClass.class.scheduledAt, durationMin: lastClass.class.durationMin } : null,
    now,
    STUDY_DAY_TIMEZONE,
  );
  const teacherBusy = rhythmTeacherId ? await getTeacherBusy(rhythmTeacherId, now, horizon) : [];

  return {
    student: who,
    lastPayment: lastPayment
      ? {
          paidOnLabel: paidOnLabel(lastPayment.paidOn, STUDY_DAY_TIMEZONE, now),
          classCount: lastPayment.classCount,
          amount: lastPayment.amount.toString(),
          currencyCode: lastPayment.currency.code as CurrencyCode,
          amountLabel: formatClassAmount(lastPayment.amount.toString(), lastPayment.currency.code as CurrencyCode, {
            withCode: true,
          }),
        }
      : null,
    rhythm: {
      teacherId: rhythmTeacherId,
      firstDate: rhythm.firstDate,
      time: rhythm.time,
      durationMin: rhythm.durationMin,
    },
    lastMeetingUrl: lastWithLink?.class.meetingUrl ?? null,
    balanceLine: balanceLine(
      left,
      nextScheduled
        ? { scheduledAt: nextScheduled.class.scheduledAt, durationMin: nextScheduled.class.durationMin }
        : null,
      now,
    ),
    unpaidSeats,
    studentBusy: toBusy(studentClasses.map((row) => ({ ...row.class, studentName: who.displayName }))),
    teacherBusy,
  };
}

/** The paid classes still without a date, by payment: the «Por programar» queue. */
export async function listSeatsToSchedule(now: Date): Promise<SeatToSchedule[]> {
  await requireStaff();
  const payments = await getPlatformDb().classPayment.findMany({
    include: {
      ...paymentInclude,
      student: { select: studentSelect },
    },
    orderBy: [{ paidOn: "asc" }, { id: "asc" }],
  });
  return payments.flatMap((payment) => {
    const card = mapPayment(toPaymentRow(payment), now);
    if (card.toSchedule === 0) return [];
    const student = toStudent(payment.student);
    return [
      {
        paymentId: payment.id,
        studentId: student.id,
        studentName: student.displayName,
        label: `${card.toSchedule} de su pago del ${formatClassDay(new Date(payment.paidOn.getTime() + 12 * 60 * 60 * 1000), "UTC", now)}`,
        count: card.toSchedule,
        teacherId: student.teacherId,
        href: staffRoutes.studentPayments(student.id),
      },
    ];
  });
}

/** Every student, grouped by their teacher, for «Registrar pago» opened without one. */
export async function listPaymentStudents(): Promise<{ label: string; options: { value: string; label: string }[] }[]> {
  await requireStaff();
  const users = await getPlatformDb().user.findMany({
    where: { teacher: null, staff: null },
    select: studentSelect,
    orderBy: { displayName: "asc" },
  });
  const groups = new Map<string, { value: string; label: string }[]>();
  for (const user of users) {
    const student = toStudent(user);
    const key = student.teacherName ? `Alumnos de ${student.teacherName}` : "Sin profesor asignado";
    const list = groups.get(key) ?? [];
    list.push({ value: student.id, label: student.displayName });
    groups.set(key, list);
  }
  return [...groups.entries()]
    .sort(([left], [right]) =>
      left === "Sin profesor asignado" ? 1 : right === "Sin profesor asignado" ? -1 : left.localeCompare(right),
    )
    .map(([label, options]) => ({ label, options }));
}

/** Whether any class of a payment started (cancelled ones aside): then it is not deleted. */
export function paymentStarted(seats: PaymentSeatRow[], paymentId: string, now: Date): boolean {
  return seats.some(
    (seat) =>
      seat.paymentId === paymentId &&
      seat.seatMovedAt === null &&
      seat.class.statusCode !== CLASS_STATUS.CANCELLED &&
      seat.class.scheduledAt.getTime() <= now.getTime(),
  );
}
