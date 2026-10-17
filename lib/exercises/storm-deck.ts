// The contrarreloj's deck (D34; PLAN.md §5.6), pure: from the library's
// candidates, a run of exercises of increasing difficulty, each the closest
// unused one to a target that climbs by a step, never repeating. The service
// (or, while nothing persists, the page) hands the candidates and a random
// number source; the tests hand a fixed one.

export interface StormCandidate {
  id: string;
  difficulty: number;
}

export interface StormDeckShape {
  /** The first target, in Elo-like points (800). */
  start: number;
  /** How much the target climbs per exercise (35). */
  step: number;
  /** How many exercises at most; fewer when the candidates run out. */
  size: number;
}

/** The deck of a run, with the plan's figures: sixty exercises from 800, thirty-five points steeper each. */
export const STORM_DECK_SHAPE: StormDeckShape = { start: 800, step: 35, size: 60 };

/** Three minutes (D34). */
export const STORM_DURATION_MS = 3 * 60 * 1000;

/** The run ends at the third mistake (D34). */
export const STORM_MAX_MISTAKES = 3;

/**
 * The ids of a run, in order. The i-th pick is the unused candidate whose
 * difficulty is closest to `start + i·step`; among equals, `random()` picks,
 * so two runs over the same library differ. Null `random` would make it
 * deterministic, which is what a test wants.
 */
export function buildStormDeck(
  candidates: readonly StormCandidate[],
  shape: StormDeckShape,
  random: () => number,
): string[] {
  const unused = [...candidates];
  const deck: string[] = [];
  for (let index = 0; index < shape.size && unused.length > 0; index += 1) {
    const target = shape.start + index * shape.step;
    let best = Number.POSITIVE_INFINITY;
    let ties: number[] = [];
    unused.forEach((candidate, position) => {
      const distance = Math.abs(candidate.difficulty - target);
      if (distance < best) {
        best = distance;
        ties = [position];
      } else if (distance === best) {
        ties.push(position);
      }
    });
    const chosen = ties[Math.min(ties.length - 1, Math.floor(random() * ties.length))] ?? 0;
    const [picked] = unused.splice(chosen, 1);
    if (picked) deck.push(picked.id);
  }
  return deck;
}
