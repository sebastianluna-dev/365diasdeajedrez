import { createHash } from "node:crypto";

// Identity of a position for the position search. THE ONLY source of truth: the
// client sends the FEN and the hash is always computed here, on the server. Do
// not import from a "use client" component (node:crypto does not exist in the
// browser) nor duplicate this logic anywhere else.
//
// Without "server-only" on purpose, like constants/platform/demo-user.const:
// the seed and the indexing scripts run outside Next and need to import it.

/**
 * The four fields that define the position: pieces, turn, castling rights and
 * en passant square. The half-move clock and the move number are discarded, as
 * they tell the history of the game and not the position: two games that
 * transpose through different orders reach the same place with different clocks
 * and must count as the same position.
 *
 * The en passant square needs no special treatment: chessops only writes it
 * when the capture is really legal (`legalEpSquare` in `Position.toSetup`), so
 * one of its FENs already comes normalised on that point.
 */
export function normalizePositionFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}

/**
 * Deterministic hash of the position, to index and search by equality.
 *
 * SHA-256 and not Zobrist: the hash only has to be stable and free of practical
 * collisions, and this is provided by the standard library with no state to
 * maintain nor tables to version. Zobrist would only be worth it if the hash had
 * to be updated incrementally move by move, which is not the case.
 */
export function createPositionHash(fen: string): string {
  return createHash("sha256").update(normalizePositionFen(fen)).digest("hex");
}
