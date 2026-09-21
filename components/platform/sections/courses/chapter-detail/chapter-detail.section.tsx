import { PriorityFilter } from "@/components/platform/shared/priority-filter.comp";
import Link from "next/link";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator.comp";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { ChapterView } from "@/services/courses/courses.types";
import { toggleTrainerChapter } from "@/services/trainer/trainer.actions";
import { LessonList } from "./lesson-list.comp";
import "./chapter-detail.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface ChapterDetailSectionProps {
  chapter: ChapterView;
  /** What the trainer toggle or the essential-lessons switch bounced back with. */
  errorCode?: string;
}

export function ChapterDetailSection({ chapter, errorCode }: ChapterDetailSectionProps) {
  const toggleAction = toggleTrainerChapter.bind(null, chapter.id, !chapter.inTrainer);
  const chapterHref = platformRoutes.chapterDetail(chapter.courseId, chapter.order);
  const errorMessage = studentErrorMessage(errorCode);
  const percent = chapter.totalLessons === 0 ? 0 : (chapter.completedLessons / chapter.totalLessons) * 100;

  return (
    <section className="chapter-detail">
      <header className="chapter-detail__head">
        <p className="chapter-detail__eyebrow">Capítulo {chapter.order}</p>
        <h1 className="chapter-detail__name">{chapter.name}</h1>
        {chapter.description && <p className="chapter-detail__description">{chapter.description}</p>}

        <p className="chapter-detail__meta">
          {chapter.totalLessons} {chapter.totalLessons === 1 ? "lección" : "lecciones"}
          {chapter.estimatedDuration ? (
            <>
              <span className="chapter-detail__dot"> · </span>
              {chapter.estimatedDuration} min estimados
            </>
          ) : null}
        </p>

        <div className="chapter-detail__resume">
          <div className="chapter-detail__progress">
            <ProgressIndicator
              layout="stacked"
              percent={percent}
              detail={`${chapter.completedLessons} de ${chapter.totalLessons} completadas`}
            />
          </div>

          <div className="chapter-detail__actions">
            {chapter.totalLessons > 0 && (
              <Link href={chapter.continueHref} className="platform-button chapter-detail__cta">
                {chapter.ctaLabel} capítulo
              </Link>
            )}

            {/* The design does not draw this button, but the Move Trainer is reached
                from here and from nowhere else: it stays next to the primary one,
                as secondary so as not to compete with it. */}
            {chapter.hasExercises && (
              <form action={toggleAction}>
                <input type="hidden" name="returnTo" value={chapterHref} />
                <SubmitButton
                  className="platform-button platform-button_variant_secondary"
                  pendingLabel="Actualizando…"
                >
                  {chapter.inTrainer ? "Quitar del Move Trainer" : "Agregar al Move Trainer"}
                </SubmitButton>
              </form>
            )}
          </div>
        </div>

        {errorMessage && <PlatformNotice message={errorMessage} />}
      </header>

      <div className="chapter-detail__lessons-head">
        <h2 className="chapter-detail__lessons-title">Lecciones</h2>
        <PriorityFilter
          courseId={chapter.courseId}
          enabled={chapter.onlyPriorityLessons}
          hiddenLessons={chapter.hiddenLessons}
          returnTo={chapterHref}
        />
      </div>

      {chapter.lessons.length === 0 && chapter.onlyPriorityLessons ? (
        <p className="chapter-detail__warning">
          Este capítulo no tiene ninguna lección marcada como imprescindible. Quita el filtro para ver las{" "}
          {chapter.hiddenLessons} que tiene.
        </p>
      ) : (
        <LessonList lessons={chapter.lessons} />
      )}
    </section>
  );
}
