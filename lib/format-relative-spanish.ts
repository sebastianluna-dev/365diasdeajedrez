// "hace 3 meses", "ayer", "el año pasado": how long ago something happened,
// in Spanish, for the places where the distance matters more than the day.
// `Intl.RelativeTimeFormat` picks the words; this only picks the unit.

const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 365 * 24 * 3600 },
  { unit: "month", seconds: 30 * 24 * 3600 },
  { unit: "day", seconds: 24 * 3600 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** `now` is a parameter so a test can pin it; the caller never passes it. */
export function formatRelativeSpanish(date: Date, now: Date = new Date()): string {
  const elapsed = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  for (const { unit, seconds } of UNITS) {
    if (elapsed >= seconds) return formatter.format(-Math.floor(elapsed / seconds), unit);
  }
  return "ahora mismo";
}
