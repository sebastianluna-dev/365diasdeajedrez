import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseSolveSection } from "@/components/platform/sections/exercises/exercise-solve.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentSeriesExercise } from "@/services/exercises/exercises.service";

interface ExerciseSeriesItemPageProps {
  params: Promise<{ seriesId: string; n: string }>;
}

/** The segment `[n]`, as the 1-based position it is; anything else is no position. */
function positionOf(n: string): number {
  return /^\d{1,4}$/.test(n) ? Number.parseInt(n, 10) : 0;
}

export async function generateMetadata({ params }: ExerciseSeriesItemPageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { seriesId, n } = await params;
  const item = await getStudentSeriesExercise(seriesId, positionOf(n));
  return item ? { title: `${item.exercise.title} · ${item.series.title}` } : {};
}

/**
 * The n-th exercise of a series given to the student, to solve (§5.3). Out of range, or not theirs, it is a 404.
 * The panel's toolbar names the exercise (its h1, read out) and where it is in the series.
 */
export default async function ExerciseSeriesItemPage({ params }: ExerciseSeriesItemPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { seriesId, n } = await params;
  const item = await getStudentSeriesExercise(seriesId, positionOf(n));
  if (!item) notFound();

  return <ExerciseSolveSection item={item} />;
}
