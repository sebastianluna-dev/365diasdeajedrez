import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewSeriesButton } from "@/components/platform/sections/teacher/exercises/series-data-popup/series-data-popup.comp";
import { StaffExercisesSection } from "@/components/platform/sections/staff/exercises/staff-exercises.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { createAcademySeries } from "@/services/staff-exercises/staff-exercises.actions";
import { getStaffExercises } from "@/services/staff-exercises/staff-exercises.service";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireStaff();
  return { title: "Series de la academia" };
}

interface StaffSeriesPageProps {
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

/** «Series»: the academy's series, which every student sees once published (PLAN.md §8, D32). Behind `EXERCISES_ENABLED`. */
export default async function StaffSeriesPage({ searchParams }: StaffSeriesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  const { aviso, error } = await searchParams;
  const view = await getStaffExercises("series");

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Las series de la academia: listas ordenadas de ejercicios de la biblioteca que todos los alumnos ven en
          «Ejercicios» al publicarlas.
        </p>
        <div className="platform-page__actions">
          <NewSeriesButton save={createAcademySeries} />
        </div>
      </header>
      <StaffExercisesSection
        view={view}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
