import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StormRunner } from "@/components/platform/sections/exercises/storm-runner/storm-runner.comp";
import { SAMPLE_EXERCISES } from "@/constants/platform/exercise-samples.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { buildStormDeck, STORM_DECK_SHAPE } from "@/lib/exercises/storm-deck";
import { getCurrentUser } from "@/lib/platform-auth/current-user";

export const metadata: Metadata = {
  title: "Puzzle Rush",
};

/**
 * «Puzzle Rush», the contrarreloj (D21, D34, phase 7): a deck of increasing
 * difficulty against three or five minutes or until the third mistake, the
 * best scores kept. While `EXERCISES_PERSISTENCE_ENABLED` is off the deck is
 * dealt from the sample exercises and nothing is recorded (the browser keeps
 * the scores); the run's table and its service come with it. Behind `EXERCISES_ENABLED`.
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
    <div className="platform-page platform-page_width_full platform-page_height_screen">
      <StormRunner deck={deck} />
    </div>
  );
}
