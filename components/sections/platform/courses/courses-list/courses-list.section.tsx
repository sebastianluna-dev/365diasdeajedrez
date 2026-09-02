import { EmptyState } from "@/components/common/empty-state.comp";
import type { CourseSummary } from "@/services/courses/courses.types";
import { CourseCard } from "./course-card.comp";
import "./courses-list.section.css";

interface CoursesListSectionProps {
  /** Los trae la página: el resumen de la cabecera sale de la misma lista. */
  courses: CourseSummary[];
}

export function CoursesListSection({ courses }: CoursesListSectionProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay cursos disponibles"
        description="Cuando la academia publique cursos aparecerán aquí."
      />
    );
  }

  return (
    <div className="courses-list">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
