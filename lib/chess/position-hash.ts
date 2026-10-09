import { createHash } from "node:crypto";
import { normalizePositionFen } from "./position-key";

// Identity of a position for the position search. THE ONLY source of truth: the
// client sends the FEN and the hash is always computed here, on the server. Do
// not import from a "use client" component (node:crypto does not exist in the
// browser) nor duplicate this logic anywhere else.
//
// Without "server-only" on purpose, like constants/platform/demo-user.const:
// the seed and the indexing scripts run outside Next and need to import it.

/**
 * Deterministic hash of the position, to index and search by equality: the
 * hash of its key (`normalizePositionFen`, which drops the clocks).
 *
 * SHA-256 and not Zobrist: the hash only has to be stable and free of practical
 * collisions, and this is provided by the standard library with no state to
 * maintain nor tables to version. Zobrist would only be worth it if the hash had
 * to be updated incrementally move by move, which is not the case.
 */
export function createPositionHash(fen: string): string {
  return createHash("sha256").update(normalizePositionFen(fen)).digest("hex");
}
