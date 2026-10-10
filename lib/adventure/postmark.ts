const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"] as const;

/** The day a postmark says, in Mexico City's: `14 SEP 2026` as the stamp writes it. */
export function postmarkDate(date: Date): { day: string; month: string; year: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find((candidate) => candidate.type === type)?.value);
  return { day: String(part("day")), month: MONTHS[part("month") - 1] ?? "", year: String(part("year")) };
}

/** `14 SEP 2026`, the same as one string. */
export function postmarkText(date: Date): string {
  const { day, month, year } = postmarkDate(date);
  return `${day} ${month} ${year}`;
}
