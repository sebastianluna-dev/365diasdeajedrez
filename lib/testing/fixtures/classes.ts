import {
  CLASS_PHASE,
  CLASS_STATUS,
  type ClassPhaseCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import type { ClassPhaseInput } from "@/services/shared/class-phase";
import type { PaymentForBalance, SeatRow } from "@/services/shared/payment-seats";

// The classes of the demo as the rules read them, for the tests of the pure
// modules and, later, for the stories: a class in every phase, a payment with
// seats in every state, a group class. Everything is fixed to the example day
// of the specification — Wednesday 14 October 2026 at 11:40 in Mexico City,
// which is 17:40 UTC: the city has had no daylight saving since 2022 — so a
// test says «at 11:40» and means it whatever machine it runs on. Never read by
// the app.

export const CLASSES_TIME_ZONE = "America/Mexico_City";

/** Wednesday 14 October 2026, 11:40 in Mexico City. */
export const CLASSES_NOW = new Date("2026-10-14T17:40:00.000Z");

/** An instant on the example day, from the wall-clock hour in Mexico City (UTC−6, no daylight saving). */
export function cdmx(date: string, time: string): Date {
  return new Date(`${date}T${time}:00.000-06:00`);
}

const ZOOM = "https://zoom.us/j/11111111111";

export interface FixtureClass extends ClassPhaseInput {
  id: string;
  title: string | null;
  durationMin: number;
  meetingUrl: string | null;
  /** The phase at CLASSES_NOW, for a test to assert against. */
  phaseAtNow: ClassPhaseCode;
}

function fixtureClass(
  id: string,
  title: string | null,
  date: string,
  time: string,
  durationMin: number,
  statusCode: ClassStatusCode,
  meetingUrl: string | null,
  phaseAtNow: ClassPhaseCode,
): FixtureClass {
  const scheduledAt = cdmx(date, time);
  const endsAt = new Date(scheduledAt.getTime() + durationMin * 60 * 1000);
  const visibleFrom = meetingUrl === null ? null : new Date(scheduledAt.getTime() - 30 * 60 * 1000);
  return {
    id,
    title,
    scheduledAt,
    endsAt,
    durationMin,
    statusCode,
    meetingUrl,
    visibleFrom,
    hasLink: meetingUrl !== null,
    phaseAtNow,
  };
}

/** One class per phase, seen at CLASSES_NOW. */
export const FIXTURE_CLASSES = {
  /** Last week, finished: the review example. */
  done: fixtureClass(
    "cls-done",
    "Ataques al rey en el centro",
    "2026-10-07",
    "12:00",
    60,
    CLASS_STATUS.COMPLETED,
    ZOOM,
    CLASS_PHASE.DONE,
  ),
  /** Today at noon, its link open since 11:30. */
  open: fixtureClass(
    "cls-open",
    "Repaso de la Najdorf: tus dudas",
    "2026-10-14",
    "12:00",
    60,
    CLASS_STATUS.SCHEDULED,
    ZOOM,
    CLASS_PHASE.OPEN,
  ),
  /** Today at 17:00, without a link. */
  upcoming: fixtureClass(
    "cls-upcoming",
    "Plan de aperturas con blancas",
    "2026-10-14",
    "17:00",
    60,
    CLASS_STATUS.SCHEDULED,
    null,
    CLASS_PHASE.UPCOMING,
  ),
  /** Today at 19:00, no topic yet. */
  untitled: fixtureClass(
    "cls-untitled",
    null,
    "2026-10-14",
    "19:00",
    60,
    CLASS_STATUS.SCHEDULED,
    "https://zoom.us/j/33333333333",
    CLASS_PHASE.UPCOMING,
  ),
  /** Two days ago, never finalized. */
  awaitingClose: fixtureClass(
    "cls-awaiting",
    "Defensa Caro-Kann: ideas",
    "2026-10-12",
    "17:00",
    60,
    CLASS_STATUS.SCHEDULED,
    ZOOM,
    CLASS_PHASE.AWAITING_CLOSE,
  ),
  /** Cancelled by the staff. */
  cancelled: fixtureClass(
    "cls-cancelled",
    "Táctica de la semana",
    "2026-10-09",
    "18:00",
    60,
    CLASS_STATUS.CANCELLED,
    ZOOM,
    CLASS_PHASE.CANCELLED,
  ),
  /** Saturday, a group class of six seats. */
  group: fixtureClass(
    "cls-group",
    "Taller de finales de torre",
    "2026-10-17",
    "10:00",
    90,
    CLASS_STATUS.SCHEDULED,
    "https://zoom.us/j/22222222222",
    CLASS_PHASE.UPCOMING,
  ),
  /** An old LIVE row, which reads as scheduled and, at this hour, in progress. */
  staleLive: fixtureClass(
    "cls-live",
    "Clase en vivo de antes",
    "2026-10-14",
    "11:30",
    60,
    CLASS_STATUS.LIVE,
    ZOOM,
    CLASS_PHASE.IN_PROGRESS,
  ),
} as const;

export const FIXTURE_PAYMENT_ID = "pay-oct-1";

function seat(classId: string, phase: ClassPhaseCode, scheduledAt: Date, extra: Partial<SeatRow> = {}): SeatRow {
  return {
    classId,
    paymentId: FIXTURE_PAYMENT_ID,
    isFree: false,
    attended: null,
    seatMovedAt: null,
    phase,
    scheduledAt,
    ...extra,
  };
}

/**
 * The seats of «Alumno Demo»'s payment of 1 October (four classes): one
 * taken, one open today, one in Saturday's group class, one to schedule.
 */
export const FIXTURE_PAYMENT_SEATS: readonly SeatRow[] = [
  seat(FIXTURE_CLASSES.done.id, CLASS_PHASE.DONE, FIXTURE_CLASSES.done.scheduledAt, { attended: true }),
  seat(FIXTURE_CLASSES.open.id, CLASS_PHASE.OPEN, FIXTURE_CLASSES.open.scheduledAt),
  seat(FIXTURE_CLASSES.group.id, CLASS_PHASE.UPCOMING, FIXTURE_CLASSES.group.scheduledAt),
];

/** The payment those seats spend. */
export const FIXTURE_PAYMENT: PaymentForBalance = {
  id: FIXTURE_PAYMENT_ID,
  classCount: 4,
  paidOn: new Date("2026-10-01T00:00:00.000Z"),
  seats: FIXTURE_PAYMENT_SEATS,
};

/** Seats that never enter a balance, and the ones that leave it. */
export const FIXTURE_OTHER_SEATS = {
  /** A diagnosis class, charged to nobody. */
  free: seat("cls-free", CLASS_PHASE.UPCOMING, cdmx("2026-10-16", "18:00"), { paymentId: null, isFree: true }),
  /** In the group class, with the payment still pending. */
  unpaid: seat(FIXTURE_CLASSES.group.id, CLASS_PHASE.UPCOMING, FIXTURE_CLASSES.group.scheduledAt, { paymentId: null }),
  /** Missed, and given another date by the staff: it no longer counts. */
  moved: seat("cls-missed", CLASS_PHASE.DONE, cdmx("2026-10-02", "19:00"), {
    paymentId: "pay-sep-15",
    attended: false,
    seatMovedAt: cdmx("2026-10-05", "10:00"),
  }),
  /** The seat it was moved to: this one counts instead. */
  movedTo: seat("cls-moved-to", CLASS_PHASE.DONE, cdmx("2026-10-09", "19:00"), {
    paymentId: "pay-sep-15",
    attended: true,
  }),
  /** A no-show that was not moved: the class is spent. */
  missed: seat("cls-missed-2", CLASS_PHASE.DONE, cdmx("2026-10-05", "17:00"), {
    paymentId: "pay-sep-15",
    attended: false,
  }),
  /** Its class was cancelled: the seat went back to the payment. */
  returned: seat(FIXTURE_CLASSES.cancelled.id, CLASS_PHASE.CANCELLED, FIXTURE_CLASSES.cancelled.scheduledAt, {
    paymentId: "pay-sep-15",
  }),
} as const;

/** Valentina's payment of 15 September: four classes, one moved after a miss, one cancelled and returned. */
export const FIXTURE_SECOND_PAYMENT: PaymentForBalance = {
  id: "pay-sep-15",
  classCount: 4,
  paidOn: new Date("2026-09-15T00:00:00.000Z"),
  seats: [
    FIXTURE_OTHER_SEATS.moved,
    FIXTURE_OTHER_SEATS.movedTo,
    FIXTURE_OTHER_SEATS.missed,
    FIXTURE_OTHER_SEATS.returned,
  ],
};

/** The group class's four students; Lucía is not assigned to the teacher. */
export const FIXTURE_GROUP_STUDENTS = [
  { name: "Alumno Demo", assigned: true },
  { name: "Mateo Ríos", assigned: true },
  { name: "Diego Salas", assigned: true },
  { name: "Lucía Herrera", assigned: false },
] as const;

export const FIXTURE_TEACHER_NAME = "GM Profesor Demo";
