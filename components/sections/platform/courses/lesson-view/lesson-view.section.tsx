import Link from "next/link";
import { CourseNavigation } from "@/components/common/course-navigation.comp";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { completeLesson } from "@/services/courses/courses.actions";
import type { LessonView } from "@/services/courses/courses.types";
import { LessonTracker } from "./lesson-tracker.comp";
import "./lesson-view.section.css";

interface LessonViewSectionProps {
  lesson: LessonView;
}

export function LessonViewSection({ lesson }: LessonViewSectionProps) {
  const completeAction = completeLesson.bind(null, lesson.id);
  const isCompleted = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

  return (
    <section className="lesson-view">
      <LessonTracker lessonId={lesson.id} />

      <CourseNavigation
        courseSlug={lesson.courseSlug}
        courseName={lesson.courseName}
        chapterSlug={lesson.chapterSlug}
        chapterName={lesson.chapterName}
        lessonName={lesson.name}
      />

      <header className="lesson-view__head">
        <h1 className="platform-page__title">
          {lesson.order}. {lesson.name}
          {lesson.isPriority && <span className="platform-tag platform-tag_variant_accent lesson-view__priority">Clave</span>}
        </h1>
        {lesson.description && <p className="platform-page__subtitle">{lesson.description}</p>}
      </header>

      <GameViewer pgn={lesson.pgn} orientation={lesson.orientation} />

      <div className="lesson-view__actions">
        {isCompleted ? (
          <span className="platform-tag lesson-view__completed">Lección completada ✓</span>
        ) : (
          <form action={completeAction}>
            <button type="submit" className="platform-button">
              Marcar como completada
            </button>
          </form>
        )}

        {lesson.trainerHref && (
          <Link href={lesson.trainerHref} className="platform-button platform-button_variant_secondary">
            Entrenar esta lección ({lesson.exerciseCount})
          </Link>
        )}
      </div>

      <nav className="lesson-view__pager" aria-label="Navegación entre lecciones">
        {lesson.prevLessonHref ? (
          <Link href={lesson.prevLessonHref} className="lesson-view__pager-link">
            ← Lección anterior
          </Link>
        ) : (
          <span />
        )}
        {lesson.nextLessonHref ? (
          <Link href={lesson.nextLessonHref} className="lesson-view__pager-link">
            Siguiente lección →
          </Link>
        ) : (
          <Link href={lesson.chapterHref} className="lesson-view__pager-link">
            Volver al capítulo
          </Link>
        )}
      </nav>
    </section>
  );
}
