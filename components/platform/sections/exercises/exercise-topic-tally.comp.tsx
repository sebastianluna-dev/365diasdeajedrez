"use client";

import { useExerciseRating } from "@/components/platform/shared/exercise-solver/exercise-rating.store";

interface ExerciseTopicTallyProps {
  /** The topic on screen, by its code. */
  code: string;
}

/**
 * «72 % de acierto · 18 resueltos»: what the student solved of the topic on
 * screen, as this browser keeps it (sample data while the rating has no
 * table, `exercise-rating.store.ts`). Client, because that is where it lives.
 */
export function ExerciseTopicTally({ code }: ExerciseTopicTallyProps) {
  const tally = useExerciseRating().topics[code];
  const share = tally && tally.attempts > 0 ? `${Math.round((tally.passed / tally.attempts) * 100)} %` : "—";
  return (
    <p className="exercises-toolbar__summary">
      {share} de acierto · {tally?.passed ?? 0} {tally?.passed === 1 ? "resuelto" : "resueltos"}
    </p>
  );
}
