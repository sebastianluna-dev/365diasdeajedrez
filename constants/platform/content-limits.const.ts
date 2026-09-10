// Topes del contenido ajedrecístico, compartidos por la importación de partidas
// del alumno y por el editor de lecciones del staff: el mismo dato (un PGN) no
// puede tener dos límites según quién lo escriba.

/** Un archivo PGN de torneo puede traer miles de partidas: 2 MB de techo. */
export const PGN_MAX_LENGTH = 2_000_000;

/** Partidas que se aceptan de una sola importación. */
export const PGN_MAX_GAMES = 500;

/**
 * Opciones de la transacción que guarda e indexa una importación. Por defecto
 * Prisma corta una transacción interactiva a los 5 s, y quinientas partidas son
 * unos mil quinientos viajes a la base (un `create` más el borrado y la
 * inserción de ~80 posiciones por partida): el PGN de torneo que el tope de
 * arriba contempla revienta con P2028 y se revierte entero. Dos minutos cubren
 * ese caso con margen; `maxWait` es cuánto se espera a que haya conexión.
 */
export const PGN_IMPORT_TRANSACTION = { maxWait: 5_000, timeout: 120_000 } as const;
