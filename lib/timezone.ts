// Conversión entre un instante (UTC, como se guarda) y la hora de pared de una
// zona IANA, que es lo que teclea y lee una persona en un
// `<input type="datetime-local">`.
//
// Las clases se guardan en UTC y el profesor las programa en SU zona
// (`Teacher.timezone`); sin esto, «lunes a las 18:00» se guardaría desplazado.
// Se resuelve con `Intl` —presente en Node y en el navegador— en vez de añadir
// una dependencia de fechas.

/** Formato de `<input type="datetime-local">`: "YYYY-MM-DDTHH:mm". */
const DATETIME_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClockIn(date: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes): number =>
    Number.parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

/**
 * Desfase de la zona en ese instante, en milisegundos (positivo al este). Lo
 * comparte `lib/study-streak.ts`, que necesita el mismo cálculo para la
 * medianoche del día de estudio.
 */
export function offsetMsAt(date: Date, timeZone: string): number {
  const wall = wallClockIn(date, timeZone);
  const asIfUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  return asIfUtc - date.getTime();
}

/** Instante → "YYYY-MM-DDTHH:mm" en la zona indicada, listo para el input. */
export function formatDateTimeLocal(date: Date, timeZone: string): string {
  const wall = wallClockIn(date, timeZone);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`;
}

/**
 * "YYYY-MM-DDTHH:mm" en una zona → instante UTC, o null si no es una fecha
 * válida. Se aplica el desfase dos veces porque el propio desfase depende del
 * instante: en un cambio de horario de verano, la primera estimación puede caer
 * al otro lado del salto.
 */
export function parseDateTimeLocal(value: string, timeZone: string): Date | null {
  const match = DATETIME_LOCAL.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);

  const firstGuess = new Date(asIfUtc - offsetMsAt(new Date(asIfUtc), timeZone));
  const instant = new Date(asIfUtc - offsetMsAt(firstGuess, timeZone));
  if (Number.isNaN(instant.getTime())) return null;

  // Fechas imposibles ("2026-02-31") se normalizarían en silencio: se rechazan.
  const wall = wallClockIn(instant, timeZone);
  const roundTrips = wall.year === year && wall.month === month && wall.day === day;
  return roundTrips ? instant : null;
}

/** Zona válida para `Intl`, o UTC como respaldo documentado. */
export function safeTimeZone(timeZone: string | null | undefined): string {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}
