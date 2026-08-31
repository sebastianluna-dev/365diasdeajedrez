// Topes del contenido ajedrecístico, compartidos por la importación de partidas
// del alumno y por el editor de lecciones del staff: el mismo dato (un PGN) no
// puede tener dos límites según quién lo escriba.

/** Un archivo PGN de torneo puede traer miles de partidas: 2 MB de techo. */
export const PGN_MAX_LENGTH = 2_000_000;

/** Partidas que se aceptan de una sola importación. */
export const PGN_MAX_GAMES = 500;
