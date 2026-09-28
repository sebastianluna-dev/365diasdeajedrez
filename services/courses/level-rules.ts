// Rules of the course levels that the student's pages and the staff panel
// share, so they are pure and import nothing from the server.

/** What is needed of a level to say its range. `eloMax` null or absent = no upper bound. */
export interface EloRange {
  eloMin: number;
  eloMax?: number | null;
}

/**
 * The range as it is read: "Menos de 800", "800–1199", "2200 o más". Both
 * ends are inclusive, so a range that starts at zero is said by the first
 * rating that no longer belongs to it.
 */
export function formatEloRange({ eloMin, eloMax }: EloRange): string {
  const hasTop = eloMax !== null && eloMax !== undefined;
  if (!hasTop) return eloMin <= 0 ? "Cualquier Elo" : `${eloMin} o más`;
  if (eloMin <= 0) return `Menos de ${eloMax + 1}`;
  return `${eloMin}–${eloMax}`;
}

/**
 * The range with its name in front, for where nothing around says what the
 * figures are: "Elo orientativo: 800–1199", "Elo orientativo: menos de 800".
 * It takes the range already worded, which is what the mappers hand over.
 */
export function labelEloRange(eloRange: string): string {
  return `Elo orientativo: ${eloRange.charAt(0).toLowerCase()}${eloRange.slice(1)}`;
}

/** The same in the few words a card has room for: "Elo 800–1199", "Elo menos de 800". */
export function shortEloRange(eloRange: string): string {
  return `Elo ${eloRange.charAt(0).toLowerCase()}${eloRange.slice(1)}`;
}

/**
 * The level the list is filtered by, or undefined when the URL names none the
 * catalog has: a hand-typed `?nivel=` should not look like an empty list.
 */
export function resolveLevelFilter<T extends { slug: string }>(levels: T[], slug: string | undefined): T | undefined {
  if (!slug) return undefined;
  return levels.find((level) => level.slug === slug);
}

/** The courses aimed at the level; all of them when there is no level to filter by. */
export function coursesOfLevel<T extends { levels: { slug: string }[] }>(courses: T[], slug: string | undefined): T[] {
  if (!slug) return courses;
  return courses.filter((course) => course.levels.some((level) => level.slug === slug));
}
