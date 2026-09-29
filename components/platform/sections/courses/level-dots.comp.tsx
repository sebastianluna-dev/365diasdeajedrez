import type { CourseLevelItem } from "@/services/courses/courses.types";
import { audienceRange, formatEloRange, joinNames, shortEloRange } from "@/services/courses/level-rules";
import "./level-dots.comp.css";

interface LevelDotsProps {
  /** Every level of the catalog, the easiest first: one dot each. */
  scale: CourseLevelItem[];
  /** The levels the course is aimed at: the dots that are lit. */
  levels: CourseLevelItem[];
}

/** The tokens go from 1 to 6; a catalog that grew past them keeps the darkest. */
const TONES = 6;

/**
 * Who a course is for, in the width of a word: one dot per level of the
 * catalog, lit the ones the course is aimed at, each in the accent of its
 * difficulty. What the dots mean is said by the tip that opens on hover and
 * on keyboard focus, and by the label a screen reader is given.
 *
 * It has no state: the tip is shown and hidden by the stylesheet, so a list
 * of courses does not hydrate one tooltip per card.
 */
export function LevelDots({ scale, levels }: LevelDotsProps) {
  const range = audienceRange(levels);
  if (scale.length === 0 || levels.length === 0 || !range) return null;

  const lit = new Set(levels.map((level) => level.slug));
  const names = `Para jugadores de nivel ${joinNames(levels.map((level) => level.name.toLowerCase()))}`;
  const elo = shortEloRange(formatEloRange(range));

  return (
    <span className="level-dots" tabIndex={0} role="img" aria-label={`${names}. ${elo}.`}>
      {scale.map((level, index) => (
        <span
          key={level.slug}
          className={`level-dots__dot${lit.has(level.slug) ? ` level-dots__dot_level_${Math.min(index + 1, TONES)}` : ""}`}
        />
      ))}

      <span className="level-dots__tip" aria-hidden="true">
        <span className="level-dots__tip-levels">{names}</span>
        <span className="level-dots__tip-elo">{elo}</span>
      </span>
    </span>
  );
}
