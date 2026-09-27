import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { coursesOfLevel, resolveLevelFilter } from "@/services/courses/level-rules";
import { CourseCard } from "./course-card.comp";
import { LevelFilter } from "./level-filter.comp";
import "./courses-list.section.css";

interface CoursesListSectionProps {
  /** Every course, unfiltered: the page's header summary comes from the same list. */
  courses: CourseSummary[];
  /** The levels the list can be narrowed to, the easiest first. */
  levels: CourseLevelItem[];
  /** What `?nivel=` brought. One the catalog does not have is ignored. */
  levelSlug?: string;
}

/**
 * The courses of "Mis cursos", with the level filter on top. The filter only
 * narrows what is listed: a course of another level is still one click away
 * under "Todos", and nothing is closed to anybody by their rating.
 */
export function CoursesListSection({ courses, levels, levelSlug }: CoursesListSectionProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay cursos disponibles"
        description="Cuando la academia publique cursos aparecerán aquí."
      />
    );
  }

  const level = resolveLevelFilter(levels, levelSlug);
  const visible = coursesOfLevel(courses, level?.slug);

  return (
    <div className="courses-list">
      {levels.length > 0 && <LevelFilter levels={levels} current={level?.slug} />}

      {level && visible.length === 0 ? (
        <EmptyState
          title={`Todavía no hay cursos de nivel ${level.name}`}
          description="Prueba con otro nivel o vuelve a verlos todos."
          actionLabel="Ver todos los cursos"
          actionHref={platformRoutes.courses}
        />
      ) : (
        visible.map((course) => <CourseCard key={course.id} course={course} />)
      )}
    </div>
  );
}
