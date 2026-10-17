import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ExercisesHomeSection } from "@/components/platform/sections/exercises/exercises-home.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";
import { getStudentExercisesHome } from "@/services/exercises/exercises.service";
import { getPracticeFilters } from "@/services/exercises/practice.service";

export const metadata: Metadata = {
  title: "Series y más",
};

/**
 * «Series y más» (D17): what «Ejercicios» was before it opened on the board —
 * what the student's teacher gave them, the academy's series, and the way to
 * the other modes. Switched off, it does not exist, by its URL either.
 */
export default async function ExerciseOverviewPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the service resolves the student in the DAL.
  const [home, practice] = await Promise.all([getStudentExercisesHome(), getPracticeFilters()]);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <Link href={platformRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Ejercicios
        </Link>
        <h1 className="platform-page__title">Series y más</h1>
        <p className="platform-page__subtitle">
          Las series que te preparan y las de la academia, el contrarreloj y tu historial.
        </p>
      </header>
      <ExercisesHomeSection home={home} practice={practice} />
    </div>
  );
}
