import Link from "next/link";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { completeLesson } from "@/services/courses/courses.actions";
import type { LessonView } from "@/services/courses/courses.types";
import { LessonOutline } from "./lesson-outline.comp";
import { LessonTracker } from "./lesson-tracker.comp";
import "./lesson-view.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface LessonViewSectionProps {
  lesson: LessonView;
  /** What `completeLesson` bounced back with, in `?error=`. */
  errorCode?: string;
}

export function LessonViewSection({ lesson, errorCode }: LessonViewSectionProps) {
  const completeAction = completeLesson.bind(null, lesson.id);
  const errorMessage = studentErrorMessage(errorCode);
  const isCompleted = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

  // A lesson is not numbered, and it no longer names its chapter either: the
  // column on the left already says the course, the chapter and where in it
  // this lesson falls. What is left is how long it lasts.
  const subtitle = lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : undefined;

  return (
    <section className="lesson-view">
      <LessonTracker lessonId={lesson.id} />

      <LessonOutline
        courseName={lesson.courseName}
        courseHref={lesson.courseHref}
        courseThumbnail={lesson.courseThumbnail}
        chapterName={lesson.chapterName}
        chapterHref={lesson.chapterHref}
        lessons={lesson.chapterLessons}
        currentLessonId={lesson.id}
      />

      <div className="lesson-view__main">
        <GameViewer
          pgn={lesson.pgn}
          orientation={lesson.orientation}
          // The lesson is READ: the running text accompanies the narrative, whereas
          // the table is for consulting a game move by move.
          moveList="flow"
          title={lesson.name}
          subtitle={subtitle}
          description={lesson.description}
          badge={lesson.isPriority ? "Prioridad" : undefined}
          skip={
            lesson.nextLessonHref && (
              <Link
                href={lesson.nextLessonHref}
                className="lesson-view__skip"
                title="Pasar a la siguiente lección sin marcar esta"
              >
                Saltar
              </Link>
            )
          }
        />

        {errorMessage && <PlatformNotice message={errorMessage} />}

        <div className="lesson-view__actions">
          {isCompleted ? (
            <p className="lesson-view__completed">
              <CheckIcon className="lesson-view__completed-icon" />
              Lección completada
            </p>
          ) : (
            <form action={completeAction}>
              <SubmitButton className="platform-button lesson-view__action">Marcar como completada</SubmitButton>
            </form>
          )}

          {lesson.nextLessonHref ? (
            <Link
              href={lesson.nextLessonHref}
              className="platform-button platform-button_variant_secondary lesson-view__action"
            >
              Siguiente lección
              <ArrowRightIcon className="lesson-view__action-icon" />
            </Link>
          ) : (
            <Link
              href={lesson.chapterHref}
              className="platform-button platform-button_variant_secondary lesson-view__action"
            >
              Volver al capítulo
            </Link>
          )}

          {lesson.trainerHref && (
            <Link
              href={lesson.trainerHref}
              className="platform-button platform-button_variant_secondary lesson-view__action"
            >
              Entrenar esta lección ({lesson.exerciseCount})
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
