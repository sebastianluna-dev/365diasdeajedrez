import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExercisesHomeSection } from "@/components/platform/sections/exercises/exercises-home.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentExercisesHome } from "@/services/exercises/exercises.service";

export const metadata: Metadata = {
  title: "Ejercicios",
};

/** «Ejercicios» (D17): what the student's teacher gave them. Switched off, it does not exist, by its URL either. */
export default async function ExercisesPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the service resolves the student in the DAL.
  const home = await getStudentExercisesHome();

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Resuelve las posiciones que te preparan: juegas tú y el rival responde.
        </p>
      </header>
      <ExercisesHomeSection home={home} />
    </div>
  );
}
