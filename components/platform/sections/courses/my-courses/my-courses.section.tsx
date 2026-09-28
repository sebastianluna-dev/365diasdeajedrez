import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { CourseCard } from "../course-card.comp";
import "./my-courses.section.css";

interface MyCoursesSectionProps {
  /** The courses the student added, by name. */
  courses: CourseSummary[];
  /** Every level of the catalog, for the dots of each card. */
  levels: CourseLevelItem[];
}

/**
 * "2 cursos · 1 en curso": how many there are and how many are being studied,
 * which are the ones whose button says «Continuar».
 */
function summaryOf(courses: CourseSummary[]): string {
  if (courses.length === 0) return "Todavía no has agregado ninguno";

  const underway = courses.filter((course) => course.ctaLabel === "Continuar").length;
  return `${courses.length} ${courses.length === 1 ? "curso" : "cursos"} · ${underway} en curso`;
}

/**
 * "Mis cursos": the courses the student added, each as a card that leads to
 * the course to study, and after them the card that leads to the catalog,
 * which is where the next one is found.
 *
 * That last card is always there, so the page is never empty: with no course
 * added it is the only thing in the list and says what to do.
 */
export function MyCoursesSection({ courses, levels }: MyCoursesSectionProps) {
  return (
    <section className="my-courses">
      <header className="my-courses__head">
        <h1 className="my-courses__title">Mis cursos</h1>
        <p className="my-courses__summary">{summaryOf(courses)}</p>
      </header>

      <div className="my-courses__list">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} levels={levels} />
        ))}

        <Link href={platformRoutes.courseCatalog} className="my-courses__explore">
          <span className="my-courses__explore-mark" aria-hidden="true">
            +
          </span>
          <span className="my-courses__explore-label">Explorar cursos</span>
          {courses.length === 0 && (
            <span className="my-courses__explore-hint">Elige uno del catálogo y agrégalo para empezar.</span>
          )}
        </Link>
      </div>
    </section>
  );
}
