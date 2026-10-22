import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary, MyCourseItem } from "@/services/courses/courses.types";
import type { StreakOverview } from "@/services/study-goal/study-goal.types";
import { coursesNavGroups } from "../courses-nav.const";
import { CoursesWorkspace } from "../courses-workspace.comp";
import { filterMyCourses, resumeCourseOf, type MyCoursesFilter } from "./my-courses-filter.const";
import { MyCourseCard } from "./my-course-card.comp";
import { ResumeCourse } from "./resume-course.comp";
import { StreakBand } from "./streak-band.comp";
import "./my-courses.section.css";

interface MyCoursesSectionProps {
  /** The courses the student added, in the list's order. */
  courses: MyCourseItem[];
  /** The view on screen (`?estado=`). */
  filter: MyCoursesFilter;
  /** The streak and the last months of activity: the band across the panel. */
  streak: StreakOverview;
  /** Every published course and the levels, which the side column counts. */
  catalog: CourseSummary[];
  levels: CourseLevelItem[];
}

/** What the heading says under each view, and what an empty view says. */
const VIEW_TEXT: Record<Exclude<MyCoursesFilter, undefined>, { title: string; empty: string }> = {
  "en-curso": { title: "En curso", empty: "No tienes cursos en curso." },
  completados: { title: "Completados", empty: "Todavía no terminas ningún curso." },
  "sin-empezar": { title: "Sin empezar", empty: "Ya empezaste todos tus cursos." },
};

/**
 * «Mis cursos» in the new design system (2026-10-22, «M4» of the owner's
 * canvas, Material 3 Expressive): the panel of `CoursesWorkspace`, whose side
 * column holds «Seguir donde iba», the student's courses by state and the
 * catalog by level; the panel holds the course to go on with, the
 * streak across, and the courses as cards.
 *
 * With no course added the panel says so and points to the catalog; the
 * streak is there all the same. The views are links (`?estado=`), so the
 * back button undoes them; «Sigue donde ibas» stays on top in every view.
 */
export function MyCoursesSection({ courses, filter, streak, catalog, levels }: MyCoursesSectionProps) {
  const resume = resumeCourseOf(courses);
  const shown = filterMyCourses(courses, filter);
  const groups = coursesNavGroups(courses, catalog, levels, { kind: "mine", filter });

  return (
    <CoursesWorkspace groups={groups} resumeHref={resume?.learnHref}>
      <section className="platform-workspace__panel my-courses" aria-labelledby="my-courses-title">
        <h1 id="my-courses-title" className="my-courses__sr-title">
          Mis cursos
        </h1>

        {resume?.learnHref && <ResumeCourse course={{ ...resume, learnHref: resume.learnHref }} />}

        <StreakBand overview={streak} />

        {courses.length === 0 ? (
          <EmptyState
            title="Todavía no tienes cursos"
            description="Elige uno del catálogo y agrégalo para empezar."
            actionLabel="Explorar cursos"
            actionHref={platformRoutes.courseCatalog}
          />
        ) : (
          <div className="my-courses__list">
            <div className="my-courses__head">
              <h2 className="my-courses__title">{filter === undefined ? "Tus cursos" : VIEW_TEXT[filter].title}</h2>
              <p className="my-courses__count">
                {shown.length} {shown.length === 1 ? "curso" : "cursos"}
              </p>
            </div>

            {shown.length === 0 ? (
              <p className="my-courses__empty">{filter && VIEW_TEXT[filter].empty}</p>
            ) : (
              <div className="my-courses__grid">
                {shown.map((course) => (
                  <MyCourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </CoursesWorkspace>
  );
}
