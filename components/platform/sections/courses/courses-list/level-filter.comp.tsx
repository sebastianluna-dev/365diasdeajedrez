import Link from "next/link";
import { ELO_DISCLAIMER } from "@/constants/platform/course-levels.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem } from "@/services/courses/courses.types";
import "./level-filter.comp.css";

interface LevelFilterProps {
  /** The levels in use, the easiest first. */
  levels: CourseLevelItem[];
  /** Slug of the level the list is narrowed to; absent = every course. */
  current?: string;
}

/**
 * The level filter of "Mis cursos": one chip per level, in order of
 * difficulty, each with its orientative Elo range, and "Todos" in front.
 *
 * Links and not buttons: the filter lives in the URL (`?nivel=intermedio`), so
 * it can be shared, the back button undoes it and nothing is hydrated. It only
 * narrows what is listed; every course stays open to every student.
 */
export function LevelFilter({ levels, current }: LevelFilterProps) {
  return (
    <nav className="level-filter" aria-label="Filtrar cursos por nivel">
      <ul className="level-filter__list">
        <li>
          <Link
            href={platformRoutes.courses}
            aria-current={current ? undefined : "page"}
            className={`level-filter__chip${current ? "" : " level-filter__chip_state_active"}`}
          >
            Todos
          </Link>
        </li>

        {levels.map((level) => {
          const isActive = level.slug === current;
          return (
            <li key={level.slug}>
              <Link
                href={platformRoutes.coursesOfLevel(level.slug)}
                aria-current={isActive ? "page" : undefined}
                title={level.description}
                className={`level-filter__chip${isActive ? " level-filter__chip_state_active" : ""}`}
              >
                {level.name}
                <span className="level-filter__range">{level.eloRange}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="level-filter__note">{ELO_DISCLAIMER}.</p>
    </nav>
  );
}
