// The daily streak: how many days in a row the student has studied.
//
// Pure module, without a database or system dates, because a streak is exactly
// the kind of count that breaks at the edges — the turn of the month, the leap
// year, the clock change, the day that has not finished yet — and checking it
// should not require waiting until tomorrow.
//
// Days are handled as "yyyy-mm-dd" keys in the study day's time zone
// (STUDY_DAY_TIMEZONE), not in UTC: the streak is the only thing the student
// sees change on the stroke of midnight, and in UTC their midnight would be the
// afternoon.

import { offsetMsAt } from "@/lib/timezone";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The key of the day an instant belongs to, in whichever zone is passed.
 *
 * `en-CA` because its short date format IS "yyyy-mm-dd"; the formatter is used
 * and not hour arithmetic so that daylight saving changes are resolved by
 * `Intl` and not by this file.
 */
export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * The instant a day starts, to bound queries: the midnight of that date IN that
 * zone, expressed in UTC, which is how dates are stored.
 *
 * The offset is measured at noon and not at midnight: on the night of the clock
 * change, midnight may not exist or may exist twice, and noon always falls
 * cleanly inside the day being asked about.
 */
export function startOfDay(key: string, timeZone: string): Date {
  const midday = new Date(`${key}T12:00:00.000Z`);
  return new Date(Date.parse(`${key}T00:00:00.000Z`) - offsetMsAt(midday, timeZone));
}

/**
 * The day before a key.
 *
 * Arithmetic on the key, without a zone: "the day before 1 March" is 28 or 29
 * February wherever one looks from, and bringing time zones in here would only
 * add one more place to get it wrong.
 */
function previousDay(key: string): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) - DAY_MS).toISOString().slice(0, 10);
}

/**
 * Consecutive days of study counting backwards from today.
 *
 * TODAY does not count towards breaking it: whoever studied yesterday and has
 * not started today still has their streak — the day is not over. If one had to
 * study before looking at the screen, the streak would look broken every
 * morning, which is exactly the opposite of what encourages carrying on.
 *
 * That is why the count starts at today if there is activity today and, if not,
 * at yesterday. If there is nothing yesterday either, the streak is zero: two
 * days without studying do break it.
 *
 * @param activeDays days with activity, as "yyyy-mm-dd" keys; duplicates and
 *   unordered input are accepted.
 * @param today the key of the current day.
 */
export function streakLength(activeDays: Iterable<string>, today: string): number {
  const days = activeDays instanceof Set ? activeDays : new Set(activeDays);
  if (days.size === 0) return 0;

  let cursor = days.has(today) ? today : previousDay(today);
  let length = 0;
  while (days.has(cursor)) {
    length += 1;
    cursor = previousDay(cursor);
  }
  return length;
}
