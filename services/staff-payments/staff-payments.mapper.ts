import { CLASS_FORMAT, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import type { CurrencyCode } from "@/constants/platform/currency-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { formatClassAmount, perClassAmount } from "@/lib/format-class-amount";
import { formatClassDay, formatClassHours } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import { staffRoutes } from "@/lib/platform-routes";
import { classPhase } from "@/services/shared/class-phase";
import { paymentSeats, type SeatRow } from "@/services/shared/payment-seats";
import type { PaymentSeatView, StaffPaymentView, UnpaidSeatView } from "./staff-payments.types";

// Pure: receives the rows a service read and `now`, never the clock.

/** A seat as the service reads it for a payment's card. */
export interface PaymentSeatRow {
  classId: string;
  attended: boolean | null;
  seatMovedAt: Date | null;
  seatMovedToClassId: string | null;
  isFree: boolean;
  paymentId: string | null;
  class: {
    id: string;
    title: string | null;
    scheduledAt: Date;
    endsAt: Date;
    durationMin: number;
    statusCode: ClassStatusCode;
    formatCode: string;
    teacherName: string;
    studentNames: string[];
    meetingUrl: string | null;
    meetingUrlVisibleFrom: Date | null;
  };
}

export interface PaymentRow {
  id: string;
  paidOn: Date;
  amount: string;
  currencyCode: CurrencyCode;
  classCount: number;
  reference: string | null;
  note: string | null;
  recordedByName: string | null;
  seats: PaymentSeatRow[];
}

/** The phase of a seat's class, from its row. */
export function seatPhase(seat: PaymentSeatRow, now: Date) {
  return classPhase(
    {
      statusCode: seat.class.statusCode,
      scheduledAt: seat.class.scheduledAt,
      endsAt: seat.class.endsAt,
      visibleFrom: seat.class.meetingUrl ? seat.class.meetingUrlVisibleFrom : null,
      hasLink: seat.class.meetingUrl !== null,
    },
    now,
  );
}

function toSeatRow(seat: PaymentSeatRow, now: Date): SeatRow {
  return {
    classId: seat.classId,
    paymentId: seat.paymentId,
    isFree: seat.isFree,
    attended: seat.attended,
    seatMovedAt: seat.seatMovedAt,
    phase: seatPhase(seat, now),
    scheduledAt: seat.class.scheduledAt,
  };
}

/** The class's display title for the staff: the topic, or «Clase de …». */
export function paymentClassTitle(cls: PaymentSeatRow["class"]): string {
  const title = cls.title?.trim() ?? "";
  if (title.length > 0) return title;
  if (cls.studentNames.length === 0) return cls.formatCode === CLASS_FORMAT.GROUP ? "Clase grupal" : "Clase sin alumno";
  return `Clase de ${cls.studentNames.join(", ")}`;
}

/**
 * A payment's card: its figures, its seats in order with «clase n de m», and
 * whether it can still be deleted (nothing of it was given: no class of it
 * started, cancelled ones aside).
 */
export function mapPayment(row: PaymentRow, now: Date, timeZone = STUDY_DAY_TIMEZONE): StaffPaymentView {
  const seatRows = row.seats.map((seat) => toSeatRow(seat, now));
  const counts = paymentSeats({ id: row.id, classCount: row.classCount }, seatRows);
  const movedTo = new Map(
    row.seats.filter((seat) => seat.seatMovedToClassId).map((seat) => [seat.seatMovedToClassId, seat]),
  );

  const seats: PaymentSeatView[] = row.seats
    .filter((seat) => seat.paymentId === row.id)
    .sort((left, right) => left.class.scheduledAt.getTime() - right.class.scheduledAt.getTime())
    .map((seat) => {
      const phase = seatPhase(seat, now);
      const replaced = movedTo.get(seat.classId);
      return {
        classId: seat.classId,
        href: staffRoutes.staffClassDetail(seat.classId),
        ordinal: counts.ordinalOf[seat.classId] ?? 0,
        title: paymentClassTitle(seat.class),
        startIso: seat.class.scheduledAt.toISOString(),
        durationMin: seat.class.durationMin,
        phase,
        attended: seat.attended,
        isGroup: seat.class.formatCode === CLASS_FORMAT.GROUP,
        ...(seat.seatMovedAt
          ? {
              moved: {
                toClassId: seat.seatMovedToClassId,
                label: seat.seatMovedToClassId
                  ? `Faltó · reprogramada al ${formatClassDay(
                      row.seats.find((other) => other.classId === seat.seatMovedToClassId)?.class.scheduledAt ?? now,
                      timeZone,
                      now,
                    )}`
                  : "Faltó · devuelta a su pago",
              },
            }
          : {}),
        ...(replaced
          ? { replacesLabel: `reposición del ${formatClassDay(replaced.class.scheduledAt, timeZone, now)}` }
          : {}),
      };
    });

  const started = row.seats.filter(
    (seat) =>
      seat.paymentId === row.id &&
      seat.seatMovedAt === null &&
      seat.class.statusCode !== "CANCELLED" &&
      seat.class.scheduledAt.getTime() <= now.getTime(),
  ).length;
  const canDelete = started === 0;

  return {
    id: row.id,
    paidOnIso: row.paidOn.toISOString(),
    paidOnLabel: paidOnLabel(row.paidOn, timeZone, now),
    amount: row.amount,
    currencyCode: row.currencyCode,
    amountLabel: formatClassAmount(row.amount, row.currencyCode, { withCode: true }),
    perClassLabel: `${perClassAmount(row.amount, row.classCount, row.currencyCode)} por clase`,
    classCount: row.classCount,
    reference: row.reference,
    note: row.note,
    recordedByName: row.recordedByName,
    seats,
    taken: counts.taken,
    scheduled: counts.scheduled,
    toSchedule: counts.toSchedule,
    returned: counts.returned,
    allTaken: counts.toSchedule === 0 && counts.scheduled === 0 && counts.taken > 0,
    canDelete,
    ...(canDelete ? {} : { deleteReason: "Este pago ya cubre clases dadas: corrígelo con «Editar pago»." }),
    seatsLeftUnpaid: counts.counting,
    minClassCount: counts.counting,
  };
}

/** «jue 1 oct 2026»: a payment's day always carries its year. */
export function paidOnLabel(paidOn: Date, timeZone: string, now: Date): string {
  // A @db.Date comes back at midnight UTC; the academy's day is read at noon of it so no zone shifts it.
  const noon = new Date(paidOn.getTime() + 12 * 60 * 60 * 1000);
  const label = formatClassDay(noon, "UTC", new Date(0));
  void timeZone;
  void now;
  return label;
}

/** A class that waits for a payment, as the lists show it. */
export function mapUnpaidSeat(seat: PaymentSeatRow, now: Date): UnpaidSeatView {
  return {
    classId: seat.classId,
    href: staffRoutes.staffClassDetail(seat.classId),
    title: paymentClassTitle(seat.class),
    startIso: seat.class.scheduledAt.toISOString(),
    durationMin: seat.class.durationMin,
    phase: seatPhase(seat, now),
  };
}

/** «Le queda 1 clase (hoy 19:00)», «Le quedan 3 clases», «Sin clases pagadas». */
export function balanceLine(
  left: number,
  nextScheduled: { scheduledAt: Date; durationMin: number } | null,
  now: Date,
  timeZone = STUDY_DAY_TIMEZONE,
): string {
  if (left === 0) return "Sin clases pagadas";
  const words = `Le queda${left === 1 ? "" : "n"} ${left} clase${left === 1 ? "" : "s"}`;
  if (!nextScheduled) return words;
  const sameDay = dayKeyIn(nextScheduled.scheduledAt, timeZone) === dayKeyIn(now, timeZone);
  const when = sameDay
    ? `hoy ${formatClassHours(nextScheduled.scheduledAt, nextScheduled.durationMin, timeZone).split("–")[0]}`
    : formatClassDay(nextScheduled.scheduledAt, timeZone, now);
  return `${words} (${when})`;
}
