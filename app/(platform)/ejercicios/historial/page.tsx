import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ExerciseHistory } from "@/components/platform/sections/exercises/exercise-history/exercise-history.comp";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { sampleExerciseHistory } from "@/services/exercises/exercise-history.samples";

export const metadata: Metadata = {
  title: "Historial de ejercicios",
};

/**
 * «Historial» (D51, phase 6): every scored attempt of the student with its
 * result and, for a failure, the mistake; three filters narrow them. While
 * `EXERCISES_PERSISTENCE_ENABLED` is off the rows are a sample, so the front
 * can be tried; the service over the stored attempts comes with it. Behind
 * `EXERCISES_ENABLED`.
 */
export default async function ExerciseHistoryPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the student is the DAL's.
  await getCurrentUser();
  const now = new Date();
  const rows = sampleExerciseHistory(now);

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <Link href={platformRoutes.exerciseOverview} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Series y más
        </Link>
        <h1 className="platform-page__title">Historial</h1>
        <p className="platform-page__subtitle">
          Cada intento que contó: dónde lo hiciste, cómo te fue y, si fallaste, la jugada que era.
        </p>
      </header>
      <ExerciseHistory rows={rows} nowIso={now.toISOString()} sample />
    </div>
  );
}
