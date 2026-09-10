// IANA time zones offered in the teacher profile. Short list on purpose (the
// academy's and its students'); the field admits any valid zone in the
// database, so extending it is only a matter of adding entries here.

export const COMMON_TIMEZONES = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
] as const;

export type CommonTimezone = (typeof COMMON_TIMEZONES)[number];

export function isCommonTimezone(value: string): value is CommonTimezone {
  return (COMMON_TIMEZONES as readonly string[]).includes(value);
}

/**
 * The zone in which the STUDY DAY starts and ends: the streak and today's
 * minutes are cut here.
 *
 * It is a constant and not a student setting because today they are not asked
 * their zone (only the teacher has one, to schedule classes). In UTC the day
 * would change at six in the evening in Mexico, and seeing the streak reset
 * over dinner is worse than the imprecision for whoever studies from another
 * zone. When the student gets a zone of their own, this becomes their default.
 */
export const STUDY_DAY_TIMEZONE = "America/Mexico_City";
