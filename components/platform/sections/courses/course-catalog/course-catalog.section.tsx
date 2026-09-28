import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { coursesOfLevel, resolveLevelFilter } from "@/services/courses/level-rules";
import { CourseCard } from "../course-card.comp";
import { LevelFilter } from "./level-filter.comp";
import "./course-catalog.section.css";

interface CourseCatalogSectionProps {
  /** Every published course, the ones the student added too. */
  courses: CourseSummary[];
  /** The levels the list can be narrowed to, the easiest first. */
  levels: CourseLevelItem[];
  /** What `?nivel=` brought. One the catalog does not have is ignored. */
  levelSlug?: string;
}

/**
 * «Explorar cursos»: every course the academy has published, to find the ones
 * to add. Each card leads to the course's information page, which is where it
 * is added; one already added leads to the course and shows the progress.
 *
 * The level filter only narrows what is listed: a course of another level is
 * one click away under "Todos", and nothing is closed to anybody by their rating.
 */
export function CourseCatalogSection({ courses, levels, levelSlug }: CourseCatalogSectionProps) {
  const level = resolveLevelFilter(levels, levelSlug);
  const visible = coursesOfLevel(courses, level?.slug);

  return (
    <section className="course-catalog">
      <header className="course-catalog__head">
        <h1 className="course-catalog__title">Explorar cursos</h1>
        {/* What is LISTED is counted: with a level chosen, the figure of the
            whole catalog would contradict the cards under it. */}
        <p className="course-catalog__summary">
          {level
            ? `${visible.length} de ${courses.length} cursos · nivel ${level.name}`
            : courses.length === 1
              ? "1 curso publicado"
              : `${courses.length} cursos publicados`}
        </p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="Todavía no hay cursos disponibles"
          description="Cuando la academia publique cursos aparecerán aquí."
        />
      ) : (
        <>
          {levels.length > 0 && <LevelFilter levels={levels} current={level?.slug} />}

          {level && visible.length === 0 ? (
            <EmptyState
              title={`Todavía no hay cursos de nivel ${level.name}`}
              description="Prueba con otro nivel o vuelve a verlos todos."
              actionLabel="Ver todos los cursos"
              actionHref={platformRoutes.courseCatalog}
            />
          ) : (
            <div className="course-catalog__list">
              {visible.map((course) => (
                <CourseCard key={course.id} course={course} levels={levels} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
