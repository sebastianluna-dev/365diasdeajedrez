import { parsePgnTree } from "./pgn-tree";

// La línea principal de un PGN, que es lo único que se entrena de memoria.
//
// Las variantes y subvariantes siguen existiendo dentro del PGN y el modo
// estudiar las recorre enteras; el repaso NO las evalúa. Por eso «una lección
// entrenable» es UNA línea y no un conjunto de caminos raíz-hoja: encaja en el
// TrainingExercise que ya existe sin inventar una tabla de líneas.
//
// Módulo puro: sólo reutiliza el árbol de pgn-tree.ts.

export interface MainlineResult {
  /** SAN de la línea principal, en orden. */
  sans: string[];
  /** FEN de partida del PGN, o null si arranca en la posición inicial. */
  initialFen: string | null;
}

/** Posición de partida estándar, para no guardar un FEN que no aporta nada. */
const STANDARD_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Desde qué posición arranca un PGN, o `null` si es la de partida.
 *
 * A diferencia de `extractMainline`, esto responde también cuando el PGN NO
 * TIENE JUGADAS: un diagrama suelto —cabeceras y nada más— es contenido
 * legítimo de una lección, y de hecho es lo que son casi todas las del curso de
 * Kotov. Quien sólo necesita la posición no debería quedarse sin respuesta por
 * no haber una línea que entrenar.
 */
export function startFenOf(pgn: string): string | null {
  const initialFen = parsePgnTree(pgn)?.initialFen;
  if (!initialFen || initialFen === STANDARD_START) return null;
  return initialFen;
}

/**
 * Recorre `children[0]` desde la raíz, que es por convención la línea principal
 * —y es lo que da por hecho `makePgn` al serializar—.
 *
 * Devuelve null si el PGN no se puede leer o no tiene ninguna jugada: una
 * lección así no se puede entrenar, y es mejor decirlo que derivar un ejercicio
 * vacío que el entrenador rechazaría después.
 */
export function extractMainline(pgn: string): MainlineResult | null {
  const tree = parsePgnTree(pgn);
  if (!tree) return null;

  const sans: string[] = [];
  let children = tree.children;
  while (children.length > 0) {
    sans.push(children[0].san);
    children = children[0].children;
  }

  if (sans.length === 0) return null;

  return {
    sans,
    initialFen: tree.initialFen === STANDARD_START ? null : tree.initialFen,
  };
}
