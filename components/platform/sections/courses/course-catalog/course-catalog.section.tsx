import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { mdChip } from "@/lib/material/material-classes";
import { addCourse } from "@/services/courses/courses.actions";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { CourseCard } from "../course-card.comp";
import { catalogHref, filterCatalog, type CatalogFilters } from "./catalog-filters.const";
import "./course-catalog.section.css";

interface CourseCatalogSectionProps {
  /** Every published course, the ones the student added too. */
  courses: CourseSummary[];
  /** The levels the catalog can be narrowed to, the easiest first. */
  levels: CourseLevelItem[];
  filters: CatalogFilters;
}

/** «Cursos» has six levels' colours; a seventh level would repeat the last. */
const LEVEL_TONES = 6;

/**
 * The catalog (`/cursos/catalogo`, 2026-10-22, the new design system): the
 * panel of the layout it shares with «Mis cursos» (`CoursesWorkspace`), so
 * the side column and the search stay and only this panel changes. A heading — the level chosen
 * in the column, or the whole catalog, or the search —, a row of Material's
 * filter chips (the topics, and «Que aún no llevas»), and the courses as
 * cards, with «Agregar» on the ones the student does not have.
 *
 * Every filter is a link, so it can be shared and the back button undoes it.
 * The filters only narrow what is listed: nothing is closed to anybody by
 * their rating.
 */
export function CourseCatalogSection({ courses, levels, filters }: CourseCatalogSectionProps) {
  const shown = filterCatalog(courses, filters);
  const levelIndex = levels.findIndex((level) => level.slug === filters.level);
  const level = levels[levelIndex];
  const notAddedCount = shown.filter((course) => !course.isAdded).length;
  // The topics the catalog has, in the order its courses name them.
  const topics = [
    ...new Map(courses.flatMap((course) => course.contentTypes).map((topic) => [topic.code, topic])).values(),
  ];

  return (
    <section className="platform-workspace__panel course-catalog" aria-labelledby="course-catalog-title">
      <div className="course-catalog__head">
        {level && (
          <span
            className={`course-catalog__level course-catalog__level_tone_${Math.min(levelIndex + 1, LEVEL_TONES)}`}
            aria-hidden="true"
          />
        )}
        <h1 id="course-catalog-title" className="course-catalog__title">
          {filters.query ? `Resultados de «${filters.query}»` : (level?.name ?? "Todo el catálogo")}
        </h1>
        <p className="course-catalog__count">
          {shown.length === 1 ? "1 curso" : `${shown.length} cursos`}
          {notAddedCount > 0 && ` · ${notAddedCount} que aún no llevas`}
        </p>
      </div>

      <nav className="course-catalog__chips" aria-label="Filtrar el catálogo">
        {topics.map((topic) => {
          const selected = filters.topic === topic.code;
          return (
            <Link
              key={topic.code}
              href={catalogHref({ ...filters, topic: selected ? undefined : topic.code })}
              className={mdChip("filter", selected)}
              aria-current={selected ? "true" : undefined}
            >
              {selected && <CheckIcon variant="classic-solid" className="platform-md-icon" />}
              {topic.shortLabel}
            </Link>
          );
        })}
        {topics.length > 0 && <span className="course-catalog__divider" aria-hidden="true" />}
        <Link
          href={catalogHref({ ...filters, notAdded: !filters.notAdded })}
          className={mdChip("filter", filters.notAdded)}
          aria-current={filters.notAdded ? "true" : undefined}
        >
          {filters.notAdded && <CheckIcon variant="classic-solid" className="platform-md-icon" />}
          Que aún no llevas
        </Link>
      </nav>

      {shown.length === 0 ? (
        <EmptyState
          title="No hay cursos con esos filtros"
          description="Quita alguno para ver más cursos del catálogo."
          actionLabel="Ver todo el catálogo"
          actionHref={catalogHref({ notAdded: false })}
        />
      ) : (
        <div className="course-catalog__grid">
          {shown.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              addAction={course.isAdded ? undefined : addCourse.bind(null, course.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
