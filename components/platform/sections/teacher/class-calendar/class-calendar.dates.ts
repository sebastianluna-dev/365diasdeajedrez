// The dates of the class calendar, worked as plain days ("2026-10-19") in the
// teacher's zone: a class is placed by its start as the teacher's clock reads
// it, never by the browser's. Plain days are counted on UTC dates, where a day
// is always 24 hours, so no daylight change moves a column.

/** A day of the calendar, "YYYY-MM-DD". */
export type PlainDay = string;

export type CalendarView = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The day and the minute of the day an instant falls on, in a zone. */
export function zonedMoment(iso: string, timeZone: string): { day: PlainDay; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return {
    day: `${part("year")}-${part("month")}-${part("day")}`,
    minute: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

function utcOf(day: PlainDay): Date {
  const [year = 1970, month = 1, date = 1] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
}

function plainOf(date: Date): PlainDay {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: PlainDay, count: number): PlainDay {
  return plainOf(new Date(utcOf(day).getTime() + count * DAY_MS));
}

/** The same day of another month, or that month's last day when it has fewer. */
export function addMonths(day: PlainDay, count: number): PlainDay {
  const date = utcOf(day);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return plainOf(target);
}

/** 0 for Monday … 6 for Sunday: the week starts on Monday. */
export function weekdayIndex(day: PlainDay): number {
  return (utcOf(day).getUTCDay() + 6) % 7;
}

export function startOfWeek(day: PlainDay): PlainDay {
  return addDays(day, -weekdayIndex(day));
}

export function startOfMonth(day: PlainDay): PlainDay {
  return `${day.slice(0, 7)}-01`;
}

/** The days a view shows: one, the seven of its week, or the six weeks that hold its month. */
export function daysOf(view: CalendarView, day: PlainDay): PlainDay[] {
  if (view === "day") return [day];
  if (view === "week") return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(day), index));
  const first = startOfWeek(startOfMonth(day));
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

/** Where «Anterior» and «Siguiente» lead: a day, a week or a month away. */
export function stepDay(view: CalendarView, day: PlainDay, direction: -1 | 1): PlainDay {
  if (view === "day") return addDays(day, direction);
  if (view === "week") return addDays(day, 7 * direction);
  return addMonths(day, direction);
}

function format(day: PlainDay, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("es-MX", { timeZone: "UTC", ...options }).format(utcOf(day));
}

/** «lunes, 19 de octubre de 2026», «19 – 25 de octubre de 2026», «28 de sept. – 4 de oct. de 2026», «octubre de 2026». */
export function viewTitle(view: CalendarView, day: PlainDay): string {
  if (view === "day") return format(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (view === "month") return format(day, { month: "long", year: "numeric" });
  const first = startOfWeek(day);
  const last = addDays(first, 6);
  if (first.slice(0, 7) === last.slice(0, 7)) {
    return `${Number(first.slice(8))} – ${format(last, { day: "numeric", month: "long", year: "numeric" })}`;
  }
  const year = first.slice(0, 4) === last.slice(0, 4) ? "" : ` de ${first.slice(0, 4)}`;
  return `${format(first, { day: "numeric", month: "short" })}${year} – ${format(last, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** «lun», «mar»… for a column head. */
export function weekdayShort(day: PlainDay): string {
  return format(day, { weekday: "short" }).replace(".", "");
}

/** «lunes 19 de octubre», the accessible name of a day. */
export function dayLong(day: PlainDay): string {
  return format(day, { weekday: "long", day: "numeric", month: "long" });
}

/** «18:00», a minute of the day on the 24-hour clock. */
export function clock(minute: number): string {
  const hours = Math.floor(minute / 60) % 24;
  return `${String(hours).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

/** A class laid on its day: where it starts and ends, in minutes, and its lane among those it overlaps. */
export interface Placed<T> {
  item: T;
  start: number;
  end: number;
  lane: number;
  lanes: number;
}

/**
 * The classes of one day in lanes, as Google Calendar sets them: those that
 * overlap share the width, each in the first lane free when it starts, and
 * a group of overlapping ones all take the group's count of lanes.
 */
export function placeInLanes<T>(items: { item: T; start: number; end: number }[]): Placed<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: Placed<T>[] = [];
  let group: Placed<T>[] = [];
  let groupEnd = -1;
  const close = () => {
    const lanes = Math.max(1, ...group.map((entry) => entry.lane + 1));
    for (const entry of group) entry.lanes = lanes;
    group = [];
  };
  for (const entry of sorted) {
    if (entry.start >= groupEnd) {
      close();
      groupEnd = -1;
    }
    const taken = new Set(group.filter((other) => other.end > entry.start).map((other) => other.lane));
    let lane = 0;
    while (taken.has(lane)) lane += 1;
    const next: Placed<T> = { ...entry, lane, lanes: 1 };
    group.push(next);
    placed.push(next);
    groupEnd = Math.max(groupEnd, entry.end);
  }
  close();
  return placed;
}
