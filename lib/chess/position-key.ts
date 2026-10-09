// A position's identity as text, for telling two positions apart: no hashing,
// no Node API, so it runs in the browser too (the live game counts repetitions
// with it). `position-hash.ts` hashes this key for the position index.

/**
 * The four fields that define the position: pieces, turn, castling rights and
 * en passant square. The half-move clock and the move number are discarded, as
 * they tell the history of the game and not the position: two games that
 * transpose through different orders reach the same place with different clocks
 * and must count as the same position.
 *
 * The en passant square needs no special treatment: chessops only writes it
 * when the capture is really legal (`legalEpSquare` in `Position.toSetup`), so
 * one of its FENs already comes normalised on that point — which is also what
 * a threefold repetition requires.
 */
export function normalizePositionFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}
