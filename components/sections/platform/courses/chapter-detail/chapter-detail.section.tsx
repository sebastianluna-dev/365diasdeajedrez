import { CourseNavigation } from "@/components/common/course-navigation.comp";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import { toggleTrainerChapter } from "@/services/trainer/trainer.actions";
import type { ChapterView } from "@/services/courses/courses.types";
import { LessonList } from "./lesson-list.comp";
import "./chapter-detail.section.css";

interface ChapterDetailSectionProps {
  chapter: ChapterView;
}

export function ChapterDetailSection({ chapter }: ChapterDetailSectionProps) {
  const toggleAction = toggleTrainerChapter.bind(null, chapter.id, !chapter.inTrainer);

  return (
    <section className="chapter-detail">
      <CourseNavigation courseSlug={chapter.courseSlug} courseName={chapter.courseName} />

      <header className="chapter-detail__head">
        <h1 className="platform-page__title">
          Capítulo {chapter.order}: {chapter.name}
        </h1>
        {chapter.description && <p className="platform-page__subtitle">{chapter.description}</p>}

        <p className="chapter-detail__meta">
          {chapter.totalLessons} lecciones
          {chapter.estimatedDuration ? ` · ${chapter.estimatedDuration} min estimados` : ""}
        </p>

        <div className="chapter-detail__progress">
          <ProgressIndicator
            percent={chapter.totalLessons === 0 ? 0 : (chapter.completedLessons / chapter.totalLessons) * 100}
            detail={`${chapter.completedLessons} de ${chapter.totalLessons} completadas`}
          />
        </div>

        {chapter.hasExercises && (
          <form action={toggleAction}>
            <button
              type="submit"
              className={`platform-button${chapter.inTrainer ? " platform-button_variant_secondary" : ""}`}
            >
              {chapter.inTrainer ? "Quitar del Move Trainer" : "Agregar al Move Trainer"}
            </button>
          </form>
        )}
      </header>

      <h2 className="chapter-detail__lessons-title">Lecciones</h2>
      <LessonList lessons={chapter.lessons} />
    </section>
  );
}
