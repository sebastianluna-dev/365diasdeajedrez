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

/** The range in the width of a scale's tick: "< 800", "800–1199", "2200+". */
export function compactEloRange({ eloMin, eloMax }: EloRange): string {
  const hasTop = eloMax !== null && eloMax !== undefined;
  if (!hasTop) return eloMin <= 0 ? "Todos" : `${eloMin}+`;
  if (eloMin <= 0) return `< ${eloMax + 1}`;
  return `${eloMin}–${eloMax}`;
}

/**
 * The whole range a course is aimed at: from the floor of its easiest level
 * to the ceiling of its hardest. `undefined` for a course without levels.
 *
 * It spans what lies between two levels that are not neighbours: a course for
 * beginners and for experts is said to be for 800–2199, which is what it
 * means to whoever reads a single figure. The scale next to it shows the gap.
 */
export function audienceRange(levels: readonly EloRange[]): EloRange | undefined {
  if (levels.length === 0) return undefined;
  const eloMin = Math.min(...levels.map((level) => level.eloMin));
  const isOpen = levels.some((level) => level.eloMax === null || level.eloMax === undefined);
  const eloMax = isOpen ? null : Math.max(...levels.map((level) => level.eloMax ?? 0));
  return { eloMin, eloMax };
}

/** "intermedio", "intermedio y avanzado", "principiante, intermedio y avanzado". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
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
