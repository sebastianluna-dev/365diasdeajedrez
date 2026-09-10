import Link from "next/link";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
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

  const subtitle = [
    lesson.chapterName,
    `Lección ${lesson.order} de ${lesson.chapterLessonCount}`,
    lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="lesson-view">
      <LessonTracker lessonId={lesson.id} />

      <GameViewer
        pgn={lesson.pgn}
        orientation={lesson.orientation}
        // The lesson is READ: the running text accompanies the narrative, whereas
        // the table is for consulting a game move by move.
        moveList="flow"
        title={`${lesson.order}. ${lesson.name}`}
        // The subtitle carries everything that used to live above the board:
        // where the lesson sits within the chapter and how long it lasts.
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

      <div className="lesson-view__actions">
        {isCompleted ? (
          <p className="lesson-view__completed">
            <CheckIcon className="lesson-view__completed-icon" />
            Lección completada
          </p>
        ) : (
          <form action={completeAction}>
            <button type="submit" className="platform-button lesson-view__action">
              Marcar como completada
            </button>
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

        {/* The design does not draw it, but without this one can only go back
            with the browser button. Set apart on the right and understated. */}
        {lesson.prevLessonHref && (
          <Link href={lesson.prevLessonHref} className="lesson-view__back">
            ← Lección anterior
          </Link>
        )}
      </div>
    </section>
  );
}
