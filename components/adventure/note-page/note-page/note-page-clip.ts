/** The same sequence every time for a seed: a small seeded generator, as the mockup's `rng`. */
function seeded(seed: number): () => number {
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * The clip of a page's sheet as a `clip-path: polygon(...)`. Open, the whole
 * sheet — or, when it was torn out, with a ragged bottom edge that stops
 * between 82 and 95 % of its height. Folded, only the top half, with a
 * straight edge: the page has been reached but not read yet.
 */
export function pageClip(isOpen: boolean, isTorn: boolean): string {
  const steps = 44;
  const random = seeded(isTorn ? 11 : 3);
  const bottom: string[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const x = (step / steps) * 100;
    const y = isOpen ? (isTorn ? 87 + random() * 6 - (step % 2) * 2.4 + Math.sin(step / 5) * 2 : 100) : 52;
    bottom.push(`${round(x)}% ${round(y)}%`);
  }
  return `polygon(0% 0%, 100% 0%, ${bottom.reverse().join(", ")})`;
}
