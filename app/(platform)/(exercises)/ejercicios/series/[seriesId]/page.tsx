import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseSeriesSection } from "@/components/platform/sections/exercises/exercise-series.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentExercisesHome, getStudentSeries } from "@/services/exercises/exercises.service";

interface ExerciseSeriesPageProps {
  params: Promise<{ seriesId: string }>;
}

export async function generateMetadata({ params }: ExerciseSeriesPageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { seriesId } = await params;
  const series = await getStudentSeries(seriesId);
  return series ? { title: series.title } : {};
}

/** A series given to the student (§5.2). One they may not open — another's, or a former teacher's — is a 404. */
export default async function ExerciseSeriesPage({ params }: ExerciseSeriesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { seriesId } = await params;
  // The home is the side column's too, read once per request: it says whose the series is.
  const [series, home] = await Promise.all([getStudentSeries(seriesId), getStudentExercisesHome()]);
  if (!series) notFound();

  return (
    <ExerciseSeriesSection
      series={series}
      academy={home.academySeries.some((candidate) => candidate.id === seriesId)}
    />
  );
}
