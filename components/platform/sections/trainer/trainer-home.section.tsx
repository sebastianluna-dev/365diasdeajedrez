import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { toggleTrainerChapter } from "@/services/trainer/trainer.actions";
import { getTrainerData } from "@/services/trainer/trainer.service";
import type { TrainerChapterItem } from "@/services/trainer/trainer.types";
import "./trainer-home.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

function ChapterRow({ chapter }: { chapter: TrainerChapterItem }) {
  const toggleAction = toggleTrainerChapter.bind(null, chapter.chapterId, !chapter.inTrainer);

  return (
    <li className="platform-card trainer-home__row">
      <div className="trainer-home__row-info">
        <Link href={chapter.chapterHref} className="trainer-home__row-name">
          {chapter.chapterName}
        </Link>
        <p className="trainer-home__row-meta">
          {chapter.courseName} · {chapter.exerciseCount} ejercicios
        </p>
      </div>

      <div className="trainer-home__row-actions">
        {chapter.inTrainer && (
          <Link href={`${platformRoutes.trainer}?chapter=${chapter.chapterId}`} className="platform-button">
            Entrenar
          </Link>
        )}
        <form action={toggleAction}>
          <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Actualizando…">
            {chapter.inTrainer ? "Quitar" : "Agregar"}
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}

export async function TrainerHomeSection() {
  const { myChapters, availableChapters } = await getTrainerData();

  return (
    <div className="trainer-home">
      <div className="trainer-home__group">
        <div className="trainer-home__group-head">
          <h2 className="trainer-home__group-title">Mis capítulos de entrenamiento</h2>
          {myChapters.length > 0 && (
            <Link href={`${platformRoutes.trainer}?session=all`} className="platform-button">
              Entrenar todo
            </Link>
          )}
        </div>

        {myChapters.length > 0 ? (
          <ul className="trainer-home__list">
            {myChapters.map((chapter) => (
              <ChapterRow key={chapter.chapterId} chapter={chapter} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Todavía no agregas capítulos al entrenamiento"
            description="Agrega capítulos desde tus cursos o desde la lista de abajo."
          />
        )}
      </div>

      {availableChapters.length > 0 && (
        <div className="trainer-home__group">
          <h2 className="trainer-home__group-title">Capítulos entrenables</h2>
          <ul className="trainer-home__list">
            {availableChapters.map((chapter) => (
              <ChapterRow key={chapter.chapterId} chapter={chapter} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
