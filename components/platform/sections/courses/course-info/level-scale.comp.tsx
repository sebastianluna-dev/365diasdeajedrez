import type { CourseLevelItem } from "@/services/courses/courses.types";
import { audienceRange, compactEloRange, formatEloRange } from "@/services/courses/level-rules";
import "./level-scale.comp.css";

interface LevelScaleProps {
  /** Every level of the catalog, the easiest first: one segment each. */
  scale: CourseLevelItem[];
  /** The levels the course is aimed at: the segments that are lit. */
  levels: CourseLevelItem[];
}

/** "Elo 1200–1999", "Elo 2200 o más", "Elo menos de 800": the range after the word. */
function eloOf(range: string): string {
  return `Elo ${range.charAt(0).toLowerCase()}${range.slice(1)}`;
}

/**
 * Who the course is for, on the scale of the six levels: the ones it is aimed
 * at are lit and the rest stay, greyed, so the course is placed among all of
 * them and not only named. Above it, the whole range in one figure.
 *
 * The range guides whoever is choosing. It closes the course to nobody.
 */
export function LevelScale({ scale, levels }: LevelScaleProps) {
  const range = audienceRange(levels);
  if (scale.length === 0 || !range) return null;

  const lit = new Set(levels.map((level) => level.slug));

  return (
    <div className="level-scale">
      <p className="level-scale__headline">Para jugadores con {eloOf(formatEloRange(range))}</p>

      <ol className="level-scale__levels" style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0, 1fr))` }}>
        {scale.map((level) => {
          const isLit = lit.has(level.slug);
          return (
            <li
              key={level.slug}
              className={`level-scale__level${isLit ? " level-scale__level_state_lit" : ""}`}
              title={level.description}
            >
              <span className="level-scale__bar" aria-hidden="true" />
              <span className="level-scale__name">{level.name}</span>
              <span className="level-scale__range">{compactEloRange(level)}</span>
              {/* What the colour says, for whoever does not see it. */}
              {isLit && <span className="level-scale__sr">: nivel del curso</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
