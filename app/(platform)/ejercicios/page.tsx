import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseTrainerSection } from "@/components/platform/sections/exercises/exercise-trainer.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";
import { getPracticeExercise } from "@/services/exercises/practice.service";

export const metadata: Metadata = {
  title: "Ejercicios",
};

interface ExercisesPageProps {
  /** `tras`: the exercise just solved, which «Siguiente» skips. */
  searchParams: Promise<{ tras?: string }>;
}

/** A query value as an id: one word, or nothing. */
function idOf(raw: string | undefined): string | null {
  return raw && /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : null;
}

/**
 * «Ejercicios» (the Lichess-like trainer): it opens on the board, a random
 * library exercise of any topic and level, the ones never solved first, with
 * the context PRACTICE. The series and the other modes are one link away
 * («Series y más»). Switched off, it does not exist, by its URL either.
 */
export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { tras } = await searchParams;
  // Border of the private area: the service resolves the student in the DAL.
  const serving = await getPracticeExercise({ topicCode: null, levelSlug: null }, idOf(tras), { open: true });

  if (serving.kind !== "exercise") {
    return (
      <div className="platform-page">
        <header className="platform-page__head">
          <h1 className="platform-page__title">Ejercicios</h1>
        </header>
        <EmptyState
          title="La biblioteca aún no tiene ejercicios."
          description="Mientras tanto, resuelve las series que te preparan."
        />
        <Link href={platformRoutes.exerciseOverview} className="platform-button platform-button_variant_accent">
          Ver tus series
        </Link>
      </div>
    );
  }
  return (
    <div className="platform-page platform-page_width_full platform-page_height_screen">
      <ExerciseTrainerSection serving={serving} topic={null} levelSlug={null} />
    </div>
  );
}
