import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./course-navigation.comp.css";

interface CourseNavigationProps {
  courseId: string;
  courseName: string;
  /** Número de orden: es lo que direcciona al capítulo en la URL. */
  chapterOrder?: number;
  chapterName?: string;
  /** Nombre de la lección actual (no enlazada). */
  lessonName?: string;
}

/** Navegación contextual Curso → Capítulo → Lección. */
export function CourseNavigation({
  courseId,
  courseName,
  chapterOrder,
  chapterName,
  lessonName,
}: CourseNavigationProps) {
  return (
    <nav className="course-navigation" aria-label="Ruta del curso">
      <Link href={platformRoutes.courses} className="course-navigation__link">
        Mis cursos
      </Link>
      <span className="course-navigation__separator">/</span>
      <Link href={platformRoutes.courseDetail(courseId)} className="course-navigation__link">
        {courseName}
      </Link>
      {chapterOrder !== undefined && chapterName && (
        <>
          <span className="course-navigation__separator">/</span>
          <Link href={platformRoutes.chapterDetail(courseId, chapterOrder)} className="course-navigation__link">
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
