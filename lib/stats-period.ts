// The periods of «Estadísticas» (`/perfil/estadisticas?periodo=…`): this
// week, this month, this year and all the time, the same four calendar
// ranges as the dashboard's (lib/date-ranges.ts), and the period before each
// one to compare with.
//
// Pure, as lib/study-minutes.ts is: the days are "yyyy-mm-dd" keys in the
// study day's time zone, so the turn of a month, of a year or a leap day are
// a test's to reach, not the calendar's.

import { MONTHS_ES } from "@/lib/format-spanish-date";
import { dayAfter, daysBetween, daysInMonthOf, monthStartOf, previousMonthStartOf } from "@/lib/study-minutes";
import { mondayOf } from "@/lib/study-streak";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The period as the address spells it. */
export type StatsPeriodKey = "semana" | "mes" | "anio" | "todo";

/** The four periods in the side column's order, with what the column says. */
export const STATS_PERIODS: readonly { key: StatsPeriodKey; label: string }[] = [
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "anio", label: "Este año" },
  { key: "todo", label: "Todo el tiempo" },
];

/** The period the page opens on: the month, as the owner's design draws it. */
export const DEFAULT_STATS_PERIOD: StatsPeriodKey = "mes";

/** The period an address asks for; anything else is the default. */
export function parseStatsPeriod(value: string | undefined): StatsPeriodKey {
  return STATS_PERIODS.some((period) => period.key === value) ? (value as StatsPeriodKey) : DEFAULT_STATS_PERIOD;
}

/** How the period's minutes are grouped into columns: a day each, a month each, or a year each. */
export type StatsBucket = "day" | "month" | "year";

/** A run of days, both ends included. */
export interface DayRange {
  from: string;
  to: string;
}

export interface StatsPeriod {
  key: StatsPeriodKey;
  /** From its first day to today. */
  range: DayRange;
  /**
   * The period before, whole (last week, last month, last year) and up to
   * the same point («a estas alturas»); none for all the time.
   */
  previous: { whole: DayRange; sameSoFar: DayRange; name: string } | null;
  bucket: StatsBucket;
  /** «Del 1 al 25 de octubre», under the page's title. */
  label: string;
  /** «1–25 oct», beside the period in the side column. */
  shortLabel: string;
}

const shift = (key: string, days: number) =>
  new Date(Date.parse(`${key}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
const dayOf = (key: string) => Number(key.slice(8, 10));
const monthOf = (key: string) => MONTHS_ES[Number(key.slice(5, 7)) - 1] ?? "";
const yearOf = (key: string) => key.slice(0, 4);
const shortMonth = (key: string) => monthOf(key).slice(0, 3);

/** «Del 1 al 25 de octubre», «Del 28 de septiembre al 4 de octubre», «Del 30 de diciembre de 2025 al 3 de enero». */
export function rangeLabel({ from, to }: DayRange): string {
  if (from === to) return `El ${dayOf(to)} de ${monthOf(to)}`;
  const sameYear = yearOf(from) === yearOf(to);
  const sameMonth = sameYear && from.slice(0, 7) === to.slice(0, 7);
  const start = sameMonth
    ? `${dayOf(from)}`
    : `${dayOf(from)} de ${monthOf(from)}${sameYear ? "" : ` de ${yearOf(from)}`}`;
  return `Del ${start} al ${dayOf(to)} de ${monthOf(to)}`;
}

/** «1–25 oct», «28 sep–4 oct». */
export function shortRangeLabel({ from, to }: DayRange): string {
  if (from === to) return `${dayOf(to)} ${shortMonth(to)}`;
  return from.slice(0, 7) === to.slice(0, 7)
    ? `${dayOf(from)}–${dayOf(to)} ${shortMonth(to)}`
    : `${dayOf(from)} ${shortMonth(from)}–${dayOf(to)} ${shortMonth(to)}`;
}

/** Months from the one `from` is in to the one `to` is in, both included. */
function monthsBetween(from: string, to: string): number {
  return (Number(yearOf(to)) - Number(yearOf(from))) * 12 + Number(to.slice(5, 7)) - Number(from.slice(5, 7)) + 1;
}

/**
 * The period of `key` on the study day `today`. `firstDay` is the day the
 * person's account was opened, where «Todo el tiempo» starts; a period that
 * would start before it starts there too, so no column stands for a day
 * nobody could study.
 */
export function statsPeriodOf(key: StatsPeriodKey, today: string, firstDay: string): StatsPeriod {
  const clamp = (from: string) => (from < firstDay && firstDay <= today ? firstDay : from);
  switch (key) {
    case "semana": {
      const monday = mondayOf(today);
      const elapsed = Math.round((Date.parse(today) - Date.parse(monday)) / DAY_MS);
      const lastMonday = shift(monday, -7);
      const range = { from: clamp(monday), to: today };
      return {
        key,
        range,
        previous: {
          whole: { from: lastMonday, to: shift(monday, -1) },
          sameSoFar: { from: lastMonday, to: shift(lastMonday, elapsed) },
          name: "la semana pasada",
        },
        bucket: "day",
        label: rangeLabel(range),
        shortLabel: shortRangeLabel(range),
      };
    }
    case "mes": {
      const start = monthStartOf(today);
      const lastStart = previousMonthStartOf(today);
      const lastEnd = shift(start, -1);
      const sameDay = Math.min(dayOf(today), daysInMonthOf(lastStart));
      const range = { from: clamp(start), to: today };
      return {
        key,
        range,
        previous: {
          whole: { from: lastStart, to: lastEnd },
          sameSoFar: { from: lastStart, to: `${lastStart.slice(0, 8)}${String(sameDay).padStart(2, "0")}` },
          name: monthOf(lastStart),
        },
        bucket: "day",
        label: rangeLabel(range),
        shortLabel: shortRangeLabel(range),
      };
    }
    case "anio": {
      const year = Number(yearOf(today));
      const start = `${year}-01-01`;
      const lastStart = `${year - 1}-01-01`;
      // The same day of the year before; the 29th of February of a leap year falls back to the 28th.
      const sameDay = today.slice(5) === "02-29" ? `${year - 1}-02-28` : `${year - 1}${today.slice(4)}`;
      const range = { from: clamp(start), to: today };
      return {
        key,
        range,
        previous: {
          whole: { from: lastStart, to: `${year - 1}-12-31` },
          sameSoFar: { from: lastStart, to: sameDay },
          name: String(year - 1),
        },
        bucket: "month",
        label: rangeLabel(range),
        shortLabel: String(year),
      };
    }
    case "todo": {
      const range = { from: firstDay <= today ? firstDay : today, to: today };
      return {
        key,
        range,
        previous: null,
        bucket: monthsBetween(range.from, range.to) > 24 ? "year" : "month",
        label: `Desde el ${dayOf(range.from)} de ${monthOf(range.from)} de ${yearOf(range.from)}`,
        shortLabel: `desde ${yearOf(range.from)}`,
      };
    }
  }
}

/** A column of the period's chart: a day, a month or a year, with what it adds up to. */
export interface StatsBucketColumn {
  /** Its first day. */
  key: string;
  /** Under the column: «12», «oct», «2025». */
  axis: string;
  /** What a screen reader says for it: «domingo 25», «octubre», «2025». */
  long: string;
  value: number;
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const SHORT_WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

/**
 * The period's days folded into its columns, oldest first: a day each for
 * the week and the month, a month each for the year (every month up to
 * today's, empty ones included) and a month or a year each for all the time.
 * A day of the period without a value is a zero.
 */
export function bucketColumns(
  period: Pick<StatsPeriod, "key" | "range" | "bucket">,
  values: readonly { day: string; value: number }[],
): StatsBucketColumn[] {
  const byDay = new Map(values.map((entry) => [entry.day, entry.value]));
  const days = daysBetween(period.range.from, period.range.to);
  if (period.bucket === "day") {
    return days.map((day) => {
      const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
      return {
        key: day,
        axis: period.key === "semana" ? (SHORT_WEEKDAYS[weekday] ?? "") : String(dayOf(day)),
        long: `${WEEKDAYS[weekday]} ${dayOf(day)}`,
        value: byDay.get(day) ?? 0,
      };
    });
  }
  const columns = new Map<string, StatsBucketColumn>();
  for (const day of days) {
    const key = period.bucket === "month" ? monthStartOf(day) : `${yearOf(day)}-01-01`;
    const column = columns.get(key) ?? {
      key,
      axis: period.bucket === "month" ? shortMonth(key) : yearOf(key),
      long: period.bucket === "month" ? `${monthOf(key)} de ${yearOf(key)}` : yearOf(key),
      value: 0,
    };
    column.value += byDay.get(day) ?? 0;
    columns.set(key, column);
  }
  return [...columns.values()];
}

/** Whether a day is inside a range. */
export const inRange = (day: string, { from, to }: DayRange) => day >= from && day <= to;

/** The end, not included, of a range: the day after its last. */
export const rangeEnd = ({ to }: DayRange) => dayAfter(to);
