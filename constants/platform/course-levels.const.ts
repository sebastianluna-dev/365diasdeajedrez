// Copy and limits of the course levels, shared by the student's pages and the
// staff panel. The levels themselves are rows the staff edits, not constants.

/** Said wherever an Elo range is shown: the range guides, it does not decide. */
export const ELO_DISCLAIMER = "El Elo es orientativo; revisa los conocimientos previos recomendados";

/**
 * What the ranges are, for whoever edits them: an internal classification, not
 * an official one, and «Maestro» names how hard the content is, not a title.
 */
export const LEVEL_CATALOG_NOTE =
  "Los rangos son una clasificación interna orientativa: no son categorías oficiales ni equivalencias entre FIDE, " +
  "Chess.com y Lichess. «Maestro» describe la dificultad del contenido y no acredita un título. Un jugador sin " +
  "rating puede pertenecer a cualquier nivel según sus conocimientos, y ningún curso se restringe por Elo.";

/** No rating system goes this high; above it a number is a typo. */
export const ELO_MAX = 4000;
