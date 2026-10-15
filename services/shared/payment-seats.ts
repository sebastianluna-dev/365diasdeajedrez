import {
  CLASS_PHASE,
  CLASS_STATUS,
  type ClassPhaseCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";

// What a payment covers, counted when it is read and never stored.
//
// A payment buys `classCount` classes. The seats it pays are the participations
// that point at it; one COUNTS while its class is not cancelled and it was not
// moved to another date. A no-show counts — the class was spent — and a seat
// the staff moved stops counting while the one it was moved to counts instead,
// so a payment never pays twice for the same class. A cancelled class gives the
// seat back. A free seat or one with no payment yet never enters a balance.
//
// Pure module, with only the fields a seat needs; the services feed it from
// Prisma and the fixtures feed it by hand.

/** A participation, as far as a payment is concerned. */
export interface SeatRow {
  classId: string;
  paymentId: string | null;
  isFree: boolean;
  attended: boolean | null;
  seatMovedAt: Date | null;
  phase: ClassPhaseCode;
  scheduledAt: Date;
}

export interface PaymentSeats {
  /** Classes already given to this seat's student (a no-show included). */
  taken: number;
  /** Classes with a date still ahead, or happening now. */
  scheduled: number;
  /** Classes bought and not dated yet; never negative. */
  toSchedule: number;
  /** Seats of cancelled classes: they went back to the payment. */
  returned: number;
  /** Seats the staff gave another date; their new seat counts, these do not. */
  moved: number;
  /** The seats that count: taken + scheduled. */
  counting: number;
  /** «Clase n de m»: the ordinal of each counting class, in chronological order. */
  ordinalOf: Record<string, number>;
}

const TAKEN_PHASES: readonly ClassPhaseCode[] = [CLASS_PHASE.AWAITING_CLOSE, CLASS_PHASE.DONE];

/** Whether a seat spends one of its payment's classes. */
export function seatCounts(seat: Pick<SeatRow, "phase" | "seatMovedAt">): boolean {
  return seat.phase !== CLASS_PHASE.CANCELLED && seat.seatMovedAt === null;
}

/** The seats of one payment, counted. Seats of other payments, free or unpaid ones are ignored. */
export function paymentSeats(payment: { id: string; classCount: number }, seats: readonly SeatRow[]): PaymentSeats {
  const own = seats.filter((seat) => seat.paymentId === payment.id && !seat.isFree);
  const counting = own
    .filter(seatCounts)
    .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime());

  const ordinalOf: Record<string, number> = {};
  counting.forEach((seat, index) => {
    ordinalOf[seat.classId] = index + 1;
  });

  const taken = counting.filter((seat) => TAKEN_PHASES.includes(seat.phase)).length;
  return {
    taken,
    scheduled: counting.length - taken,
    toSchedule: Math.max(0, payment.classCount - counting.length),
    returned: own.filter((seat) => seat.phase === CLASS_PHASE.CANCELLED && seat.seatMovedAt === null).length,
    moved: own.filter((seat) => seat.seatMovedAt !== null).length,
    counting: counting.length,
    ordinalOf,
  };
}

export interface PaymentForBalance {
  id: string;
  classCount: number;
  paidOn: Date;
  seats: readonly SeatRow[];
}

export interface PaymentBalance {
  paymentId: string;
  paidOn: Date;
  left: number;
  scheduled: number;
  toSchedule: number;
}

export interface StudentSeatBalance {
  /** Classes the student still has: scheduled plus to schedule. */
  left: number;
  scheduled: number;
  toSchedule: number;
  /** Oldest payment first: the one whose seats are spent first. */
  byPayment: PaymentBalance[];
}

/** What a student has left, across their payments. Never carries an amount. */
export function studentSeatBalance(payments: readonly PaymentForBalance[]): StudentSeatBalance {
  const byPayment = [...payments]
    .sort((left, right) => left.paidOn.getTime() - right.paidOn.getTime() || left.id.localeCompare(right.id))
    .map((payment): PaymentBalance => {
      const seats = paymentSeats(payment, payment.seats);
      return {
        paymentId: payment.id,
        paidOn: payment.paidOn,
        left: seats.scheduled + seats.toSchedule,
        scheduled: seats.scheduled,
        toSchedule: seats.toSchedule,
      };
    });
  const sum = (pick: (balance: PaymentBalance) => number) =>
    byPayment.reduce((total, balance) => total + pick(balance), 0);
  return {
    left: sum((b) => b.left),
    scheduled: sum((b) => b.scheduled),
    toSchedule: sum((b) => b.toSchedule),
    byPayment,
  };
}

export interface PaymentSeatPlan {
  classCount: number;
  /** Seats the student already had «Sin pago» that this payment covers. */
  covered: number;
  /** New classes dated in the same form. */
  dated: number;
  /** Seats placed in a group class. */
  group: number;
}

/**
 * How a new payment's classes are spread: what is dated, covered or placed in
 * a group, and how many stay «por programar». Too many is an error the form
 * reports with the total («Entre las clases con fecha y las cubiertas hay 5, y
 * el pago es de 4»).
 */
export function planPaymentSeats(plan: PaymentSeatPlan): { ok: true; later: number } | { ok: false; total: number } {
  const total = plan.covered + plan.dated + plan.group;
  if (total > plan.classCount) return { ok: false, total };
  return { ok: true, later: plan.classCount - total };
}

/** A seat as the «sin pago» rule reads it. */
export interface UnpaidSeatInput {
  paymentId: string | null;
  isFree: boolean;
  seatMovedAt: Date | null;
  classStatusCode: ClassStatusCode;
}

/**
 * The ONE definition of «Sin pago»: no payment, not free, not moved away, and
 * a class that was not cancelled. The queues, the payment's context, the
 * student's payments page and `registerPayment` all read it, as a function
 * over a row or as the `where` below; the test keeps the two the same.
 */
export function isUnpaidSeat(seat: UnpaidSeatInput): boolean {
  return (
    seat.paymentId === null &&
    !seat.isFree &&
    seat.seatMovedAt === null &&
    seat.classStatusCode !== CLASS_STATUS.CANCELLED
  );
}

/**
 * The same rule as a Prisma `where` over `ClassParticipant`. Typed by hand
 * until the columns exist in the generated client (phase 2), when it becomes a
 * `Prisma.ClassParticipantWhereInput`.
 */
export const unpaidSeatWhere = {
  paymentId: null,
  isFree: false,
  seatMovedAt: null,
  class: { status: { code: { not: CLASS_STATUS.CANCELLED } } },
} as const;
