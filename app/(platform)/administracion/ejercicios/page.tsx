import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffExercisesSection } from "@/components/platform/sections/staff/exercises/staff-exercises.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getStaffExercises } from "@/services/staff-exercises/staff-exercises.service";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireStaff();
  return { title: "Ejercicios" };
}

interface StaffExercisesPageProps {
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

/** «Ejercicios» of the panel: the library (PLAN.md §8). Behind `EXERCISES_ENABLED`: off, it does not exist. */
export default async function StaffExercisesPage({ searchParams }: StaffExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  const { aviso, error } = await searchParams;
  const view = await getStaffExercises("biblioteca");

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          La biblioteca de la academia: lo que los alumnos practican por su cuenta y lo que cualquier profesor puede dar
          en una serie o en una clase. Entra en ella lo que apruebes de los profesores.
        </p>
      </header>
      <StaffExercisesSection
        view={view}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
