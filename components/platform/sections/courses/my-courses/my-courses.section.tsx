import Link from "next/link";
import { StudyStreak } from "@/components/platform/shared/study-streak.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { MyCourseItem } from "@/services/courses/courses.types";
import type { StudyStreak as StudyStreakModel } from "@/services/study-goal/study-goal.types";
import { MyCourseCard } from "./my-course-card.comp";
import "./my-courses.section.css";

interface MyCoursesSectionProps {
  /** The courses the student added, by name. */
  courses: MyCourseItem[];
  /** Days in a row studying: the card beside the list. */
  streak: StudyStreakModel;
}

/**
 * "2 cursos · 1 en curso": how many there are and how many are being studied,
 * which are the ones started and not finished.
 */
function summaryOf(courses: MyCourseItem[]): string {
  if (courses.length === 0) return "Todavía no has agregado ninguno";

  const underway = courses.filter((course) => course.ctaLabel === "Continuar").length;
  return `${courses.length} ${courses.length === 1 ? "curso" : "cursos"} · ${underway} en curso`;
}

/**
 * "Mis cursos": the courses the student added, one to a row, each a card
 * that says how far they are in it and leads to the course to study; and
 * after them the row that leads to the catalog, which is where the next one
 * is found.
 *
 * That last row is always there, so the page is never empty: with no course
 * added it is the only thing in the list and says what to do.
 *
 * Beside the list, the daily streak: the courses are where it is kept.
 */
export function MyCoursesSection({ courses, streak }: MyCoursesSectionProps) {
  return (
    <section className="my-courses">
      <header className="my-courses__head">
        <h1 className="my-courses__title">Mis cursos</h1>
        <p className="my-courses__summary">{summaryOf(courses)}</p>
      </header>

      <div className="my-courses__layout">
        <div className="my-courses__list">
          {courses.map((course) => (
            <MyCourseCard key={course.id} course={course} />
          ))}

          <Link href={platformRoutes.courseCatalog} className="my-courses__explore">
            <span className="my-courses__explore-mark" aria-hidden="true">
              +
            </span>
            <span className="my-courses__explore-text">
              <span className="my-courses__explore-label">Explorar cursos</span>
              {courses.length === 0 && (
                <span className="my-courses__explore-hint">Elige uno del catálogo y agrégalo para empezar.</span>
              )}
            </span>
          </Link>
        </div>

        <aside className="my-courses__aside">
          <StudyStreak streak={streak} />
        </aside>
      </div>
    </section>
  );
}
