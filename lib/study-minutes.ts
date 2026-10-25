// Study minutes by day and by month: the calendar arithmetic of the
// profile's «Minutos de estudio» chart (and of the statistics after it).
//
// Pure, without a database or system dates, as lib/study-streak.ts is: the
// days are "yyyy-mm-dd" keys in the study day's time zone, and the month
// before January, a month of 28 days or the 31st that the month before does
// not have are exactly the edges a test should reach without waiting for them.

const DAY_MS = 24 * 60 * 60 * 1000;

/** The first day of the month a key is in: "2026-10-25" → "2026-10-01". */
export function monthStartOf(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

/** How many days the month a key is in has. */
export function daysInMonthOf(key: string): number {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  // Day 0 of the next month is the last of this one.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The first day of the month before the one a key is in: "2026-01-14" → "2025-12-01". */
export function previousMonthStartOf(key: string): string {
  const start = Date.parse(`${monthStartOf(key)}T00:00:00.000Z`);
  return monthStartOf(new Date(start - DAY_MS).toISOString().slice(0, 10));
}

/** The last day of the month a key is in. */
export function monthEndOf(key: string): string {
  return `${key.slice(0, 7)}-${String(daysInMonthOf(key)).padStart(2, "0")}`;
}

/** The day after a key: the end, not included, of a range that ends on it. */
export function dayAfter(key: string): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) + DAY_MS).toISOString().slice(0, 10);
}

/** Every day from `from` to `to`, both included, oldest first; none when `to` is before `from`. */
export function daysBetween(from: string, to: string): string[] {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  const days: string[] = [];
  for (let at = start; at <= end; at += DAY_MS) days.push(new Date(at).toISOString().slice(0, 10));
  return days;
}

/** The running total of a list: [10, 0, 5] → [10, 10, 15]. */
export function cumulative(values: readonly number[]): number[] {
  let total = 0;
  return values.map((value) => (total += value));
}
