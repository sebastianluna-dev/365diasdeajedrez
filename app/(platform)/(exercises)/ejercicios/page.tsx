import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseTrainerSection } from "@/components/platform/sections/exercises/exercise-trainer.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getPracticeExercise, getPracticeFilters } from "@/services/exercises/practice.service";

export const metadata: Metadata = {
  title: "Ejercicios",
};

interface ExercisesPageProps {
  /** `tema` (a Topic code), `nivel` (a Level slug) and `tras` (the exercise just solved, which «Siguiente» skips). */
  searchParams: Promise<{ tema?: string; nivel?: string; tras?: string }>;
}

/** A query value as a code or an id: one word of the catalogs' shape, or nothing. */
function codeOf(raw: string | undefined): string | null {
  return raw && /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : null;
}

/**
 * «Ejercicios» (the Lichess-like trainer): it opens on the board, a random
 * library exercise of the topic chosen in the side column (any topic on
 * «Todos los temas», a topic with its subtopics otherwise) at the level of
 * the toolbar (any, or one band), the ones never solved first, with the
 * context PRACTICE (D18, D32). «Ejercicios por tema» was its own page until
 * 2026-10-23; its address now redirects here. Switched off, it does not
 * exist, by its URL either (the layout's check).
 */
export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { tema, nivel, tras } = await searchParams;
  const choice = { topicCode: codeOf(tema), levelSlug: codeOf(nivel) };
  // Border of the private area: the services resolve the student in the DAL.
  const [filters, serving] = await Promise.all([
    getPracticeFilters(),
    getPracticeExercise(choice, codeOf(tras), { open: true }),
  ]);

  return (
    <ExerciseTrainerSection
      serving={serving}
      filters={filters}
      topicCode={choice.topicCode}
      levelSlug={choice.levelSlug}
    />
  );
}
