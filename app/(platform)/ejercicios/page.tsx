import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExercisesHomeSection } from "@/components/platform/sections/exercises/exercises-home.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentExercisesHome } from "@/services/exercises/exercises.service";
import { getPracticeFilters } from "@/services/exercises/practice.service";

export const metadata: Metadata = {
  title: "Ejercicios",
};

/** «Ejercicios» (D17): what the student's teacher gave them and the academy's series. Switched off, it does not exist, by its URL either. */
export default async function ExercisesPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the service resolves the student in the DAL.
  const [home, practice] = await Promise.all([getStudentExercisesHome(), getPracticeFilters()]);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Resuelve las posiciones que te preparan, y las de la biblioteca: juegas tú y el rival responde.
        </p>
      </header>
      <ExercisesHomeSection home={home} practice={practice} />
    </div>
  );
}
