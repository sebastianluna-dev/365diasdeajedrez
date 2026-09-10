import { createPositionHash } from "./position-hash";
import { replayGameDetailed } from "./replay";

// Turns a game into the collection of positions it went through, which is what
// the position search indexes (see services/game-positions).
//
// Each row answers "this game was in this position and then X was played":
// from that come both the games that contain a position and the statistics of
// continuations.

export interface ExtractedPosition {
  /** Half-moves from the start. 0 is the starting position. */
  ply: number;
  positionHash: string;
  /** Move played FROM this position. Null in the final position. */
  nextMoveSan: string | null;
  /** The same move in UCI: it is the stable way to group across games. */
  nextMoveUci: string | null;
}

export interface ExtractGamePositionsResult {
  positions: ExtractedPosition[];
  /**
   * Warnings from the replayer (unreadable PGN or illegal move). They are not an
   * error: the game is indexed as far as it could be replayed, and whoever
   * imports decides whether to tell the user.
   */
  warnings: string[];
}

/**
 * Replays the PGN and returns one position per ply, already hashed.
 *
 * It relies on `replayGameDetailed`, which is the platform's replayer (same
 * parsing, same rules and same FENs the student sees on the board): indexing
 * by another route would let the index and the screen disagree.
 *
 * A position repeated within the same game produces several rows, one per ply.
 * That is deliberate — each visit could have continued differently — and it
 * forces counting games by distinct `gameId`, never by number of rows.
 */
export function extractGamePositions(pgn: string): ExtractGamePositionsResult {
  const { positions, warnings } = replayGameDetailed(pgn);

  const extracted = positions.map((position, index) => {
    const next = positions[index + 1];
    return {
      ply: index,
      positionHash: createPositionHash(position.fen),
      nextMoveSan: next ? next.san : null,
      nextMoveUci: next ? next.uci : null,
    };
  });

  return { positions: extracted, warnings };
}
