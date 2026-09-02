import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import type { ChapterView } from "@/services/courses/courses.types";
import { toggleTrainerChapter } from "@/services/trainer/trainer.actions";
import { LessonList } from "./lesson-list.comp";
import "./chapter-detail.section.css";

interface ChapterDetailSectionProps {
  chapter: ChapterView;
}

export function ChapterDetailSection({ chapter }: ChapterDetailSectionProps) {
  const toggleAction = toggleTrainerChapter.bind(null, chapter.id, !chapter.inTrainer);
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

            {/* El diseño no dibuja este botón, pero el Move Trainer se alcanza
                desde aquí y desde ningún otro sitio: se queda al lado del
                principal, en secundario para no competir con él. */}
            {chapter.hasExercises && (
              <form action={toggleAction}>
                <button type="submit" className="platform-button platform-button_variant_secondary">
                  {chapter.inTrainer ? "Quitar del Move Trainer" : "Agregar al Move Trainer"}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <h2 className="chapter-detail__lessons-title">Lecciones</h2>
      <LessonList lessons={chapter.lessons} />
    </section>
  );
}
