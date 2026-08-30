import type { Metadata } from "next";
import { EmptyState } from "@/components/common/empty-state.comp";
import { TrainerHomeSection } from "@/components/sections/platform/trainer/trainer-home.section";
import { TrainerSession } from "@/components/sections/platform/trainer/trainer-session.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getTrainerSession } from "@/services/trainer/trainer.service";
import "./trainer-page.css";

export const metadata: Metadata = {
  title: "Move Trainer",
};

interface TrainerPageProps {
  searchParams: Promise<{ lesson?: string; chapter?: string; session?: string }>;
}

export default async function TrainerPage({ searchParams }: TrainerPageProps) {
  const { lesson, chapter, session } = await searchParams;
  const wantsSession = Boolean(lesson || chapter || session === "all");

  if (wantsSession) {
    const exercises = await getTrainerSession({ lessonId: lesson, chapterId: chapter });

    return (
      <div className="platform-page trainer-page">
        <header className="platform-page__head">
          <h1 className="platform-page__title">Move Trainer</h1>
        </header>

        {exercises.length > 0 ? (
          <TrainerSession exercises={exercises} />
        ) : (
          <EmptyState
            title="No hay ejercicios para entrenar"
            description="La selección no tiene ejercicios disponibles."
            actionLabel="Volver al Move Trainer"
            actionHref={platformRoutes.trainer}
          />
        )}
      </div>
    );
  }

  return (
    <div className="platform-page trainer-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Move Trainer</h1>
        <p className="platform-page__subtitle">
          Entrena las líneas de tus cursos: carga una posición, juega la jugada correcta y avanza.
        </p>
      </header>

      <TrainerHomeSection />
    </div>
  );
}
