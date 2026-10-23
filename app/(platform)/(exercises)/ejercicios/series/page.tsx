import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ACADEMY_SERIES_VIEW, SERIES_VIEW_PARAM } from "@/components/platform/sections/exercises/exercises-nav.const";
import { ExerciseSeriesListSection } from "@/components/platform/sections/exercises/exercise-series-list.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentExercisesHome } from "@/services/exercises/exercises.service";

export const metadata: Metadata = {
  title: "Series de ejercicios",
};

interface ExerciseSeriesListPageProps {
  /** `?de=academia`: the academy's series instead of the teacher's. */
  searchParams: Promise<{ [SERIES_VIEW_PARAM]?: string | string[] }>;
}

/**
 * The series the student may solve (D17, D32): «De tu profesor», what their
 * teacher gave them, or, with `?de=academia`, «Series de la academia».
 * Switched off, it does not exist, by its URL either.
 */
export default async function ExerciseSeriesListPage({ searchParams }: ExerciseSeriesListPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const params = await searchParams;
  // Border of the private area: the service resolves the student in the DAL.
  const home = await getStudentExercisesHome();
  const view = params[SERIES_VIEW_PARAM] === ACADEMY_SERIES_VIEW ? "academy" : "teacher";

  return <ExerciseSeriesListSection home={home} view={view} />;
}
