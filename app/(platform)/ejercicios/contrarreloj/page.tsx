import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { StormRunner } from "@/components/platform/sections/exercises/storm-runner/storm-runner.comp";
import { SAMPLE_EXERCISES } from "@/constants/platform/exercise-samples.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { buildStormDeck, STORM_DECK_SHAPE } from "@/lib/exercises/storm-deck";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";

export const metadata: Metadata = {
  title: "Contrarreloj",
};

/**
 * «Contrarreloj» (D21, D34, phase 7): three minutes over a deck of increasing
 * difficulty, over at the third mistake, the best score kept. While
 * `EXERCISES_PERSISTENCE_ENABLED` is off the deck is dealt from the sample
 * exercises and nothing is recorded (the browser keeps the best score); the
 * run's table and its service come with it. Behind `EXERCISES_ENABLED`.
 */
export default async function ExerciseStormPage() {
  if (!EXERCISES_ENABLED) notFound();
  // Border of the private area: the student is the DAL's.
  await getCurrentUser();
  const ids = buildStormDeck(SAMPLE_EXERCISES, STORM_DECK_SHAPE, Math.random);
  const deck = ids.flatMap((id) => {
    const exercise = SAMPLE_EXERCISES.find((candidate) => candidate.id === id);
    return exercise ? [exercise] : [];
  });

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <Link href={platformRoutes.exerciseOverview} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Series y más
        </Link>
        <h1 className="platform-page__title">Contrarreloj</h1>
      </header>
      <StormRunner deck={deck} bestScore={null} sample />
    </div>
  );
}
