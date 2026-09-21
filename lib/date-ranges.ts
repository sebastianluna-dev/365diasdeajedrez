// Calendar ranges for the student's statistics: "this week" is the current week
// (from Monday), not the last seven days.
//
// Days are the STUDY day (STUDY_DAY_TIMEZONE), like the streak: in UTC the
// evening's lessons of a student in Mexico would count on the following day,
// and the week would turn over at six in the evening.

import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { dayKey } from "@/lib/study-streak";

export type StatsRangeKey = "week" | "month" | "year" | "all";

/**
 * The daily bucket of UserStatDaily: the calendar day the instant belongs to
 * in the study zone, stored as that date at UTC midnight (the column is a
 * `date`; the time part only says which day it is).
 */
export function statsDay(date: Date, timeZone: string = STUDY_DAY_TIMEZONE): Date {
  return new Date(`${dayKey(date, timeZone)}T00:00:00.000Z`);
}

/**
 * First day (inclusive) of the calendar range, or null for "all time". The week
 * starts on Monday, as is customary in Spain and Latin America.
 */
export function rangeStart(range: StatsRangeKey, now: Date, timeZone: string = STUDY_DAY_TIMEZONE): Date | null {
  const today = statsDay(now, timeZone);

  switch (range) {
    case "week": {
      // getUTCDay(): 0 = Sunday. It steps back to the previous Monday.
      const weekday = (today.getUTCDay() + 6) % 7;
      return new Date(today.getTime() - weekday * 24 * 60 * 60 * 1000);
    }
    case "month":
      return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    case "year":
      return new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    case "all":
      return null;
  }
}
