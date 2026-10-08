import Link from "next/link";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { MyCourseItem } from "@/services/courses/courses.types";
import type { StreakOverview } from "@/services/study-goal/study-goal.types";
import { MyCourseCard } from "./my-course-card.comp";
import { StreakPanel } from "./streak-panel.comp";
import "./my-courses.section.css";

interface MyCoursesSectionProps {
  /** The courses the student added. */
  courses: MyCourseItem[];
  /** The streak and the last months of activity: the column beside the courses. */
  streak: StreakOverview;
}

/**
 * «Mis cursos» (2026-10-07, «P1», the owner's choice among two rounds of
 * variants): the page's head with the way to the catalog, the courses the
 * student added as covers in two columns, and beside them, a whole column
 * high, the streak and the last four months of study.
 *
 * With no course added the list says so and points to the catalog; the
 * streak column is there all the same.
 */
export function MyCoursesSection({ courses, streak }: MyCoursesSectionProps) {
  return (
    <section className="my-courses">
      <header className="my-courses__head">
        <div className="platform-page__head">
          <h1 className="platform-page__title">Mis cursos</h1>
          <p className="platform-page__subtitle">Lo que estás estudiando, y cuánto llevas.</p>
        </div>
        <Link href={platformRoutes.courseCatalog} className="platform-button my-courses__explore">
          <MagnifyingGlassIcon variant="classic-solid" className="platform-button__icon" />
          Explorar cursos
        </Link>
      </header>

      <div className="my-courses__layout">
        {courses.length === 0 ? (
          <EmptyState
            title="Todavía no tienes cursos"
            description="Elige uno del catálogo y agrégalo para empezar."
            actionLabel="Explorar cursos"
            actionHref={platformRoutes.courseCatalog}
          />
        ) : (
          <div className="my-courses__grid">
            {courses.map((course) => (
              <MyCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <StreakPanel overview={streak} />
      </div>
    </section>
  );
}
