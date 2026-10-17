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
  return { title: "Ejercicios en revisión" };
}

interface StaffExercisesReviewPageProps {
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

/** «En revisión»: the teachers' proposals, the oldest first (PLAN.md §8). Behind `EXERCISES_ENABLED`. */
export default async function StaffExercisesReviewPage({ searchParams }: StaffExercisesReviewPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  const { aviso, error } = await searchParams;
  const view = await getStaffExercises("revision");

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Las propuestas de los profesores, la más antigua primero. Abre una, pruébala en «Probar» y apruébala o
          devuélvela con una nota.
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
