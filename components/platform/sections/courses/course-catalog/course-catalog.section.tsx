import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { CatalogBrowser } from "./catalog-browser.comp";
import "./course-catalog.section.css";

interface CourseCatalogSectionProps {
  /** Every published course, the ones the student added too. */
  courses: CourseSummary[];
  /** The levels the list can be narrowed to, the easiest first. */
  levels: CourseLevelItem[];
  /** What `?nivel=` brought, ticked on arrival. One the catalog does not have is ignored. */
  levelSlug?: string;
}

/**
 * «Explorar cursos»: every course the academy has published, to find the ones
 * to add. The page's head, and the catalog with its filters at the side
 * (`CatalogBrowser`, 2026-10-07). Each card leads to the course's information
 * page, which is where it is added; one already added leads to the course.
 *
 * The filters only narrow what is listed: nothing is closed to anybody by
 * their rating.
 */
export function CourseCatalogSection({ courses, levels, levelSlug }: CourseCatalogSectionProps) {
  return (
    <section className="course-catalog">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Explorar cursos</h1>
        <p className="platform-page__subtitle">
          {courses.length === 1 ? "1 curso publicado" : `${courses.length} cursos publicados`}
        </p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="Todavía no hay cursos disponibles"
          description="Cuando la academia publique cursos aparecerán aquí."
        />
      ) : (
        <CatalogBrowser courses={courses} levels={levels} initialLevel={levelSlug} />
      )}
    </section>
  );
}
