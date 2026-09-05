// La racha diaria: cuántos días seguidos ha estudiado el alumno.
//
// Módulo puro, sin base de datos ni fechas del sistema, porque una racha es
// exactamente el tipo de cuenta que se rompe en los bordes —el cambio de mes,
// el año bisiesto, el cambio de hora, el día que aún no ha terminado— y
// comprobarla no debería exigir esperar a mañana.
//
// Los días se manejan como claves «aaaa-mm-dd» en la zona del día de estudio
// (STUDY_DAY_TIMEZONE), no en UTC: la racha es lo único que el alumno ve
// cambiar al filo de la medianoche, y en UTC su medianoche sería la tarde.

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * La clave del día al que pertenece un instante, en la zona que se le pase.
 *
 * `en-CA` porque su formato de fecha corto ES «aaaa-mm-dd»; se usa el
 * formateador y no aritmética de horas para que los cambios de horario de
 * verano los resuelva `Intl` y no este archivo.
 */
export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Cuánto va la zona por delante (+) o por detrás (−) de UTC en ese instante. */
function offsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const value = (type: Intl.DateTimeFormatPartTypes): number =>
    Number.parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);

  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
  return asUtc - instant.getTime();
}

/**
 * El instante en que empieza un día, para acotar consultas: la medianoche de
 * esa fecha EN esa zona, expresada en UTC, que es como se guardan las fechas.
 *
 * El desfase se mide al mediodía y no a medianoche: en la noche del cambio de
 * hora, la medianoche puede no existir o existir dos veces, y el mediodía
 * siempre cae limpiamente dentro del día que se pregunta.
 */
export function startOfDay(key: string, timeZone: string): Date {
  const midday = new Date(`${key}T12:00:00.000Z`);
  return new Date(Date.parse(`${key}T00:00:00.000Z`) - offsetMs(midday, timeZone));
}

/**
 * El día anterior a una clave.
 *
 * Aritmética sobre la clave, sin zona: «el día antes del 1 de marzo» es el 28 o
 * el 29 de febrero mire quien lo mire, y meter husos aquí sólo añadiría un sitio
 * más donde equivocarse.
 */
function previousDay(key: string): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) - DAY_MS).toISOString().slice(0, 10);
}

/**
 * Días seguidos de estudio contando hacia atrás desde hoy.
 *
 * El día de HOY no cuenta para romperla: quien estudió ayer y todavía no ha
 * empezado hoy sigue teniendo su racha —el día no ha terminado—. Si hubiera que
 * estudiar antes de mirar la pantalla, la racha se vería rota cada mañana, que
 * es justo lo contrario de lo que anima a seguir.
 *
 * Por eso la cuenta arranca en hoy si hay actividad hoy y, si no, en ayer. Si
 * tampoco hay nada ayer, la racha es cero: dos días sin estudiar sí la rompen.
 *
 * @param activeDays días con actividad, en claves «aaaa-mm-dd»; se admiten
 *   repetidos y desordenados.
 * @param today la clave del día en curso.
 */
export function streakLength(activeDays: Iterable<string>, today: string): number {
  const days = activeDays instanceof Set ? activeDays : new Set(activeDays);
  if (days.size === 0) return 0;

  let cursor = days.has(today) ? today : previousDay(today);
  let length = 0;
  while (days.has(cursor)) {
    length += 1;
    cursor = previousDay(cursor);
  }
  return length;
}
