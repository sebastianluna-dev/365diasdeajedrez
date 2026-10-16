// An exercise's Level, derived from its difficulty on reading (D13 + D38):
// the author writes one Elo-like number and the level follows from it, so the
// two can never disagree and nothing stores the level. Pure module, shared by
// the editor's hint under «Dificultad» («Nivel: Intermedio (1200–1599)»), the
// lists and, from phase 4, free practice's filter.

/** What the rule reads of a `Level` row. */
export interface DifficultyLevel {
  slug: string;
  name: string;
  /** Position by difficulty, the easiest first. */
  order: number;
  eloMin: number;
  /** Null: no upper bound. */
  eloMax: number | null;
  isActive: boolean;
}

/** Whether a difficulty falls in a level's inclusive Elo range. */
export function levelContains(level: Pick<DifficultyLevel, "eloMin" | "eloMax">, difficulty: number): boolean {
  return difficulty >= level.eloMin && (level.eloMax === null || difficulty <= level.eloMax);
}

/**
 * The easiest active level whose range holds the difficulty (by `order`, then
 * by `eloMin`, so two overlapping ranges always give the same one), or null
 * when no active level holds it.
 */
export function levelOfDifficulty<L extends DifficultyLevel>(difficulty: number, levels: readonly L[]): L | null {
  const candidates = levels
    .filter((level) => level.isActive && levelContains(level, difficulty))
    .sort((left, right) => left.order - right.order || left.eloMin - right.eloMin);
  return candidates[0] ?? null;
}
