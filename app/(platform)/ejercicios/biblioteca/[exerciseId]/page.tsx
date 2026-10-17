import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseTrainerSection } from "@/components/platform/sections/exercises/exercise-trainer.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getLibraryExerciseToSolve } from "@/services/exercises/practice.service";

interface LibraryExercisePageProps {
  params: Promise<{ exerciseId: string }>;
}

export async function generateMetadata({ params }: LibraryExercisePageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { exerciseId } = await params;
  const serving = await getLibraryExerciseToSolve(exerciseId);
  return serving?.kind === "exercise" ? { title: serving.exercise.title } : {};
}

/**
 * One library exercise again, where a pill of «Esta sesión» goes: the same
 * board, unscored when it was tried today (§2.7), and «Siguiente ejercicio»
 * back to «Ejercicios». Not in the library, it is a 404.
 */
export default async function LibraryExercisePage({ params }: LibraryExercisePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { exerciseId } = await params;
  const serving = await getLibraryExerciseToSolve(exerciseId);
  if (serving?.kind !== "exercise") notFound();

  return (
    <div className="platform-page platform-page_width_full platform-page_height_screen">
      <ExerciseTrainerSection serving={serving} topic={null} levelSlug={null} />
    </div>
  );
}
