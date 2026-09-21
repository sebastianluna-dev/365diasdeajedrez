import { extractMainline } from "./mainline";

// The PGN "in the clear": only the main line, without variations, without
// comments, without annotations and without headers.
//
// It is what gets pasted into a chat, into an opening search engine or into
// another program when what one wants to share are THE MOVES and not the
// analysis work around them. The full PGN is still one button away.

/** Standard starting position: when it is that one, there is no need to say anything. */
const STANDARD_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Numbers the SANs as they are written: "1. e4 e5 2. Nf3".
 *
 * The number of the first move and whose it is come from the starting FEN, not
 * from zero: a game that starts at move 24 and with Black would read like an
 * opening if it were numbered from the beginning.
 */
function numberMoves(sans: string[], initialFen: string): string {
  const fields = initialFen.split(" ");
  let moveNumber = Number(fields[5]);
  let whiteToMove = fields[1] !== "b";
  if (!Number.isFinite(moveNumber) || moveNumber < 1) moveNumber = 1;

  const parts: string[] = [];
  for (const [index, san] of sans.entries()) {
    if (whiteToMove) parts.push(`${moveNumber}.`);
    else if (index === 0) parts.push(`${moveNumber}...`);

    parts.push(san);

    if (!whiteToMove) moveNumber += 1;
    whiteToMove = !whiteToMove;
  }
  return parts.join(" ");
}

/**
 * The main line of a PGN, plain. Null when there is not a single move to copy.
 *
 * THE ONLY exception to "without headers": if the game does not start at the
 * initial position, `SetUp` and `FEN` are kept. Without them the moves cannot
 * be replayed anywhere and what was copied would be useless, which is worse
 * than carrying two extra lines.
 */
export function plainMovetext(pgn: string): string | null {
  const mainline = extractMainline(pgn);
  if (!mainline) return null;

  const initialFen = mainline.initialFen ?? STANDARD_START;
  const moves = numberMoves(mainline.sans, initialFen);

  return mainline.initialFen === null ? moves : `[SetUp "1"]\n[FEN "${mainline.initialFen}"]\n\n${moves}`;
}
