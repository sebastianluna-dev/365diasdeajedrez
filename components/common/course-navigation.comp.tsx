import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./course-navigation.comp.css";

interface CourseNavigationProps {
  /** Slug, no id: las rutas del alumno van por slug. */
  courseSlug: string;
  courseName: string;
  chapterSlug?: string;
  chapterName?: string;
  /** Nombre de la lección actual (no enlazada). */
  lessonName?: string;
}

/** Navegación contextual Curso → Capítulo → Lección. */
export function CourseNavigation({
  courseSlug,
  courseName,
  chapterSlug,
  chapterName,
  lessonName,
}: CourseNavigationProps) {
  return (
    <nav className="course-navigation" aria-label="Ruta del curso">
      <Link href={platformRoutes.courses} className="course-navigation__link">
        Mis cursos
      </Link>
      <span className="course-navigation__separator">/</span>
      <Link href={platformRoutes.courseDetail(courseSlug)} className="course-navigation__link">
        {courseName}
      </Link>
      {chapterSlug && chapterName && (
        <>
          <span className="course-navigation__separator">/</span>
          <Link href={platformRoutes.chapterDetail(courseSlug, chapterSlug)} className="course-navigation__link">
            {chapterName}
          </Link>
        </>
      )}
      {lessonName && (
        <>
          <span className="course-navigation__separator">/</span>
          <span className="course-navigation__current">{lessonName}</span>
        </>
      )}
    </nav>
  );
}
