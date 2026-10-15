import type { AttendanceMarkView } from "@/components/platform/shared/attendance-row/attendance-row.types";
import type { ClassAgendaDay } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import type { MeetingLinkCurrent } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.types";
import type { ClassFormatCode, ClassPhaseCode } from "@/constants/platform/class-codes.const";
import type { ClassBlockView } from "@/services/classes/classes.types";
import type { ClassHistoryEntry } from "@/services/shared/class-history";
import type { ClassEditable } from "@/services/shared/class-rules";
import type { SeatToSchedule } from "@/services/staff-payments/staff-payments.types";

// What the staff's class screens read: the agenda and its queues (ADM-1),
// the record of a class (ADM-4 and ADM-8), and what «Crear clase» and
// «Agregar alumnos» need to know about the students. No amount travels here:
// a seat says which payment it spends, never what it cost.

export type StaffAgendaTab = "proximas" | "pasadas" | "canceladas";

export interface StaffAgendaFilters {
  vista: StaffAgendaTab;
  teacherId?: string;
  q?: string;
  /** "yyyy-mm-dd": the last day «Próximas» shows; six days from today by default. */
  hasta?: string;
  /** «Pasadas», 1-based. */
  pagina: number;
}

/** A past class, as the table lists it: the row's data plus the table's own columns. */
export interface StaffPastClassRow extends ClassRowData {
  teacherName: string;
  participantCount: number;
  attendedCount: number;
}

export interface StaffAgendaView {
  filters: StaffAgendaFilters;
  timeZone: string;
  nowIso: string;
  /** «Hoy es miércoles 14 de octubre · 3 clases hoy y 5 esta semana». */
  headline: string;
  /** «Próximas»: the days with classes until `hasta`. */
  days: ClassAgendaDay[];
  /** «Hasta el martes 20 de octubre», and where «Ver la semana siguiente» leads. */
  foot: { untilLabel: string; nextHref: string };
  /** «Pasadas», paged. */
  past: { rows: StaffPastClassRow[]; total: number; page: number; pageSize: number };
  /** «Canceladas», newest first. */
  cancelled: ClassRowData[];
}

/** A class in a queue: where it leads and its one line. */
export interface StaffQueueClass {
  classId: string;
  href: string;
  title: string;
  /** «lun 12 oct · GM Profesor Demo · terminó hace 2 días». */
  line: string;
  /** «Por finalizar» for more than a day: drawn in warning. */
  warning?: boolean;
}

export interface StaffUnpaidSeat {
  classId: string;
  href: string;
  student: { id: string; displayName: string; email: string };
  title: string;
  /** «sáb 17 oct». */
  line: string;
}

export interface StaffRenewal {
  student: { id: string; displayName: string; email: string };
  /** «le queda 1 clase (hoy 19:00)», «no le quedan clases». */
  line: string;
  href: string;
}

export interface StaffQueuesView {
  toSchedule: SeatToSchedule[];
  toFinalize: StaffQueueClass[];
  noLink: (StaffQueueClass & { current: MeetingLinkCurrent })[];
  unpaid: StaffUnpaidSeat[];
  inactiveTeacher: StaffQueueClass[];
  toRenew: StaffRenewal[];
}

/** How a seat is covered, with the words the record shows. */
export type StaffSeatCoverage =
  | { kind: "paid"; paymentId: string; label: string }
  | { kind: "free"; label: "Gratis" }
  | { kind: "unpaid"; label: "Sin pago" };

export interface StaffSeatView {
  userId: string;
  displayName: string;
  email: string;
  coverage: StaffSeatCoverage;
  attended: boolean | null;
  mark: AttendanceMarkView;
  /** Who wrote the mark that stands: «GM Profesor Demo marcó «Faltó»» in ADM-9's context. */
  markedByName: string | null;
  /** The student is assigned to the class's teacher. */
  isAssigned: boolean;
  /** The seat was given another date: it is history. */
  moved: boolean;
  can: { remove: boolean; register: boolean; changeAttendance: boolean; moveSeat: boolean };
  /** ADM-10's context: «Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo». */
  moveContext: string;
}

export interface StaffClassDetail {
  id: string;
  /** The display title: the topic, or «Clase de …». */
  title: string;
  topic: string | null;
  description: string | null;
  formatCode: ClassFormatCode;
  capacity: number | null;
  phase: ClassPhaseCode;
  teacher: { id: string; displayName: string; isActive: boolean };
  startIso: string;
  durationMin: number;
  timeZone: string;
  nowIso: string;
  meeting: MeetingLinkCurrent & { providerLabel: string | null; effectiveVisibleFromIso: string | null };
  seats: StaffSeatView[];
  counts: { seated: number; unpaid: number; free: number; attended: number; marked: number };
  editable: ClassEditable;
  afterNotes: {
    closedByName: string | null;
    closedAtIso: string;
    summary: string | null;
    recordingUrl: string | null;
  } | null;
  cancellation: { byName: string | null; atIso: string; reason: string | null; note: string | null } | null;
  reschedule: { previousStartIso: string; byName: string | null; atIso: string; note: string | null } | null;
  blocks: ClassBlockView[];
  history: ClassHistoryEntry[];
}

/** A student as «Crear clase» and «Agregar alumnos» list them. */
export interface SchedulableStudent {
  id: string;
  displayName: string;
  email: string;
  teacherId: string | null;
  teacherName: string | null;
  /** Paid classes without a date. */
  toSchedule: number;
  /** «pago del jue 1 oct»: the oldest payment with a class left, the one a seat spends (D13). */
  oldestPaymentLabel: string | null;
  hasPayments: boolean;
}

/** What «Crear clase» opens with. */
export interface NewClassDefaults {
  format: ClassFormatCode;
  capacity: number | null;
  title: string;
  description: string;
  teacherId: string | null;
  date: string;
  time: string;
  durationMin: number;
  meetingUrl: string;
  /** The student `?alumno=` named. */
  studentId: string | null;
  /** «Copia de «Taller de finales de torre» (sáb 17 oct)». */
  duplicateOf: string | null;
}
