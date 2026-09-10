import type { ReviewedPosition } from "@/lib/chess/game-review";
import type { MoveEvaluation, PgnTree } from "@/lib/chess/pgn-tree";

/**
 * The main-line positions with their evaluation, which is what `reviewGame`
 * and the chart consume.
 *
 * The first one is the starting position: a move is judged by what changes
 * between the previous position and its own, so without it the first move
 * could not be measured.
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

/** The dotted paths of that same line, in the same order. */
export function mainlinePaths(tree: PgnTree): string[] {
  const paths: string[] = [""];

  let node = tree.children[0];
  while (node) {
    paths.push(node.path);
    node = node.children[0];
  }
  return paths;
}

/** The evaluations, only if ALL of them are there: half a chart would mislead. */
export function mainlineEvaluations(tree: PgnTree): MoveEvaluation[] | null {
  const positions = mainlinePositions(tree);
  if (positions.length < 2) return null;

  const evaluations = positions.map((position) => position.evaluation);
  return evaluations.every((evaluation): evaluation is MoveEvaluation => evaluation !== undefined)
    ? evaluations
    : null;
}
