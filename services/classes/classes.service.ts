import { cache } from "react";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { academyWhatsappHref } from "@/constants/platform/academy-contact.const";
import { CLASS_PHASE, type ClassFormatCode, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { dayKeyIn } from "@/lib/timezone";
import { studentClassView } from "@/services/shared/class-phase";
import { paymentSeats, type SeatRow } from "@/services/shared/payment-seats";
import {
  balanceLineOf,
  classDetailInclude,
  groupPastByMonth,
  mapClassCard,
  mapStudentBalance,
  mapStudentClassDetail,
  studentBlockSelect,
  studentPhaseOf,
  type StudentClassSource,
  type StudentContext,
  type StudentPaymentCount,
  type StudentSeatSource,
} from "./classes.mapper";
import type { ClassCardData, ClassDetailView, StudentBalanceView, StudentClassesView } from "./classes.types";

// The student's reads: «Mis clases», the class page, «Próxima clase» and what
// they have left. Every reader resolves the student with `getCurrentUser()`
// and reads in the academy's zone (D7). The seats and the payments are read
// ONCE per request (`readStudentSeats`, cached): the list, the balance, the
// next class and the class page all derive from it, so a page never asks
// Prisma twice for the same thing. A payment reaches these readers as a day
// and a count of classes: its amount is never selected.

const PAST_PAGE_SIZE = 10;

const seatClassSelect = {
  id: true,
  title: true,
  description: true,
  scheduledAt: true,
  endsAt: true,
  durationMin: true,
  meetingUrl: true,
  meetingUrlVisibleFrom: true,
  recordingUrl: true,
  summary: true,
  previousScheduledAt: true,
  rescheduleNote: true,
  cancelNote: true,
  status: { select: { code: true } },
  format: { select: { code: true } },
  teacher: { select: { displayName: true } },
  meetingProvider: { select: { label: true } },
  participants: {
    where: { seatMovedAt: null },
    select: { userId: true, user: { select: { displayName: true } } },
    orderBy: { user: { displayName: "asc" } },
  },
  blocks: { orderBy: { order: "asc" }, select: studentBlockSelect },
} satisfies Prisma.ClassSelect;

const seatSelect = {
  classId: true,
  isFree: true,
  attended: true,
  seatMovedAt: true,
  seatMovedToClassId: true,
  seatMoveNote: true,
  payment: { select: { id: true, paidOn: true, classCount: true } },
  class: { select: seatClassSelect },
} satisfies Prisma.ClassParticipantSelect;

type SeatDbRow = Prisma.ClassParticipantGetPayload<{ select: typeof seatSelect }>;

interface StudentSeats {
  userId: string;
  displayName: string;
  now: Date;
  context: StudentContext;
  /** Every class the student has a seat in, moved seats included, as the mapper reads them. */
  sources: StudentClassSource[];
  /** The student's payments, oldest first, each with its count. */
  payments: StudentPaymentCount[];
}

function toSource(row: SeatDbRow, userId: string, rows: SeatDbRow[]): StudentClassSource {
  const movedTo = row.seatMovedToClassId
    ? (rows.find((other) => other.classId === row.seatMovedToClassId)?.class ?? null)
    : null;
  const movedHere = rows.find((other) => other.seatMovedToClassId === row.classId) ?? null;
  const seat: StudentSeatSource = {
    payment: row.payment,
    isFree: row.isFree,
    attended: row.attended,
    seatMovedAt: row.seatMovedAt,
    seatMovedToClass: movedTo ? { id: movedTo.id, scheduledAt: movedTo.scheduledAt } : null,
    replaces: movedHere ? { scheduledAt: movedHere.class.scheduledAt, note: movedHere.seatMoveNote } : null,
  };
  const cls = row.class;
  return {
    id: cls.id,
    title: cls.title,
    description: cls.description,
    scheduledAt: cls.scheduledAt,
    endsAt: cls.endsAt,
    durationMin: cls.durationMin,
    statusCode: cls.status.code as ClassStatusCode,
    formatCode: cls.format.code as ClassFormatCode,
    teacherName: cls.teacher.displayName,
    meetingUrl: cls.meetingUrl,
    meetingUrlVisibleFrom: cls.meetingUrlVisibleFrom,
    providerLabel: cls.meetingProvider?.label ?? null,
    recordingUrl: cls.recordingUrl,
    summary: cls.summary,
    previousScheduledAt: cls.previousScheduledAt,
    rescheduleNote: cls.rescheduleNote,
    cancelNote: cls.cancelNote,
    classmates: cls.participants.filter((seat) => seat.userId !== userId).map((seat) => seat.user.displayName),
    blocks: cls.blocks,
    seat,
  };
}

/** The student's seats and payments, read once per request. */
const readStudentSeats = cache(async (): Promise<StudentSeats> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const now = new Date();
  const [rows, paymentRows] = await Promise.all([
    db.classParticipant.findMany({
      where: { userId: user.id },
      select: seatSelect,
      orderBy: { class: { scheduledAt: "asc" } },
    }),
    db.classPayment.findMany({
      where: { studentId: user.id },
      select: { id: true, paidOn: true, classCount: true },
      orderBy: [{ paidOn: "asc" }, { id: "asc" }],
    }),
  ]);

  const sources = rows.map((row) => toSource(row, user.id, rows));
  const seatRows: SeatRow[] = sources.map((source) => ({
    classId: source.id,
    paymentId: source.seat.payment?.id ?? null,
    isFree: source.seat.isFree,
    attended: source.seat.attended,
    seatMovedAt: source.seat.seatMovedAt,
    phase: studentPhaseOf(source, now),
    scheduledAt: source.scheduledAt,
  }));
  const counted = new Map(paymentRows.map((payment) => [payment.id, paymentSeats(payment, seatRows)]));
  const payments: StudentPaymentCount[] = paymentRows.map((payment) => {
    const seats = counted.get(payment.id)!;
    return { ...payment, taken: seats.taken, scheduled: seats.scheduled, toSchedule: seats.toSchedule };
  });
  const whatsappHref = academyWhatsappHref(`Hola, soy ${user.displayName}. Quiero preguntar por mis clases.`);

  return {
    userId: user.id,
    displayName: user.displayName,
    now,
    context: { now, timeZone: STUDY_DAY_TIMEZONE, whatsappHref },
    sources,
    payments,
  };
});

/** The classes still ahead (today's included while its link is offered), in order, and the rest. */
function splitAhead(seats: StudentSeats): { ahead: StudentClassSource[]; past: StudentClassSource[] } {
  const ahead: StudentClassSource[] = [];
  const past: StudentClassSource[] = [];
  for (const source of seats.sources) {
    const phase = studentPhaseOf(source, seats.now);
    const isAhead =
      phase === CLASS_PHASE.CANCELLED
        ? source.scheduledAt >= seats.now
        : studentClassView(phase, source.endsAt, seats.now) === "ahead";
    (isAhead ? ahead : past).push(source);
  }
  return { ahead, past: past.reverse() };
}

/** «Mis clases»: today, what comes, how many are paid without a date, and the past by month. */
export const getUserClasses = cache(async (pastPages: number): Promise<StudentClassesView> => {
  const seats = await readStudentSeats();
  const { context, now } = seats;
  const { ahead, past } = splitAhead(seats);
  const todayKey = dayKeyIn(now, context.timeZone);
  const cards = (sources: StudentClassSource[]) => sources.map((source) => mapClassCard(source, context));
  const today = cards(ahead.filter((source) => dayKeyIn(source.scheduledAt, context.timeZone) === todayKey));
  const upcoming = cards(ahead.filter((source) => dayKeyIn(source.scheduledAt, context.timeZone) !== todayKey));
  const pastShown = Math.max(1, pastPages) * PAST_PAGE_SIZE;
  const balance = mapStudentBalance(seats.payments, context);
  const joinOpen =
    today.map((card) => card.join).find((join) => join && ["open", "live", "tail"].includes(meetingJoinState(join))) ??
    null;

  return {
    timeZone: context.timeZone,
    nowIso: now.toISOString(),
    today,
    upcoming,
    toSchedule: balance?.toSchedule ?? 0,
    past: groupPastByMonth(cards(past.slice(0, pastShown)), context.timeZone),
    pastTotal: past.length,
    pastShown: Math.min(pastShown, past.length),
    balance,
    joinOpen,
    whatsappHref: context.whatsappHref,
  };
});

/** The first class ahead that is not cancelled, for «Próxima clase». */
export const getNextClass = cache(async (): Promise<ClassCardData | null> => {
  const seats = await readStudentSeats();
  const next = splitAhead(seats).ahead.find((source) => studentPhaseOf(source, seats.now) !== CLASS_PHASE.CANCELLED);
  return next ? mapClassCard(next, seats.context) : null;
});

/** What the student has left, counted from their payments; never an amount. */
export const getStudentSeatBalance = cache(async (): Promise<StudentBalanceView | null> => {
  const seats = await readStudentSeats();
  return mapStudentBalance(seats.payments, seats.context);
});

/** The class page: the student's own seat in it, with its blocks and transcript. Null if they have no seat. */
export const getClassById = cache(async (classId: string): Promise<ClassDetailView | null> => {
  const seats = await readStudentSeats();
  const source = seats.sources.find((candidate) => candidate.id === classId);
  if (!source) return null;
  const row = await getPlatformDb().class.findUnique({ where: { id: classId }, include: classDetailInclude });
  if (!row) return null;
  return mapStudentClassDetail(
    { ...source, row, viewerId: seats.userId, balanceLine: balanceLineOf(seats.payments) },
    seats.context,
  );
});
