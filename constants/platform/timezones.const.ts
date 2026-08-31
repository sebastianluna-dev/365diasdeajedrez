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
