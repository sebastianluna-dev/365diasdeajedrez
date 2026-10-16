"use client";

import { useCallback, useState } from "react";
import type { ExerciseAuthoringExercise } from "./exercise-authoring.types";
import { initialDraft, solutionHasMoves, type ExerciseDraft } from "./exercise-draft";

/**
 * The exercise editor's lifted state (PLAN.md §4.2): the draft every tab
 * reads and writes, and the one change that asks first — a new position when
 * the solution already has moves, which would take them away. That change is
 * held (`pendingPosition`) until the author confirms it or cancels; a cancel
 * bumps `boardKey`, so the placement board, which already shows the change,
 * mounts again on the position that stays.
 */
export function useExerciseDraft(exercise: ExerciseAuthoringExercise) {
  const [draft, setDraft] = useState<ExerciseDraft>(() => initialDraft(exercise));
  const [pendingPosition, setPendingPosition] = useState<ExerciseDraft | null>(null);
  const [boardKey, setBoardKey] = useState(0);

  const update = useCallback((patch: Partial<ExerciseDraft>) => setDraft((current) => ({ ...current, ...patch })), []);

  /**
   * A draft with another position (and the solution that goes with it): set
   * at once, or held when it replaces a solution that has moves. Answers
   * whether it was held, for the host to ask.
   */
  const changePosition = useCallback(
    (next: ExerciseDraft): boolean => {
      if (next.solutionPgn !== draft.solutionPgn && solutionHasMoves(draft.solutionPgn)) {
        setPendingPosition(next);
        return true;
      }
      setDraft(next);
      return false;
    },
    [draft.solutionPgn],
  );

  const confirmPosition = useCallback(() => {
    if (pendingPosition) setDraft(pendingPosition);
    setPendingPosition(null);
  }, [pendingPosition]);

  const cancelPosition = useCallback(() => {
    setPendingPosition(null);
    setBoardKey((key) => key + 1);
  }, []);

  return { draft, update, changePosition, pendingPosition, confirmPosition, cancelPosition, boardKey };
}
