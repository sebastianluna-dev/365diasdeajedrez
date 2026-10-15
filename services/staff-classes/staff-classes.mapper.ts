import type { AttendanceMarkView } from "@/components/platform/shared/attendance-row/attendance-row.types";
import type { ClassAgendaDay } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import type { ClassRowChip, ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import {
  CLASS_FORMAT,
  CLASS_PHASE,
  type ClassFormatCode,
  type ClassPhaseCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { formatAgendaDay, formatClassDay, formatClassStamp, formatLongDay } from "@/lib/format-class-when";
import { staffRoutes } from "@/lib/platform-routes";
import { dayKeyIn } from "@/lib/timezone";
import { classPhase } from "@/services/shared/class-phase";
import { canMoveSeat, classDisplayTitle, editableClassFields } from "@/services/shared/class-rules";
import { meetingVisibleFrom } from "@/services/shared/meeting-visible-from";
import { isUnpaidSeat } from "@/services/shared/payment-seats";
import type { StaffPastClassRow, StaffSeatCoverage, StaffSeatView } from "./staff-classes.types";

// Pure: receives the rows the service read and `now`, never the clock.

/** A class as the agenda reads it. */
export interface StaffAgendaClassRow {
  id: string;
  title: string | null;
  scheduledAt: Date;
  endsAt: Date;
  durationMin: number;
  statusCode: ClassStatusCode;
  formatCode: ClassFormatCode;
  capacity: number | null;
  meetingUrl: string | null;
  meetingUrlVisibleFrom: Date | null;
  teacher: { id: string; displayName: string; isActive: boolean };
  /** Every seat, moved ones included. */
  seats: {
    userId: string;
    displayName: string;
    isFree: boolean;
    paymentId: string | null;
    seatMovedAt: Date | null;
    attended: boolean | null;
  }[];
}

export function agendaPhaseOf(row: StaffAgendaClassRow, now: Date): ClassPhaseCode {
  return classPhase(
    {
      statusCode: row.statusCode,
      scheduledAt: row.scheduledAt,
      endsAt: row.endsAt,
      visibleFrom: meetingVisibleFrom(row.meetingUrl, row.scheduledAt, row.meetingUrlVisibleFrom),
      hasLink: row.meetingUrl !== null,
    },
    now,
  );
}

/** The seats that count: not moved. */
function seatedOf(row: StaffAgendaClassRow) {
  return row.seats.filter((seat) => seat.seatMovedAt === null);
}

/** The display title for the staff: the topic, or «Clase de …». */
export function staffClassTitle(row: StaffAgendaClassRow): string {
  return classDisplayTitle(
    {
      title: row.title,
      formatCode: row.formatCode,
      teacherName: row.teacher.displayName,
      studentNames: seatedOf(row).map((seat) => seat.displayName),
    },
    "staff",
  );
}

/** «GM Profesor Demo · Alumno Demo · Individual», «GM Profesor Demo · Grupal · 4 de 6 plazas». */
export function staffClassPeople(row: StaffAgendaClassRow): string {
  const seated = seatedOf(row);
  if (row.formatCode === CLASS_FORMAT.GROUP) {
    return `${row.teacher.displayName} · Grupal · ${seated.length} de ${row.capacity ?? seated.length} plazas`;
  }
  return `${row.teacher.displayName} · ${seated[0]?.displayName ?? "Sin alumno"} · Individual`;
}

/** The chips of a row: what the staff should see at a glance. */
export function staffClassChips(row: StaffAgendaClassRow, phase: ClassPhaseCode): ClassRowChip[] {
  const chips: ClassRowChip[] = [];
  const seated = seatedOf(row);
  if (row.meetingUrl === null && phase === CLASS_PHASE.UPCOMING) {
    chips.push({ icon: "no-link", label: "Sin enlace", tone: "warning" });
  }
  const unpaid = seated.filter((seat) =>
    isUnpaidSeat({
      paymentId: seat.paymentId,
      isFree: seat.isFree,
      seatMovedAt: seat.seatMovedAt,
      classStatusCode: row.statusCode,
    }),
  ).length;
  if (unpaid > 0) chips.push({ icon: "unpaid", label: `${unpaid} sin pago`, tone: "warning" });
  if (seated.length > 0 && seated.every((seat) => seat.isFree)) chips.push({ icon: "free", label: "Gratis" });
  if (!row.teacher.isActive && phase !== CLASS_PHASE.CANCELLED && phase !== CLASS_PHASE.DONE) {
    chips.push({ icon: "teacher-inactive", label: "Profesor desactivado", tone: "warning" });
  }
  return chips;
}

/** One row of the staff's agenda; a class without a link offers «Agregar». */
export function mapAgendaRow(row: StaffAgendaClassRow, now: Date, timeZone: string): ClassRowData {
  const phase = agendaPhaseOf(row, now);
  const chips = staffClassChips(row, phase);
  return {
    id: row.id,
    href: staffRoutes.staffClassDetail(row.id),
    title: staffClassTitle(row),
    phase,
    startIso: row.scheduledAt.toISOString(),
    durationMin: row.durationMin,
    timeZone,
    nowIso: now.toISOString(),
    people: staffClassPeople(row),
    chips,
    ...(row.meetingUrl === null && phase === CLASS_PHASE.UPCOMING
      ? {
          action: {
            kind: "meeting" as const,
            label: "Agregar",
            classId: row.id,
            current: {
              meetingUrl: null,
              visibleFromIso: null,
              startIso: row.scheduledAt.toISOString(),
              durationMin: row.durationMin,
            },
          },
        }
      : {}),
  };
}

/** A past class, with the table's columns. */
export function mapPastRow(row: StaffAgendaClassRow, now: Date, timeZone: string): StaffPastClassRow {
  const seated = seatedOf(row);
  return {
    ...mapAgendaRow(row, now, timeZone),
    teacherName: row.teacher.displayName,
    participantCount: seated.length,
    attendedCount: seated.filter((seat) => seat.attended === true).length,
  };
}

/** The rows by day, in the zone, only the days with any. */
export function groupAgendaDays(rows: ClassRowData[], timeZone: string, now: Date): ClassAgendaDay[] {
  const todayKey = dayKeyIn(now, timeZone);
  const days = new Map<string, ClassRowData[]>();
  for (const row of rows) {
    const key = dayKeyIn(new Date(row.startIso), timeZone);
    days.set(key, [...(days.get(key) ?? []), row]);
  }
  return [...days.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, dayRows]) => ({
      key,
      label: formatAgendaDay(key, todayKey),
      isToday: key === todayKey,
      rows: dayRows.sort((left, right) => left.startIso.localeCompare(right.startIso)),
    }));
}

/** «Hoy es miércoles 14 de octubre · 3 clases hoy y 5 esta semana». */
export function agendaHeadline(todayKey: string, todayCount: number, weekCount: number): string {
  const today = todayCount === 0 ? "sin clases hoy" : `${todayCount} clase${todayCount === 1 ? "" : "s"} hoy`;
  return `Hoy es ${formatLongDay(todayKey, todayKey)} · ${today} y ${weekCount} esta semana`;
}

/** «terminó hace 2 días», «hace 3 h», «hace 20 min». */
export function agoLabel(from: Date, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - from.getTime()) / 60_000));
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

/** A seat as the record reads it. */
export interface StaffSeatRow {
  userId: string;
  displayName: string;
  email: string;
  isFree: boolean;
  payment: { id: string; paidOn: Date; classCount: number } | null;
  attended: boolean | null;
  seatMovedAt: Date | null;
  seatMovedToClass: { id: string; scheduledAt: Date } | null;
  /** The class this seat replaces: where a moved seat came from. */
  replaces: { scheduledAt: Date } | null;
  changes: {
    changedAt: Date;
    byName: string | null;
    fromAttended: boolean | null;
    toAttended: boolean;
    reason: string | null;
    isOverride: boolean;
  }[];
}

export interface StaffSeatContext {
  phase: ClassPhaseCode;
  statusCode: ClassStatusCode;
  scheduledAt: Date;
  teacherName: string;
  /** The students assigned to the class's teacher. */
  assignedIds: ReadonlySet<string>;
  /** «clase n de m» of each paid seat, by payment and class. */
  ordinalOf: (paymentId: string) => number | undefined;
  timeZone: string;
  now: Date;
}

/** «Pago del jue 1 oct», the day a payment was made, in the academy's calendar. */
export function paymentDayLabel(paidOn: Date, now: Date): string {
  return formatClassDay(new Date(paidOn.getTime() + 12 * 60 * 60 * 1000), "UTC", now);
}

const quoted = (attended: boolean | null) => (attended === null ? "«Sin marca»" : attended ? "«Asistió»" : "«Faltó»");

/** A seat's mark, with the lines that say who wrote it and who changed it. */
export function seatMarkOf(seat: StaffSeatRow, context: StaffSeatContext): AttendanceMarkView {
  const first = seat.changes[0];
  const override = [...seat.changes].reverse().find((change) => change.isOverride);
  const mark: AttendanceMarkView = { attended: seat.attended };
  if (first) {
    mark.markedLine = `Marcó ${first.byName ?? "Administración"} · ${formatClassStamp(first.changedAt, context.timeZone, context.now)}`;
  }
  if (override) {
    mark.changedLine = `Cambió ${override.byName ?? "Administración"} · ${formatClassStamp(override.changedAt, context.timeZone, context.now)} · ${quoted(override.fromAttended)} → ${quoted(override.toAttended)}${override.reason ? `: «${override.reason}»` : ""}`;
  }
  if (seat.seatMovedAt) {
    mark.moved = seat.seatMovedToClass
      ? {
          label: `Faltó · reprogramada al ${formatClassDay(seat.seatMovedToClass.scheduledAt, context.timeZone, context.now)}`,
          href: staffRoutes.staffClassDetail(seat.seatMovedToClass.id),
        }
      : { label: "Faltó · devuelta a su pago" };
  }
  if (seat.replaces) {
    mark.replacesLabel = `Reposición de su clase del ${formatClassDay(seat.replaces.scheduledAt, context.timeZone, context.now)}`;
  }
  return mark;
}

export function mapStaffSeat(seat: StaffSeatRow, context: StaffSeatContext): StaffSeatView {
  const editable = editableClassFields(context.phase);
  // A moved seat no longer counts: its ordinal went with it to the new seat.
  const ordinal = seat.payment && seat.seatMovedAt === null ? context.ordinalOf(seat.payment.id) : undefined;
  const coverage: StaffSeatCoverage = seat.payment
    ? {
        kind: "paid",
        paymentId: seat.payment.id,
        label: `Pago del ${paymentDayLabel(seat.payment.paidOn, context.now)}${ordinal !== undefined ? ` · clase ${ordinal} de ${seat.payment.classCount}` : ""}`,
      }
    : seat.isFree
      ? { kind: "free", label: "Gratis" }
      : { kind: "unpaid", label: "Sin pago" };
  const moved = seat.seatMovedAt !== null;
  const unpaid = isUnpaidSeat({
    paymentId: seat.payment?.id ?? null,
    isFree: seat.isFree,
    seatMovedAt: seat.seatMovedAt,
    classStatusCode: context.statusCode,
  });
  const last = seat.changes[seat.changes.length - 1];
  const day = formatClassDay(context.scheduledAt, context.timeZone, context.now);
  const which =
    coverage.kind === "paid"
      ? `es la ${coverage.label.replace(/^Pago del (\S+ \d+ \S+)( \d{4})? · clase (\d+) de (\d+)$/, "clase $3 de $4 de su pago del $1$2")}`
      : coverage.kind === "free"
        ? "la clase era gratis"
        : "la clase estaba sin pago";
  return {
    userId: seat.userId,
    displayName: seat.displayName,
    email: seat.email,
    coverage,
    attended: seat.attended,
    mark: seatMarkOf(seat, context),
    markedByName: last?.byName ?? null,
    isAssigned: context.assignedIds.has(seat.userId),
    moved,
    can: {
      remove: editable.removeStudents && seat.attended === null && !moved,
      register: unpaid,
      changeAttendance: editable.changeAttendance && !moved,
      moveSeat: canMoveSeat({ attended: seat.attended, seatMovedAt: seat.seatMovedAt }, context.phase),
    },
    moveContext: `Faltó el ${day} · ${which} · Profesor: ${context.teacherName}`,
  };
}
