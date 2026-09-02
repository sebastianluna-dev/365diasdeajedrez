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
  /**
   * Qué tramo es la página actual: se pinta sin enlazar y cierra la ruta.
   * No se puede deducir de los datos que llegan —la vista de capítulo también
   * recibe sólo el curso, y ahí el curso SÍ enlaza—, así que se dice aparte.
   * La lección, cuando viene, siempre es el tramo actual.
   */
  current?: "course" | "chapter";
}

/** Navegación contextual Curso → Capítulo → Lección. */
export function CourseNavigation({
  courseId,
  courseName,
  chapterOrder,
  chapterName,
  lessonName,
  current,
}: CourseNavigationProps) {
  return (
    <nav className="course-navigation" aria-label="Ruta del curso">
      <Link href={platformRoutes.courses} className="course-navigation__link">
        Mis cursos
      </Link>
      <span className="course-navigation__separator">/</span>
      {current === "course" ? (
        <span className="course-navigation__current">{courseName}</span>
      ) : (
        <Link href={platformRoutes.courseDetail(courseId)} className="course-navigation__link">
          {courseName}
        </Link>
      )}
      {chapterOrder !== undefined && chapterName && (
        <>
          <span className="course-navigation__separator">/</span>
          {current === "chapter" ? (
            <span className="course-navigation__current">{chapterName}</span>
          ) : (
            <Link href={platformRoutes.chapterDetail(courseId, chapterOrder)} className="course-navigation__link">
              {chapterName}
            </Link>
          )}
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
