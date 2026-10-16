"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playMoveSound } from "@/components/chess/game-viewer/move-sound";
import { getViewerPreferences } from "@/components/chess/game-viewer/viewer-preferences";
import { readSolution } from "@/lib/chess/exercise-solver";
import {
  isCaptureAt,
  isSessionOver,
  reduceSession,
  sessionSubmission,
  startSession,
  type SolverAction,
  type SolverSession,
} from "./exercise-solver-session";
import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverMode,
  SubmitExerciseAttempt,
} from "./exercise-solver.types";

// The solve screen's behaviour over the pure session (exercise-solver-session.ts):
// the timers — the opponent's reply after 450 ms with its sound, the wrong
// move taken back after 600 ms, the solution's walk at 900 ms a step (not
// under reduced motion), the clock — and the one submit, sent from the event
// that decides the attempt (a wrong move, «Ver la solución», the last move;
// D19, D20), so leaving the page cannot hide a failure.

/** The trainer's pause before the opponent answers. */
export const OPPONENT_REPLY_MS = 450;
/** How long a wrong move stays on the board before it is taken back. */
export const WRONG_MOVE_MS = 600;
/** «Ver la solución»'s autoplay, a step at a time. */
export const WALKTHROUGH_STEP_MS = 900;

/**
 * How the submit went: nothing sent; on its way; stored; stored nothing
 * because the exercise was attempted today; or not stored at all.
 */
export type SolverSaveState = "idle" | "saving" | "saved" | "notScored" | "failed";

export interface UseExerciseSolverOptions {
  exercise: ExerciseSolverExercise;
  mode: ExerciseSolverMode;
  context?: ExerciseSolverContext;
  submit?: SubmitExerciseAttempt;
}

export interface ExerciseSolverControls {
  /** Null when the solution does not read: there is nothing to solve. */
  session: SolverSession | null;
  elapsedMs: number;
  save: SolverSaveState;
  /** «Ver la solución» is walking on by itself. */
  autoplay: boolean;
  move: (san: string) => void;
  hint: () => void;
  showSolution: () => void;
  step: (to: number) => void;
  toggleAutoplay: () => void;
  retry: () => void;
}

/** A state update that applies an action the timers take: the reply, the flash's end, a step of the walk. */
const after = (action: SolverAction) => (current: SolverSession | null) =>
  current ? reduceSession(current, action) : current;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useExerciseSolver({
  exercise,
  mode,
  context,
  submit,
}: UseExerciseSolverOptions): ExerciseSolverControls {
  const solution = useMemo(
    () =>
      readSolution({
        solutionPgn: exercise.solutionPgn,
        kind: exercise.kind,
        mateIn: exercise.mateIn,
        hints: exercise.hints,
      }),
    [exercise.solutionPgn, exercise.kind, exercise.mateIn, exercise.hints],
  );
  const [session, setSession] = useState<SolverSession | null>(() => (solution ? startSession(solution, mode) : null));
  const [save, setSave] = useState<SolverSaveState>("idle");
  const [autoplay, setAutoplay] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  /** When the board was first on screen: set after mount, never during the server's render. */
  const startedAtRef = useRef<number | null>(null);

  const over = session ? isSessionOver(session) : true;
  const waiting = session?.waiting ?? null;
  const walkthrough = session?.walkthrough ?? null;
  const walking = autoplay && walkthrough !== null && walkthrough.shown < walkthrough.steps.length;

  // The clock counts up from the first paint and stops when it is over (D21).
  useEffect(() => {
    startedAtRef.current ??= Date.now();
    if (over) return;
    const timer = window.setInterval(() => {
      if (startedAtRef.current !== null) setElapsedMs(Date.now() - startedAtRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [over]);

  // The opponent's reply, after a pause and with its sound.
  const replyPath = waiting === "reply" ? (session?.solve.path ?? null) : null;
  useEffect(() => {
    if (replyPath === null || !solution) return;
    const timer = window.setTimeout(() => {
      setSession(after({ type: "replyShown" }));
      if (getViewerPreferences().sound) playMoveSound(isCaptureAt(solution, replyPath) ? "capture" : "move");
    }, OPPONENT_REPLY_MS);
    return () => window.clearTimeout(timer);
  }, [replyPath, solution]);

  // The wrong move is seen for a moment and taken back.
  useEffect(() => {
    if (waiting !== "flash") return;
    const timer = window.setTimeout(() => setSession(after({ type: "flashOver" })), WRONG_MOVE_MS);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  // «Ver la solución» walks on by itself, a step at a time, until a ‹ › takes over.
  const walkedTo = walking ? (walkthrough?.shown ?? 0) : null;
  useEffect(() => {
    if (walkedTo === null) return;
    const timer = window.setTimeout(() => setSession(after({ type: "step", to: walkedTo + 1 })), WALKTHROUGH_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [walkedTo]);

  /** Applies a student's action; the one that decides the attempt sends it. */
  const apply = (action: SolverAction) => {
    if (!session) return;
    const next = reduceSession(session, action);
    if (next === session) return;
    setSession(next);
    const decided = sessionSubmission(next);
    if (!decided || sessionSubmission(session) || next.mode !== "solve" || !submit || !context) return;
    setSave("saving");
    submit({
      exerciseId: exercise.id,
      context: context.attempt,
      moves: decided.moves,
      hintsUsed: decided.hintsUsed,
      solutionShown: decided.solutionShown,
      durationMs: startedAtRef.current === null ? 0 : Date.now() - startedAtRef.current,
    })
      .then((reply) => setSave(reply.ok ? (reply.scored ? "saved" : "notScored") : "failed"))
      .catch(() => setSave("failed"));
  };

  return {
    session,
    elapsedMs,
    save,
    autoplay: walking,
    move: (san) => apply({ type: "move", san }),
    hint: () => apply({ type: "hint" }),
    showSolution: () => {
      apply({ type: "showSolution" });
      setAutoplay(!prefersReducedMotion());
    },
    step: (to) => {
      setAutoplay(false);
      apply({ type: "step", to });
    },
    toggleAutoplay: () => {
      // Pressed at the end, it starts the walk again from the beginning.
      if (!walking && walkthrough && walkthrough.shown >= walkthrough.steps.length) apply({ type: "step", to: 0 });
      setAutoplay(!walking);
    },
    retry: () => {
      apply({ type: "retry" });
      setAutoplay(false);
      setElapsedMs(0);
      startedAtRef.current = Date.now();
    },
  };
}
