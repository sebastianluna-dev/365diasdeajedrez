import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { formatDateTimeLocal } from "@/lib/timezone";

// One way to say WHEN a class is, in a given zone: «mié 14 oct · 12:00–13:00»,
// «Hoy · 12:00–13:00», «Mañana · …», «Ayer · …», the year only when it is not
// the current one, and «(hora de Ciudad de México)» when the reader needs to be
// told the zone. The agenda's day headings («Hoy · miércoles 14 de octubre»)
// come from the same tables, so the module has no second spelling of a weekday.
//
// Own tables of days and months, not the ICU's: the abbreviations Spanish
// writes («mié», «sáb») are not the ones `Intl` gives in every environment.
// The parts come from `formatDateTimeLocal`, in the zone.

const WEEKDAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;
const WEEKDAYS_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"] as const;
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/** What a zone is called when the reader is told it; the academy's by name, the rest by their id. */
const ZONE_NAMES: Record<string, string> = {
  [STUDY_DAY_TIMEZONE]: "hora de Ciudad de México",
};

export function timeZoneLabel(timeZone: string): string {
  return ZONE_NAMES[timeZone] ?? `hora de ${timeZone.replace(/_/g, " ")}`;
}

interface LocalParts {
  key: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  time: string;
}

function localParts(date: Date, timeZone: string): LocalParts {
  const local = formatDateTimeLocal(date, timeZone);
  const key = local.slice(0, 10);
  const [year = 0, month = 0, day = 0] = key.split("-").map(Number);
  // The weekday of a calendar date does not depend on the zone once the date is known.
  return { key, year, month, day, weekday: new Date(`${key}T00:00:00.000Z`).getUTCDay(), time: local.slice(11, 16) };
}

function shiftKey(key: string, days: number): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** «Hoy», «Mañana» or «Ayer» for a day next to today's, else null. */
function relativeDay(key: string, todayKey: string): string | null {
  if (key === todayKey) return "Hoy";
  if (key === shiftKey(todayKey, 1)) return "Mañana";
  if (key === shiftKey(todayKey, -1)) return "Ayer";
  return null;
}

export interface ClassWhenInput {
  start: Date;
  durationMin: number;
  timeZone: string;
  now: Date;
  /** Append the zone's name: «(hora de Ciudad de México)». */
  withZone?: boolean;
}

/** «mié 14 oct · 12:00–13:00», with «Hoy», «Mañana», «Ayer», the year when it differs, and the zone if asked. */
export function formatClassWhen({ start, durationMin, timeZone, now, withZone = false }: ClassWhenInput): string {
  const from = localParts(start, timeZone);
  const to = localParts(new Date(start.getTime() + durationMin * 60 * 1000), timeZone);
  const today = localParts(now, timeZone);

  const relative = relativeDay(from.key, today.key);
  const year = from.year === today.year ? "" : ` ${from.year}`;
  const day = relative ?? `${WEEKDAYS_SHORT[from.weekday]} ${from.day} ${MONTHS_SHORT[from.month - 1]}${year}`;
  const zone = withZone ? ` (${timeZoneLabel(timeZone)})` : "";
  return `${day} · ${from.time}–${to.time}${zone}`;
}

/** Only the hours: «12:00–13:00». */
export function formatClassHours(start: Date, durationMin: number, timeZone: string): string {
  const from = localParts(start, timeZone);
  const to = localParts(new Date(start.getTime() + durationMin * 60 * 1000), timeZone);
  return `${from.time}–${to.time}`;
}

/**
 * The heading of a day in an agenda, from its "yyyy-mm-dd" key and today's:
 * «Hoy · miércoles 14 de octubre», «Mañana · jueves 15 de octubre»,
 * «Sábado 17 de octubre», and the year when it is not the current one.
 */
export function formatAgendaDay(dayKey: string, todayKey: string): string {
  const [year = 0, month = 0, day = 0] = dayKey.split("-").map(Number);
  const [todayYear = 0] = todayKey.split("-").map(Number);
  const weekday = WEEKDAYS_LONG[new Date(`${dayKey}T00:00:00.000Z`).getUTCDay()] ?? "";
  const date = `${weekday} ${day} de ${MONTHS_LONG[month - 1]}${year === todayYear ? "" : ` de ${year}`}`;
  const relative = relativeDay(dayKey, todayKey);
  if (relative) return `${relative} · ${date}`;
  return date.charAt(0).toUpperCase() + date.slice(1);
}

/** «mié 14 oct», for a date tile or a short reference, with the year when it differs. */
export function formatClassDay(date: Date, timeZone: string, now: Date): string {
  const parts = localParts(date, timeZone);
  const today = localParts(now, timeZone);
  const year = parts.year === today.year ? "" : ` ${parts.year}`;
  return `${WEEKDAYS_SHORT[parts.weekday]} ${parts.day} ${MONTHS_SHORT[parts.month - 1]}${year}`;
}

/** The three words of a date tile: «mié», 14, «oct», in the zone. */
export function classDayParts(date: Date, timeZone: string): { weekday: string; day: number; month: string } {
  const parts = localParts(date, timeZone);
  return { weekday: WEEKDAYS_SHORT[parts.weekday] ?? "", day: parts.day, month: MONTHS_SHORT[parts.month - 1] ?? "" };
}
