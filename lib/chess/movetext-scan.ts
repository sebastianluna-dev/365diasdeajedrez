// Scanning the movetext for tokens that do not EVEN have the shape of a move
// ("Qz9", "Bx99"), which is the most likely error in a hand-written PGN.
//
// Why it is needed: chessops's tokeniser discards them before our validation
// sees them, so the branch disappears from the tree without a trace and
// `parsePgnTree` has nothing to warn about. Here the raw text is inspected,
// before anyone interprets it.

/**
 * The SAN grammar, as it is written in a PGN:
 * castling, a piece move (with optional disambiguation and capture) and a pawn
 * move (with optional capture and promotion), plus check, mate and the signs
 * that are sometimes stuck at the end.
 */
const SAN_PATTERN =
  /^(?:[O0]-[O0](?:-[O0])?|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h](?:[1-8]|x[a-h][1-8])(?:=?[QRBN])?)[+#]?[!?]{0,2}$/;

/** The game result, which closes the movetext and is not a move. */
const RESULT_PATTERN = /^(?:1-0|0-1|1\/2-1\/2|\*)$/;

/**
 * Tokens that are not moves but appear in real movetexts: the engines' null
 * move and the loose ellipses of some exporters.
 */
const TOLERATED = new Set(["--", "Z0", "...", "…"]);

/** Leaves only the movetext: out go headers, comments and commands. */
function movetextOf(pgn: string): string {
  return pgn
    .replace(/^\s*\[[^\]]*\]\s*$/gm, " ") // headers
    .replace(/\{[^}]*\}/g, " ") // comments in braces
    .replace(/;[^\n]*/g, " ") // comment to the end of the line, wherever it starts
    .replace(/^\s*%.*$/gm, " ") // escape lines from the standard
    .replace(/<[^>]*>/g, " ") // reserved tokens
    .replace(/[()]/g, " ") // variation parentheses
    .replace(/\$\d+/g, " ") // NAGs
    .replace(/\b\d+\.(?:\.\.)?/g, " "); // move numbers, with or without dots
}

/**
 * The movetext tokens that are not a valid move.
 *
 * Returns each one ONCE and in the order they appear: a PGN with the same typo
 * repeated is reported a single time, which is what has to be fixed.
 */
export function findMalformedMoveTokens(pgn: string): string[] {
  const seen = new Set<string>();

  for (const token of movetextOf(pgn).split(/\s+/)) {
    if (token.length === 0 || TOLERATED.has(token)) continue;
    if (RESULT_PATTERN.test(token) || SAN_PATTERN.test(token)) continue;
    seen.add(token);
  }

  return [...seen];
}
