// Zonas horarias IANA ofrecidas en el perfil del profesor. Lista corta a
// propósito (las de la academia y su alumnado); el campo admite cualquier zona
// válida en base de datos, así que ampliarla es sólo añadir entradas aquí.

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
 * La zona en la que empieza y acaba el DÍA DE ESTUDIO: la racha y los minutos
 * de hoy se cortan aquí.
 *
 * Es una constante y no un dato del alumno porque hoy no se le pregunta su zona
 * (sólo el profesor tiene la suya, para programar clases). En UTC el día
 * cambiaría a las seis de la tarde en México, y ver la racha reiniciarse
 * mientras se cena es peor que la imprecisión de quien estudia desde otro huso.
 * Cuando el alumno tenga zona propia, esto pasa a ser su valor por defecto.
 */
export const STUDY_DAY_TIMEZONE = "America/Mexico_City";
