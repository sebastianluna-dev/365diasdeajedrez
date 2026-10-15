import { CLASS_DURATIONS } from "@/constants/platform/class-slots.const";
import { formatDateTimeLocal, parseDateTimeLocal } from "@/lib/timezone";
import { classEndsAt } from "./class-phase";

// Dating a class: what is refused, what is only warned about, and the dates a
// weekly rhythm produces. The staff dates every class — when registering a
// payment, creating a class, rescheduling it or scheduling a paid seat — and
// every one of those forms checks here, in the browser for convenience and in
// the action for real.
//
// Pure module: receives `now` and the busy slots, never reads the clock.

export interface BusySlot {
  title: string;
  start: Date;
  end: Date;
}

export interface StudentBusySlot extends BusySlot {
  studentName: string;
}

export type ScheduleError = "meetingOpensLate";

export type ScheduleWarning =
  | { kind: "teacherOverlap"; classTitle: string }
  | { kind: "studentOverlap"; studentName: string; classTitle: string }
  | { kind: "past" };

export interface ScheduleCheck {
  error: ScheduleError | null;
  warnings: ScheduleWarning[];
}

export interface ScheduleInput {
  scheduledAt: Date;
  durationMin: number;
  /** The instant the staff chose for the link, or null for the default. */
  meetingVisibleFrom: Date | null;
  now: Date;
  teacherBusy: readonly BusySlot[];
  studentBusy: readonly StudentBusySlot[];
}

function overlaps(slot: BusySlot, start: Date, end: Date): boolean {
  return slot.start.getTime() < end.getTime() && slot.end.getTime() > start.getTime();
}

/**
 * A link that opens after the class starts is refused. An overlap of the
 * teacher or of a student, and a date already past, are warned about and not
 * refused: documenting a class after the fact is legitimate, and the staff may
 * be moving the other class next.
 */
export function validateClassSchedule(input: ScheduleInput): ScheduleCheck {
  const end = classEndsAt(input.scheduledAt, input.durationMin);
  const error: ScheduleError | null =
    input.meetingVisibleFrom !== null && input.meetingVisibleFrom.getTime() > input.scheduledAt.getTime()
      ? "meetingOpensLate"
      : null;

  const warnings: ScheduleWarning[] = [];
  for (const slot of input.teacherBusy) {
    if (overlaps(slot, input.scheduledAt, end)) warnings.push({ kind: "teacherOverlap", classTitle: slot.title });
  }
  for (const slot of input.studentBusy) {
    if (overlaps(slot, input.scheduledAt, end)) {
      warnings.push({ kind: "studentOverlap", studentName: slot.studentName, classTitle: slot.title });
    }
  }
  if (input.scheduledAt.getTime() < input.now.getTime()) warnings.push({ kind: "past" });
  return { error, warnings };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function shiftDayKey(key: string, days: number): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** `count` dates, "yyyy-mm-dd", one a week from `first`. Key arithmetic: no zone is needed to add seven days. */
export function weeklyDates(first: string, count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => shiftDayKey(first, index * 7));
}

export interface ClassRhythm {
  /** "yyyy-mm-dd" of the first class. */
  firstDate: string;
  /** "HH:MM" in the zone. */
  time: string;
  durationMin: number;
  repeat: "weekly";
}

/** The last class of the student, to repeat its rhythm. */
export interface LastClassSlot {
  scheduledAt: Date;
  durationMin: number;
}

const DEFAULT_RHYTHM: Omit<ClassRhythm, "firstDate"> = { time: "12:00", durationMin: 60, repeat: "weekly" };

/**
 * The rhythm a payment's classes are prefilled with: the weekday, time and
 * duration of the student's last class, starting with its next occurrence after
 * `now`; without one, tomorrow at noon for an hour.
 */
export function suggestRhythm(lastClass: LastClassSlot | null, now: Date, timeZone: string): ClassRhythm {
  const todayKey = formatDateTimeLocal(now, timeZone).slice(0, 10);
  if (lastClass === null) return { ...DEFAULT_RHYTHM, firstDate: shiftDayKey(todayKey, 1) };

  const local = formatDateTimeLocal(lastClass.scheduledAt, timeZone);
  let firstDate = local.slice(0, 10);
  while (firstDate <= todayKey) firstDate = shiftDayKey(firstDate, 7);
  return { firstDate, time: local.slice(11, 16), durationMin: lastClass.durationMin, repeat: "weekly" };
}

/** The instant of a date and a time typed in a zone, or null when they do not make a date. */
export function slotInstant(date: string, time: string, timeZone: string): Date | null {
  return parseDateTimeLocal(`${date}T${time}`, timeZone);
}

/**
 * The durations a form offers, plus the class's current one when it is not on
 * the list (an old class of 50 minutes), so rescheduling or duplicating it
 * does not change it in silence.
 */
export function durationOptions(current?: number | null): number[] {
  const options = new Set<number>(CLASS_DURATIONS);
  if (current !== undefined && current !== null && current > 0) options.add(current);
  return [...options].sort((left, right) => left - right);
}
