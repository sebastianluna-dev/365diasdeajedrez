import { extractMainline } from "./mainline";
import { sanToSpanish, startPlyOfFen } from "./notation";

// How a game opens, in one line: "1.e4 c5 2.Cf3 d6 3.d4 cxd4 …". It is what a
// list of lessons shows of each one, so a game is recognised by its first
// moves without opening it.
//
// Pure module: it reads the PGN and nothing else.

/** Full moves the preview shows by default: six are enough to name an opening. */
const DEFAULT_MOVES = 6;

/**
 * The first moves of the PGN's main line, numbered and in Spanish notation,
 * with "…" at the end when the game goes on.
 *
 * A line that starts with Black to move opens with "12…Cf6": the numbering
 * comes from the starting position, never from 1.
 *
 * `undefined` when there are no moves to show — a lone diagram, a PGN that
 * cannot be read —, so whoever asks can fall back on something else.
 */
export function movesPreview(pgn: string, maxMoves = DEFAULT_MOVES): string | undefined {
  const mainline = extractMainline(pgn);
  if (!mainline) return undefined;

  const startPly = mainline.initialFen ? startPlyOfFen(mainline.initialFen) : 0;
  // A preview of N full moves ends on Black's Nth, so a line that opens with
  // Black to move shows one half-move less instead of one row more.
  const plies = maxMoves * 2 - (startPly % 2);
  const shown = mainline.sans.slice(0, plies);

  const parts = shown.map((san, index) => {
    const played = startPly + index;
    const number = Math.floor(played / 2) + 1;
    const isWhite = played % 2 === 0;
    if (isWhite) return `${number}.${sanToSpanish(san)}`;
    return index === 0 ? `${number}…${sanToSpanish(san)}` : sanToSpanish(san);
  });

  if (mainline.sans.length > shown.length) parts.push("…");
  return parts.join(" ");
}
