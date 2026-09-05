import type { ReviewedPosition } from "@/lib/chess/game-review";
import type { MoveEvaluation, PgnTree } from "@/lib/chess/pgn-tree";

/**
 * Las posiciones de la línea principal con su evaluación, que es lo que comen
 * `reviewGame` y la gráfica.
 *
 * La primera es la de partida: una jugada se juzga por lo que cambia entre la
 * posición anterior y la suya, así que sin ella la primera jugada no se podría
 * medir.
 */
export function mainlinePositions(tree: PgnTree): ReviewedPosition[] {
  const positions: ReviewedPosition[] = [{ fen: tree.initialFen, evaluation: tree.initialEvaluation }];

  let node = tree.children[0];
  while (node) {
    positions.push({ fen: node.fen, evaluation: node.evaluation });
    node = node.children[0];
  }
  return positions;
}

/** Las rutas punteadas de esa misma línea, en el mismo orden. */
export function mainlinePaths(tree: PgnTree): string[] {
  const paths: string[] = [""];

  let node = tree.children[0];
  while (node) {
    paths.push(node.path);
    node = node.children[0];
  }
  return paths;
}

/** Las evaluaciones, sólo si están TODAS: media gráfica engañaría. */
export function mainlineEvaluations(tree: PgnTree): MoveEvaluation[] | null {
  const positions = mainlinePositions(tree);
  if (positions.length < 2) return null;

  const evaluations = positions.map((position) => position.evaluation);
  return evaluations.every((evaluation): evaluation is MoveEvaluation => evaluation !== undefined)
    ? evaluations
    : null;
}
