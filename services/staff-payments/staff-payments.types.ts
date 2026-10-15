import type { ClassPhaseCode } from "@/constants/platform/class-codes.const";
import type { CurrencyCode } from "@/constants/platform/currency-codes.const";

// What the staff's payment screens read. Every amount arrives formatted, as
// text: a Prisma Decimal never crosses into a client component.

/** A seat of a payment, as its card lists it: «clase n de m». */
export interface PaymentSeatView {
  classId: string;
  href: string;
  /** «Clase n de m», chronological; counting seats only. */
  ordinal: number;
  title: string;
  startIso: string;
  durationMin: number;
  phase: ClassPhaseCode;
  attended: boolean | null;
  isGroup: boolean;
  /** The seat was moved: it no longer counts; the new one carries «reposición del …». */
  moved?: { toClassId: string | null; label: string };
  /** This seat is the one a moved seat went to. */
  replacesLabel?: string;
}

export interface StaffPaymentView {
  id: string;
  paidOnIso: string;
  /** «jue 1 oct 2026». */
  paidOnLabel: string;
  amount: string;
  currencyCode: CurrencyCode;
  /** «$1,400.00 MXN». */
  amountLabel: string;
  /** «$350.00 por clase». */
  perClassLabel: string;
  classCount: number;
  reference: string | null;
  note: string | null;
  recordedByName: string | null;
  seats: PaymentSeatView[];
  taken: number;
  scheduled: number;
  toSchedule: number;
  returned: number;
  /** Every class taken: the card opens folded. */
  allTaken: boolean;
  /** Nothing of it was given yet: it can be deleted. */
  canDelete: boolean;
  /** Why it cannot, as the menu's second line. */
  deleteReason?: string;
  /** What «Eliminar pago» leaves «Sin pago»: its seats with a date. */
  seatsLeftUnpaid: number;
  /** The least `classCount` an edit may keep: the seats that count. */
  minClassCount: number;
}

export interface UnpaidSeatView {
  classId: string;
  href: string;
  title: string;
  startIso: string;
  durationMin: number;
  phase: ClassPhaseCode;
}

export interface StudentPaymentsView {
  student: { id: string; displayName: string; email: string; teacherId: string | null; teacherName: string | null };
  balance: { left: number; scheduled: number; toSchedule: number; taken: number };
  payments: StaffPaymentView[];
  unpaidSeats: UnpaidSeatView[];
  /** The zone the page reads in: the academy's. */
  timeZone: string;
  nowIso: string;
}

/** A class on the calendar of a teacher or a student, for the overlap warnings. */
export interface BusySlotView {
  title: string;
  startIso: string;
  endIso: string;
  studentName?: string;
}

export interface RhythmDefaults {
  teacherId: string | null;
  firstDate: string;
  time: string;
  durationMin: number;
}

/** Everything «Registrar pago» needs about a student, read once when the student is chosen. */
export interface PaymentContext {
  student: { id: string; displayName: string; email: string; teacherId: string | null; teacherName: string | null };
  lastPayment: {
    paidOnLabel: string;
    classCount: number;
    amount: string;
    currencyCode: CurrencyCode;
    amountLabel: string;
  } | null;
  rhythm: RhythmDefaults;
  /** The link of the student's last class with one (O2). */
  lastMeetingUrl: string | null;
  /** «Le queda 1 clase (hoy 19:00)», «Sin clases pagadas». */
  balanceLine: string;
  unpaidSeats: UnpaidSeatView[];
  studentBusy: BusySlotView[];
  teacherBusy: BusySlotView[];
}

/** A paid class still without a date: the «Por programar» queue. */
export interface SeatToSchedule {
  paymentId: string;
  studentId: string;
  studentName: string;
  /** «2 de su pago del mié 14 oct». */
  label: string;
  count: number;
  teacherId: string | null;
  href: string;
}

export interface TeacherOption {
  id: string;
  displayName: string;
}

/** A group class a paid seat can go to. */
export interface OpenGroupClassOption {
  classId: string;
  title: string;
  startIso: string;
  durationMin: number;
  teacherName: string;
  seated: number;
  capacity: number;
  /** Why it cannot be chosen: «Completa», «Ya está en esta clase». */
  disabledReason?: string;
}
