// Reading the `info` lines a UCI engine spits out.
//
// Pure module: the worker only passes text, and everything that has to be
// understood about it — who the score favours, how a mate reads, where the
// line ends — is decided and tested here.

export interface EngineInfo {
  /**
   * Which of the requested lines this is: 1 is the best. The engine omits it
   * when only one is asked for, so 1 is assumed in that case.
   */
  multipv: number;
  depth: number;
  /** Advantage in pawns, ALWAYS from White's point of view. */
  score: number;
  /** Moves to mate, in White's sign. `null` when there is no mate in sight. */
  mateIn: number | null;
  /** Principal variation in UCI ("e2e4 e7e5"), exactly as the engine gives it. */
  pv: string[];
}

/** How many half-moves of advantage fill the bar completely on a mate. */
const MATE_SCORE = 100;

/**
 * Reads an `info` line from the engine. Returns `null` when it is not one with
 * an evaluation — there are many routine ones, like `currmove` or `string`.
 *
 * The engine scores from the point of view of WHOEVER MOVES, so in a Black
 * position a `+1.2` means Black is better. Here it is normalised to White once
 * and for all, which is how a board is read: otherwise the bar would jump
 * sides on every move.
 */
export function parseEngineInfo(line: string, turn: "white" | "black"): EngineInfo | null {
  if (!line.startsWith("info ")) return null;

  const tokens = line.split(/\s+/);
  const depthAt = tokens.indexOf("depth");
  const scoreAt = tokens.indexOf("score");
  if (depthAt === -1 || scoreAt === -1) return null;

  const depth = Number(tokens[depthAt + 1]);
  const kind = tokens[scoreAt + 1];
  const value = Number(tokens[scoreAt + 2]);
  if (!Number.isFinite(depth) || !Number.isFinite(value)) return null;

  const multipvAt = tokens.indexOf("multipv");
  const multipv = multipvAt === -1 ? 1 : Number(tokens[multipvAt + 1]);
  if (!Number.isFinite(multipv) || multipv < 1) return null;

  const sign = turn === "white" ? 1 : -1;
  const pvAt = tokens.indexOf("pv");
  const pv = pvAt === -1 ? [] : tokens.slice(pvAt + 1).filter((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token));

  if (kind === "mate") {
    return { multipv, depth, score: sign * (value >= 0 ? MATE_SCORE : -MATE_SCORE), mateIn: sign * value, pv };
  }
  if (kind !== "cp") return null;

  return { multipv, depth, score: (sign * value) / 100, mateIn: null, pv };
}

/**
 * How full the bar is, from 0 (Black wins) to 1 (White wins).
 *
 * It is not linear on purpose: the difference between +0.3 and +1.0 shows in
 * the game, and between +7 and +9 it no longer does. The logistic curve
 * spends almost all of its travel in the range where the advantage is still
 * in dispute.
 */
export function evaluationBarFill(score: number): number {
  return 1 / (1 + Math.exp(-0.42 * score));
}

/**
 * The score as it is written on a board: "+1.4", "−0.7", "M3".
 *
 * It asks only for the two figures and not for a whole `EngineInfo` because
 * the same thing is written whether it comes from the live engine or from an
 * `[%eval]` stored in the PGN (`MoveEvaluation`), and both forms read alike.
 */
export function formatEvaluation(info: Pick<EngineInfo, "score" | "mateIn">): string {
  if (info.mateIn !== null) {
    const moves = Math.abs(info.mateIn);
    return `${info.mateIn >= 0 ? "+" : "−"}M${moves}`;
  }
  const rounded = Math.abs(info.score).toFixed(1);
  if (info.score > 0) return `+${rounded}`;
  if (info.score < 0) return `−${rounded}`;
  return "0.0";
}

/**
 * Numbers an engine line the way it would be written in a game: "18. Nd5 Qxb2
 * 19. Bxf7+".
 *
 * The number and the turn come from the FEN, not from the initial position:
 * the line starts where the board is, and without that a suggestion at move 30
 * would read as if it were the opening. When it is Black to move, the first
 * one carries the ellipsis that says its pair has already been played.
 */
export interface EngineLineToken {
  san: string;
  /** "18." or "18…" before the move, when it needs to be there. */
  number?: string;
}

/**
 * The same line, move by move, so each one can be rendered on its own — and
 * thus be pointed at with the mouse and have its position previewed.
 */
export function engineLineTokens(fen: string, sans: string[]): EngineLineToken[] {
  const fields = fen.split(" ");
  let moveNumber = Number(fields[5]);
  let whiteToMove = fields[1] !== "b";
  if (!Number.isFinite(moveNumber) || moveNumber < 1) moveNumber = 1;

  return sans.map((san, index) => {
    const number = whiteToMove ? `${moveNumber}.` : index === 0 ? `${moveNumber}…` : undefined;

    if (!whiteToMove) moveNumber += 1;
    whiteToMove = !whiteToMove;

    return { san, number };
  });
}

export function formatEngineLine(fen: string, sans: string[]): string {
  return engineLineTokens(fen, sans)
    .flatMap((token) => (token.number ? [token.number, token.san] : [token.san]))
    .join(" ");
}

/** The known continuations of a position, indexed by line number. */
export interface EngineLines {
  fen: string;
  byIndex: Record<number, EngineInfo>;
}

/**
 * Merges a freshly arrived evaluation into what is already known.
 *
 * The engine emits each line separately and each advances at its own pace, so
 * they are stored by index and the new one replaces its own. If the FEN is not
 * that of the accumulated data it starts from scratch: mixing lines from two
 * positions would leave an impossible suggestion on screen.
 */
export function mergeEngineLines(current: EngineLines | null, fen: string, info: EngineInfo): EngineLines {
  const byIndex = current?.fen === fen ? { ...current.byIndex } : {};
  byIndex[info.multipv] = info;
  return { fen, byIndex };
}

/** The lines of `fen`, best first. Empty when what is stored is from another position. */
export function orderedEngineLines(current: EngineLines | null, fen: string): EngineInfo[] {
  if (current?.fen !== fen) return [];
  return Object.keys(current.byIndex)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => current.byIndex[index]);
}
