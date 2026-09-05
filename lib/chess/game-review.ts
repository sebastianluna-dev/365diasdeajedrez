import type { MoveEvaluation } from "./pgn-tree";

// Las cuentas de la evaluación de una partida: precisión de cada jugador, qué
// jugadas fueron imprecisiones, errores o errores graves, cuánto se perdió de
// media y por dónde pasa la partida de apertura a medio juego y a final.
//
// Módulo puro: entra la evaluación de cada posición y sale lo que se pinta. El
// motor, el PGN y React quedan fuera.
//
// Las fórmulas son las de Lichess, que son las que la gente reconoce: una
// precisión del 88 % tiene que querer decir lo mismo aquí que allí o el número
// no sirve para comparar nada.

export type MoveQualityGrade = "good" | "inaccuracy" | "mistake" | "blunder";

export interface ReviewedPosition {
  fen: string;
  /** Lo que puntuó el módulo. Sin ella, esa jugada no entra en las cuentas. */
  evaluation?: MoveEvaluation;
}

export interface ReviewedMove {
  /** Ply 1-based: la jugada que lleva de la posición anterior a ésta. */
  ply: number;
  color: "white" | "black";
  /** Cuánto empeoró su posición, en puntos de probabilidad de victoria. */
  lost: number;
  /** Lo mismo en centipeones, que es como se dice de toda la vida. */
  centipawnLoss: number;
  quality: MoveQualityGrade;
}

export interface PlayerReview {
  /** 0 a 100. Es una media de la precisión de cada jugada suya. */
  accuracy: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  /** Pérdida media en centipeones. */
  averageLoss: number;
}

export interface GameReview {
  moves: ReviewedMove[];
  white: PlayerReview;
  black: PlayerReview;
  /** En qué ply empieza cada fase, para las etiquetas de la gráfica. */
  phases: { middlegame: number; endgame: number };
}

/**
 * De la ventaja en peones a la probabilidad de ganar, de 0 a 100.
 *
 * Es la conversión que hace comparables dos posiciones: pasar de +0,2 a +0,9 no
 * cambia gran cosa, y pasar de +0,2 a −0,5 sí, aunque la diferencia en peones
 * sea parecida. La constante es la de Lichess.
 */
export function winPercent(score: number): number {
  const centipawns = Math.max(-1000, Math.min(1000, score * 100));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

/**
 * La precisión de UNA jugada, a partir de lo que cayó la probabilidad de ganar
 * de quien la hizo. También de Lichess.
 */
export function moveAccuracy(lost: number): number {
  const accuracy = 103.1668 * Math.exp(-0.04354 * Math.max(0, lost)) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

/** Los cortes de siempre, en puntos de probabilidad de victoria perdidos. */
function gradeOf(lost: number): MoveQualityGrade {
  if (lost >= 30) return "blunder";
  if (lost >= 20) return "mistake";
  if (lost >= 10) return "inaccuracy";
  return "good";
}

/** El material que no son peones, para saber cuándo empieza el final. */
function nonPawnMaterial(fen: string): number {
  const value: Record<string, number> = { q: 9, r: 5, b: 3, n: 3 };
  let total = 0;
  for (const letter of fen.split(" ")[0] ?? "") {
    total += value[letter.toLowerCase()] ?? 0;
  }
  return total;
}

/**
 * Dónde deja de ser apertura y dónde empieza el final.
 *
 * El final se reconoce por el material —trece puntos sin contar peones es el
 * corte habitual— y el medio juego, a falta de un libro de aperturas, por la
 * jugada 11, que es donde una partida normal ya está fuera de la teoría que
 * este producto enseña.
 */
function phasesOf(positions: ReviewedPosition[]): { middlegame: number; endgame: number } {
  const endgame = positions.findIndex((position) => nonPawnMaterial(position.fen) <= 13);
  const lastPly = positions.length - 1;

  return {
    endgame: endgame === -1 ? lastPly : endgame,
    middlegame: Math.min(20, endgame === -1 ? lastPly : endgame),
  };
}

function summarize(moves: ReviewedMove[], accuracies: number[]): PlayerReview {
  if (moves.length === 0) {
    return { accuracy: 100, inaccuracies: 0, mistakes: 0, blunders: 0, averageLoss: 0 };
  }

  const total = accuracies.reduce((sum, value) => sum + value, 0);
  const loss = moves.reduce((sum, move) => sum + move.centipawnLoss, 0);

  return {
    accuracy: Math.round(total / accuracies.length),
    inaccuracies: moves.filter((move) => move.quality === "inaccuracy").length,
    mistakes: moves.filter((move) => move.quality === "mistake").length,
    blunders: moves.filter((move) => move.quality === "blunder").length,
    averageLoss: Math.round(loss / moves.length),
  };
}

/**
 * Repasa la partida a partir de la evaluación de cada posición.
 *
 * `positions[0]` es la posición de partida y cada siguiente es la que deja una
 * jugada. Devuelve null si no hay ni una jugada evaluada: sin eso no hay nada
 * que contar y es mejor decirlo que enseñar un 100 % de precisión falso.
 */
export function reviewGame(positions: ReviewedPosition[]): GameReview | null {
  const moves: ReviewedMove[] = [];
  const accuracies: Record<"white" | "black", number[]> = { white: [], black: [] };

  for (let index = 1; index < positions.length; index += 1) {
    const before = positions[index - 1].evaluation;
    const after = positions[index].evaluation;
    if (!before || !after) continue;

    // Todo se mide desde el punto de vista de QUIEN MOVIÓ: perder medio peón es
    // lo mismo se juegue con blancas o con negras.
    const color = index % 2 === 1 ? "white" : "black";
    const sign = color === "white" ? 1 : -1;
    const lost = Math.max(0, sign * (winPercent(before.score) - winPercent(after.score)));
    const centipawnLoss = Math.max(0, Math.round(sign * (before.score - after.score) * 100));

    moves.push({ ply: index, color, lost, centipawnLoss, quality: gradeOf(lost) });
    accuracies[color].push(moveAccuracy(lost));
  }

  if (moves.length === 0) return null;

  return {
    moves,
    white: summarize(
      moves.filter((move) => move.color === "white"),
      accuracies.white,
    ),
    black: summarize(
      moves.filter((move) => move.color === "black"),
      accuracies.black,
    ),
    phases: phasesOf(positions),
  };
}
