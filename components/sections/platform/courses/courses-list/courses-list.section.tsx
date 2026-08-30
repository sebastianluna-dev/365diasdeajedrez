import { EmptyState } from "@/components/common/empty-state.comp";
import { getUserCourses } from "@/services/courses/courses.service";
import { CourseCard } from "./course-card.comp";
import "./courses-list.section.css";

export async function CoursesListSection() {
  const courses = await getUserCourses();

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
