import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./course-navigation.comp.css";

interface CourseNavigationProps {
  courseId: string;
  courseName: string;
  /** Order number: it is what addresses the chapter in the URL. */
  chapterOrder?: number;
  chapterName?: string;
  /** Name of the current lesson (not linked). */
  lessonName?: string;
  /**
   * Which crumb is the current page: it is rendered without a link and closes the trail.
   * It cannot be deduced from the incoming data — the chapter view also
   * receives only the course, and there the course DOES link — so it is stated separately.
   * The lesson, when present, is always the current crumb.
   */
  current?: "course" | "chapter";
}

/** Contextual navigation Course → Chapter → Lesson. */
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
