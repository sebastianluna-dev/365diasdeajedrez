import { extractMainline } from "./mainline";
import { sanToSpanish, startPlyOfFen } from "./notation";

// A game as a line of text: "1.e4 c5 2.Cf3 d6 3.d4 cxd4 …" to its last move,
// and how it ended. It is what a list of lessons shows of each one, so a game
// is recognised — and can be read through — without opening it.
//
// Pure module: it reads the PGN and nothing else.

/** One move of the line: as it is written, and as it is played. */
export interface GamePly {
  /** As the list writes it: "1.e4", "c5", "12…Ab4" — numbered, in Spanish. */
  label: string;
  /** Its SAN in English, which is what replays it on a board. */
  san: string;
}

/** The main line, to be replayed: where it starts and its moves. */
export interface GameLine {
  /** The position it starts from; absent for the standard one. */
  initialFen?: string;
  plies: GamePly[];
}

export interface GameMoves {
  /** Every move of the main line, numbered and in Spanish notation. */
  moves: string;
  /** The same moves one by one, with what replays them: a preview board's. */
  line: GameLine;
  /** How the game ended: "1-0", "0-1" or "½-½". Absent when it did not, or the PGN does not say. */
  result?: string;
}

/** A result as it is written next to the moves; a game still in play ("*") has none. */
const RESULTS: Record<string, string> = { "1-0": "1-0", "0-1": "0-1", "1/2-1/2": "½-½" };

/**
 * What the PGN says of how the game ended: its `Result` header and, without
 * one, the mark that closes the moves.
 */
function resultOf(pgn: string): string | undefined {
  const header = /^\s*\[Result\s+"([^"]*)"\]/m.exec(pgn)?.[1];
  const closing = /(1-0|0-1|1\/2-1\/2)\s*$/.exec(pgn)?.[1];
  return RESULTS[header ?? ""] ?? RESULTS[closing ?? ""];
}

/**
 * The moves of the PGN's main line, all of them, and the game's result.
 *
 * Only the main line: neither the variations nor the comments, which are
 * what the lesson is opened for.
 *
 * A line that starts with Black to move opens with "12…Cf6": the numbering
 * comes from the starting position, never from 1.
 *
 * `undefined` when there are no moves to show — a lone diagram, a PGN that
 * cannot be read —, so whoever asks can fall back on something else.
 */
export function gameMoves(pgn: string): GameMoves | undefined {
  const mainline = extractMainline(pgn);
  if (!mainline) return undefined;

  const startPly = mainline.initialFen ? startPlyOfFen(mainline.initialFen) : 0;

  const plies = mainline.sans.map((san, index) => {
    const played = startPly + index;
    const number = Math.floor(played / 2) + 1;
    const isWhite = played % 2 === 0;
    const spanish = sanToSpanish(san);
    const label = isWhite ? `${number}.${spanish}` : index === 0 ? `${number}…${spanish}` : spanish;
    return { label, san };
  });
  const line: GameLine = mainline.initialFen ? { initialFen: mainline.initialFen, plies } : { plies };

  return { moves: plies.map((ply) => ply.label).join(" "), line, result: resultOf(pgn) };
}
