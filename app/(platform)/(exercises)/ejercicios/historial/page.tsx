import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseHistory } from "@/components/platform/sections/exercises/exercise-history/exercise-history.comp";
import { ExercisesToolbar } from "@/components/platform/sections/exercises/exercises-toolbar.comp";
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
 * `EXERCISES_ENABLED`. On the panel of «Ejercicios» (the new design system,
 * 2026-10-23), under its toolbar.
 */
export default async function ExerciseHistoryPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the student is the DAL's.
  await getCurrentUser();
  const now = new Date();
  const rows = sampleExerciseHistory(now);

  return (
    <section className="platform-workspace__panel">
      <ExercisesToolbar
        trail={[{ label: "Ejercicios", href: platformRoutes.exercises }, { label: "Historial" }]}
        summary="Cada intento que contó, con su resultado y, si fallaste, la jugada que era."
      />
      <ExerciseHistory rows={rows} nowIso={now.toISOString()} sample />
    </section>
  );
}
