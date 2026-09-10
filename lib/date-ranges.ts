// Calendar ranges for the student's statistics: "this week" is the current week
// (from Monday), not the last seven days.

export type StatsRangeKey = "week" | "month" | "year" | "all";

/** UTC date at midnight: the daily bucket of UserStatDaily. */
export function toUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * First day (inclusive) of the calendar range, or null for "all time". The week
 * starts on Monday, as is customary in Spain and Latin America.
 */
export function rangeStart(range: StatsRangeKey, now: Date): Date | null {
  const today = toUtcDay(now);

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
