// Conversion between an instant (UTC, as it is stored) and the wall-clock time
// of an IANA zone, which is what a person types and reads in a
// `<input type="datetime-local">`.
//
// Classes are stored in UTC and the teacher schedules them in THEIR zone
// (`Teacher.timezone`); without this, "Monday at 18:00" would be stored shifted.
// It is solved with `Intl` — present in Node and in the browser — instead of
// adding a date dependency.

/** Format of `<input type="datetime-local">`: "YYYY-MM-DDTHH:mm". */
const DATETIME_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClockIn(date: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes): number =>
    Number.parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

/**
 * Offset of the zone at that instant, in milliseconds (positive to the east).
 * `lib/study-streak.ts` shares it, as it needs the same computation for the
 * midnight of the study day.
 */
export function offsetMsAt(date: Date, timeZone: string): number {
  const wall = wallClockIn(date, timeZone);
  const asIfUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  return asIfUtc - date.getTime();
}

/** Instant → "YYYY-MM-DDTHH:mm" in the given zone, ready for the input. */
export function formatDateTimeLocal(date: Date, timeZone: string): string {
  const wall = wallClockIn(date, timeZone);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`;
}

/**
 * "YYYY-MM-DDTHH:mm" in a zone → UTC instant, or null when it is not a valid
 * date. The offset is applied twice because the offset itself depends on the
 * instant: on a daylight saving change, the first estimate can land on the
 * other side of the jump.
 */
export function parseDateTimeLocal(value: string, timeZone: string): Date | null {
  const match = DATETIME_LOCAL.exec(value.trim());
  if (!match) return null;

  const [year = NaN, month = NaN, day = NaN, hour = NaN, minute = NaN] = match.slice(1, 6).map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);

  const firstGuess = new Date(asIfUtc - offsetMsAt(new Date(asIfUtc), timeZone));
  const instant = new Date(asIfUtc - offsetMsAt(firstGuess, timeZone));
  if (Number.isNaN(instant.getTime())) return null;

  // Impossible dates ("2026-02-31") would be normalised silently: they are rejected.
  const wall = wallClockIn(instant, timeZone);
  const roundTrips = wall.year === year && wall.month === month && wall.day === day;
  return roundTrips ? instant : null;
}

/** A zone valid for `Intl`, or UTC as a documented fallback. */
export function safeTimeZone(timeZone: string | null | undefined): string {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}
