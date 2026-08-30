// Rangos de calendario para las estadísticas del alumno: «esta semana» es la
// semana en curso (desde el lunes), no los últimos siete días.

export type StatsRangeKey = "week" | "month" | "year" | "all";

/** Fecha UTC a medianoche: el bucket diario de UserStatDaily. */
export function toUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Primer día (inclusive) del rango de calendario, o null para «todo el
 * tiempo». La semana empieza en lunes, como es costumbre en España y
 * Latinoamérica.
 */
export function rangeStart(range: StatsRangeKey, now: Date): Date | null {
  const today = toUtcDay(now);

  switch (range) {
    case "week": {
      // getUTCDay(): 0 = domingo. Se retrocede hasta el lunes anterior.
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
