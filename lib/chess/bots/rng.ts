// The bots' randomness, seeded: the same game at the same ply draws the same
// numbers, so a weak bot's choice can be tested and a calibration run repeated.

/** A seeded generator of numbers in [0, 1): mulberry32, small and good enough for picking moves. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A 32-bit seed from a game and a ply (FNV-1a over `gameId:ply`). */
export function seedOf(gameId: string, ply: number): number {
  let hash = 0x811c9dc5;
  for (const char of `${gameId}:${ply}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
