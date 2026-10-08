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

/**
 * THE LEVELS OF A COURSE ARE A STRETCH OF THE SCALE, NOT A HANDFUL OF TICKS.
 *
 * The six levels are ordered by difficulty, so a course aimed at «Iniciación»
 * and «Maestro» but not at what lies between says something that cannot be
 * true of a course: what is taught grows from one level to the next. A course
 * is for a stretch of that scale — «Intermedio y Avanzado» — and the staff
 * chooses its two ends.
 *
 * `all` is the catalog in order, easiest first; `chosen` is a set, in any
 * order.
 */
export function isLevelStretch(all: readonly string[], chosen: readonly string[]): boolean {
  const places = chosen.map((slug) => all.indexOf(slug));
  if (places.some((place) => place < 0)) return false;
  if (places.length <= 1) return true;
  const first = Math.min(...places);
  const last = Math.max(...places);
  // A set of distinct places is a stretch when it fills the span it covers.
  return new Set(places).size === places.length && last - first + 1 === places.length;
}

/**
 * The levels that can be turned on or off without breaking the stretch: the
 * two the stretch would grow into, its own two ends, and — with nothing
 * chosen yet — every one of them.
 *
 * What is NOT here is offered switched off, which is how the rule is said
 * without a sentence: a level in the middle of the stretch cannot be removed
 * (it would leave a hole) and one away from it cannot be added (it would
 * leave a gap).
 */
export function reachableLevels(all: readonly string[], chosen: readonly string[]): Set<string> {
  const places = chosen.map((slug) => all.indexOf(slug)).filter((place) => place >= 0);
  if (places.length === 0) return new Set(all);

  const first = Math.min(...places);
  const last = Math.max(...places);
  const reachable = [all[first - 1], all[first], all[last], all[last + 1]];
  return new Set(reachable.filter((slug): slug is string => slug !== undefined));
}
