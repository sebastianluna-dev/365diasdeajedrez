// The words «Estadísticas» writes around its figures: a number as Mexico
// writes it, a plural, a short date, and how each period is named in a
// sentence. Pure, so the tabs share them.

import { MONTHS_ES } from "@/lib/format-spanish-date";
import type { StatsPeriod } from "@/lib/stats-period";

/** «1,250»: a count as es-MX writes it. */
export function formatCount(value: number): string {
  return value.toLocaleString("es-MX");
}

/** «1 día», «12 días». */
export function plural(count: number, one: string, many: string): string {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

/** «13 oct», from a "yyyy-mm-dd" key. */
export function shortDayLabel(key: string): string {
  return `${Number(key.slice(8, 10))} ${(MONTHS_ES[Number(key.slice(5, 7)) - 1] ?? "").slice(0, 3)}`;
}

/** The period inside a sentence: «este mes», «esta semana», «este año», «en total». */
export function periodPhrase(key: StatsPeriod["key"]): string {
  return { semana: "esta semana", mes: "este mes", anio: "este año", todo: "en total" }[key];
}

/** Over the hero's figure: «en octubre», «esta semana», «en 2026», «en total». */
export function periodOver(period: StatsPeriod): string {
  switch (period.key) {
    case "mes":
      return `en ${MONTHS_ES[Number(period.range.to.slice(5, 7)) - 1] ?? ""}`;
    case "anio":
      return `en ${period.range.to.slice(0, 4)}`;
    case "semana":
      return "esta semana";
    case "todo":
      return "en total";
  }
}

/** Under a figure of «Lo que hiciste», the whole period before: «sep», «2025», «antes». */
export function previousShort(period: StatsPeriod): string {
  if (!period.previous) return "";
  if (period.key === "mes") return period.previous.name.slice(0, 3);
  if (period.key === "anio") return period.previous.name;
  return "antes";
}
