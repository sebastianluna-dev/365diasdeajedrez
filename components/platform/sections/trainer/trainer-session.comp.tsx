"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ATTEMPT_RESULT, EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { applySan } from "@/lib/chess/replay";
import { platformRoutes } from "@/lib/platform-routes";
import { recordTrainingAttempt } from "@/services/trainer/trainer.actions";
import type { TrainerExercise } from "@/services/trainer/trainer.types";
import { SessionSummary, type ExerciseResult } from "./session-summary.comp";
import "./trainer-session.comp.css";

interface TrainerSessionProps {
  exercises: TrainerExercise[];
}

const OPPONENT_REPLY_MS = 450;
const FEEDBACK_MS = 1600;

/** Compares SAN ignoring check/mate suffixes and quality signs. */
function normalizeSan(san: string): string {
  return san.replace(/[+#!?]+$/g, "");
}

interface Feedback {
  kind: "ok" | "error" | "info";
  text: string;
}

export function TrainerSession({ exercises }: TrainerSessionProps) {
  const [index, setIndex] = useState(0);
  const [fen, setFen] = useState(exercises[0]?.startFen ?? "");
  const [plyIndex, setPlyIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const startedAtRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const exercise = exercises[index];

  useEffect(() => {
    startedAtRef.current = Date.now();
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  // The page only renders the session with at least one exercise; this keeps
  // the type honest without a non-null assertion.
  if (!exercise) return null;

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const showFeedback = (next: Feedback) => {
    setFeedback(next);
    schedule(() => setFeedback((current) => (current === next ? null : current)), FEEDBACK_MS);
  };

  const loadExercise = (nextIndex: number) => {
    const next = exercises[nextIndex];
    if (!next) return;
    setIndex(nextIndex);
    setFen(next.startFen);
    setPlyIndex(0);
    setMistakes(0);
    setFeedback(null);
    startedAtRef.current = Date.now();
  };

  const finishExercise = (passed: boolean, finalMistakes: number) => {
    // The attempt is recorded on the server (the action resolves the user). The
    // session goes on without waiting; what did not get stored is counted for
    // the summary.
    recordTrainingAttempt({
      exerciseId: exercise.id,
      resultCode: passed ? ATTEMPT_RESULT.PASSED : ATTEMPT_RESULT.FAILED,
      mistakes: finalMistakes,
      durationMs: Date.now() - startedAtRef.current,
    })
      .then((saved) => {
        if (!saved) setUnsavedCount((current) => current + 1);
      })
      .catch(() => setUnsavedCount((current) => current + 1));
    setResults((current) => [
      ...current,
      { exerciseId: exercise.id, lessonName: exercise.lessonName, passed, mistakes: finalMistakes },
    ]);

    if (index + 1 < exercises.length) {
      schedule(() => loadExercise(index + 1), passed ? FEEDBACK_MS : 400);
    } else {
      schedule(() => setFinished(true), passed ? FEEDBACK_MS : 400);
    }
  };

  const handleMove = (san: string) => {
    const expected = exercise.lineSans[plyIndex];
    if (!expected || finished) return;

    if (normalizeSan(san) !== normalizeSan(expected)) {
      setMistakes((current) => current + 1);
      showFeedback({ kind: "error", text: "Esa no es la jugada. Inténtalo de nuevo." });
      return;
    }

    const afterUser = applySan(fen, expected);
    if (!afterUser) return;
    setFen(afterUser);

    if (exercise.modeCode === EXERCISE_MODE.FIND_MOVE || plyIndex + 1 >= exercise.lineSans.length) {
      showFeedback({ kind: "ok", text: "¡Correcto! Ejercicio superado." });
      finishExercise(true, mistakes);
      return;
    }

    showFeedback({ kind: "ok", text: "¡Correcto!" });
    const replySan = exercise.lineSans[plyIndex + 1];
    if (replySan === undefined) return;
    const nextPly = plyIndex + 2;
    setPlyIndex(nextPly);

    schedule(() => {
      const afterReply = applySan(afterUser, replySan);
      if (!afterReply) return;
      setFen(afterReply);
      if (nextPly >= exercise.lineSans.length) {
        showFeedback({ kind: "ok", text: "¡Línea completada!" });
        finishExercise(true, mistakes);
      }
    }, OPPONENT_REPLY_MS);
  };

  if (finished) {
    return <SessionSummary results={results} unsavedCount={unsavedCount} />;
  }

  return (
    <div className="trainer-session">
      <div className="trainer-session__status">
        <span className="platform-tag platform-tag_variant_accent">
          Ejercicio {index + 1} de {exercises.length}
        </span>
        <span className="trainer-session__lesson">
          {exercise.chapterName} · {exercise.lessonName}
        </span>
        <span className="trainer-session__color">
          Juegas con {exercise.userColor === "white" ? "blancas" : "negras"}
        </span>
        {exercise.isStale && (
          <span
            className="platform-tag trainer-session__stale"
            title="La lección se editó después de crear este ejercicio"
          >
            Desactualizado
          </span>
        )}
      </div>

      {exercise.promptText && <p className="trainer-session__prompt">{exercise.promptText}</p>}

      <div className="trainer-session__board">
        <ChessBoard position={{ fen }} interactive onMove={handleMove} flipBoard={exercise.userColor === "black"} />
      </div>

      <div className="trainer-session__feedback-area" aria-live="polite">
        {feedback && (
          <p className={`trainer-session__feedback trainer-session__feedback_kind_${feedback.kind}`}>{feedback.text}</p>
        )}
      </div>

      <div className="trainer-session__actions">
        <span className="trainer-session__mistakes">Errores: {mistakes}</span>
        <button
          type="button"
          onClick={() => finishExercise(false, mistakes)}
          className="platform-button platform-button_variant_secondary"
        >
          Rendirse
        </button>
        <Link href={platformRoutes.trainer} className="trainer-session__exit">
          Terminar sesión
        </Link>
      </div>
    </div>
  );
}
