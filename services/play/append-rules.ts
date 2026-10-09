import { playSan } from "@/lib/chess/live-game";

// Whether a move may be added to a played game, decided from what is stored
// and what the caller saw. Pure: the action reads the row, asks this, and only
// then writes (`writePlayedGameRecord`, guarded by the same ply).

export interface StoredGame {
  initialFen: string | null;
  sans: readonly string[];
  plyCount: number;
  finishedAt: Date | null;
}

export type AppendCheck =
  /** Write it: the record after the move, the move in its canonical form. */
  | { kind: "ok"; sans: string[]; san: string }
  /** The same move again — a retry after a lost answer: it is already there, answer as if it were written. */
  | { kind: "retry" }
  /** Another tab moved first: the caller's ply is behind. */
  | { kind: "stale" }
  /** Not a legal move there. */
  | { kind: "invalid" }
  /** The game is over. */
  | { kind: "finished" };

/** The canonical SAN of `san` played after `sans`, or null when it is not legal there. */
function canonical(initialFen: string | null, sans: readonly string[], san: string): string | null {
  return playSan({ initialFen, sans }, san)?.sans.at(-1) ?? null;
}

export function checkAppend(stored: StoredGame, input: { expectedPly: number; san: string }): AppendCheck {
  // A retry first: the move that closed the game may be retried too.
  if (stored.plyCount === input.expectedPly + 1 && stored.sans.length === stored.plyCount) {
    const before = stored.sans.slice(0, -1);
    if (canonical(stored.initialFen, before, input.san) === stored.sans.at(-1)) return { kind: "retry" };
  }
  if (stored.finishedAt !== null) return { kind: "finished" };
  if (stored.plyCount !== input.expectedPly) return { kind: "stale" };
  const next = playSan({ initialFen: stored.initialFen, sans: stored.sans }, input.san);
  if (!next) return { kind: "invalid" };
  return { kind: "ok", sans: [...next.sans], san: next.sans.at(-1)! };
}
