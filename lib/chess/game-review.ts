import type { MoveEvaluation } from "./pgn-tree";

// The arithmetic of a game review: each player's accuracy, which moves were
// inaccuracies, mistakes or blunders, how much was lost on average and where
// the game goes from opening to middlegame to endgame.
//
// Pure module: the evaluation of each position goes in and what is rendered
// comes out. The engine, the PGN and React stay outside.
//
// The formulas are Lichess's, which are the ones people recognise: an accuracy
// of 88 % has to mean the same here as it does there or the number is no good
// for comparing anything.

export type MoveQualityGrade = "good" | "inaccuracy" | "mistake" | "blunder";

export interface ReviewedPosition {
  fen: string;
  /** What the engine scored. Without it, that move does not enter the arithmetic. */
  evaluation?: MoveEvaluation;
}

export interface ReviewedMove {
  /** 1-based ply: the move that leads from the previous position to this one. */
  ply: number;
  color: "white" | "black";
  /** How much their position worsened, in win-probability points. */
  lost: number;
  /** The same in centipawns, which is how it has always been said. */
  centipawnLoss: number;
  quality: MoveQualityGrade;
}

export interface PlayerReview {
  /** 0 to 100. It is an average of the accuracy of each of their moves. */
  accuracy: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  /** Average loss in centipawns. */
  averageLoss: number;
}

export interface GameReview {
  moves: ReviewedMove[];
  white: PlayerReview;
  black: PlayerReview;
  /** At which ply each phase starts, for the chart labels. */
  phases: { middlegame: number; endgame: number };
}

/**
 * From the advantage in pawns to the win probability, from 0 to 100.
 *
 * It is the conversion that makes two positions comparable: going from +0.2 to
 * +0.9 does not change much, and going from +0.2 to −0.5 does, even though the
 * difference in pawns is similar. The constant is Lichess's.
 */
export function winPercent(score: number): number {
  const centipawns = Math.max(-1000, Math.min(1000, score * 100));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

/**
 * The accuracy of ONE move, from how far the win probability of whoever played
 * it dropped. Also from Lichess.
 */
export function moveAccuracy(lost: number): number {
  const accuracy = 103.1668 * Math.exp(-0.04354 * Math.max(0, lost)) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

/** The usual cutoffs, in win-probability points lost. */
function gradeOf(lost: number): MoveQualityGrade {
  if (lost >= 30) return "blunder";
  if (lost >= 20) return "mistake";
  if (lost >= 10) return "inaccuracy";
  return "good";
}

/** Non-pawn material, to know when the endgame begins. */
function nonPawnMaterial(fen: string): number {
  const value: Record<string, number> = { q: 9, r: 5, b: 3, n: 3 };
  let total = 0;
  for (const letter of fen.split(" ")[0] ?? "") {
    total += value[letter.toLowerCase()] ?? 0;
  }
  return total;
}

/**
 * Where it stops being the opening and where the endgame begins.
 *
 * The endgame is recognised by the material — thirteen points not counting
 * pawns is the usual cutoff — and the middlegame, lacking an opening book, by
 * move 11, which is where a normal game is already out of the theory this
 * product teaches.
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
 * Reviews the game from the evaluation of each position.
 *
 * `positions[0]` is the starting position and each following one is what a move
 * leaves behind. Returns null if there is not a single evaluated move: without
 * that there is nothing to tell and it is better to say so than to show a false
 * 100 % accuracy.
 */
export function reviewGame(positions: ReviewedPosition[]): GameReview | null {
  const moves: ReviewedMove[] = [];
  const accuracies: Record<"white" | "black", number[]> = { white: [], black: [] };

  for (let index = 1; index < positions.length; index += 1) {
    const before = positions[index - 1].evaluation;
    const after = positions[index].evaluation;
    if (!before || !after) continue;

    // Everything is measured from the point of view of WHOEVER MOVED: losing half a
    // pawn is the same whether playing White or Black.
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
