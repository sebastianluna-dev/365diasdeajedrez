"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { useExerciseSolver } from "@/components/platform/shared/exercise-solver/use-exercise-solver.hook";
import { canMove, isSessionOver } from "@/components/platform/shared/exercise-solver/exercise-solver-session";
import type { ExerciseSolverExercise } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { defaultExercisePrompt } from "@/lib/chess/exercise-labels";
import { STORM_DURATION_MS, STORM_MAX_MISTAKES } from "@/lib/exercises/storm-deck";
import { platformRoutes } from "@/lib/platform-routes";
import "./storm-runner.comp.css";

export interface StormRunnerProps {
  /** The run's exercises, in the order they are dealt (`buildStormDeck`). */
  deck: ExerciseSolverExercise[];
  /** The best score so far, as the server stores it; null while nothing persists (the browser keeps it then). */
  bestScore: number | null;
  /** While nothing persists, the best score lives in the browser and the page says so. */
  sample?: boolean;
}

/** The browser's memory of the best score while nothing persists. */
const BEST_SCORE_KEY = "exercises:storm:best";

const BEST_SCORE_EVENT = "exercises:storm:best";

function readBrowserBest(): number | null {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    return raw && /^\d+$/.test(raw) ? Number(raw) : null;
  } catch {
    return null;
  }
}

function writeBrowserBest(score: number): void {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // A private window, or storage blocked: the score is told, not kept.
  }
  window.dispatchEvent(new Event(BEST_SCORE_EVENT));
}

/** The browser's best score as an external store: null on the server and until it is read. */
function subscribeBrowserBest(onChange: () => void): () => void {
  window.addEventListener(BEST_SCORE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(BEST_SCORE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** `m:ss`, counting down. */
function clockOf(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type Phase = "ready" | "running" | "over";
type End = "time" | "mistakes" | "deck";

interface Outcome {
  exercise: ExerciseSolverExercise;
  passed: boolean;
}

/**
 * «Contrarreloj» (D21, D34; PLAN.md §5.6): three minutes over a deck of
 * increasing difficulty; a pass adds one and deals the next, a wrong move
 * costs a mistake and deals the next, and the run ends at 0:00 or at the
 * third mistake — or when the deck runs out. No hints and no «Ver la
 * solución»: the board alone. The end screen says the score, whether it is
 * a new best, and which exercises failed. While nothing persists the best
 * score is the browser's.
 */
export function StormRunner({ deck, bestScore, sample = false }: StormRunnerProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(0);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [end, setEnd] = useState<End | null>(null);
  const [storedBest, setStoredBest] = useState<number | null>(bestScore);
  const browserBest = useSyncExternalStore(subscribeBrowserBest, readBrowserBest, () => null);
  const best = sample ? browserBest : storedBest;
  const [round, setRound] = useState(0);
  const titleId = useId();

  const score = outcomes.filter((outcome) => outcome.passed).length;
  const mistakes = outcomes.length - score;
  const leftMs = startedAt === null ? STORM_DURATION_MS : Math.max(0, STORM_DURATION_MS + startedAt - now);

  const finish = (why: End, final: number) => {
    setEnd(why);
    setPhase("over");
    if (best === null || final > best) {
      if (sample) writeBrowserBest(final);
      else setStoredBest(final);
    }
  };
  // The clock's tick reads the run as it stands, not as it was when the clock started.
  const finishRef = useRef(finish);
  const scoreRef = useRef(score);
  useEffect(() => {
    finishRef.current = finish;
    scoreRef.current = score;
  });

  // The run's clock, a quarter second at a time; at 0:00 the tick ends the run.
  useEffect(() => {
    if (phase !== "running" || startedAt === null) return;
    const timer = window.setInterval(() => {
      const at = Date.now();
      setNow(at);
      if (at >= startedAt + STORM_DURATION_MS) finishRef.current("time", scoreRef.current);
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  const start = () => {
    setOutcomes([]);
    setIndex(0);
    setEnd(null);
    const at = Date.now();
    setStartedAt(at);
    setNow(at);
    setRound((count) => count + 1);
    setPhase("running");
  };

  const onDone = (exercise: ExerciseSolverExercise, passed: boolean) => {
    const next = [...outcomes, { exercise, passed }];
    setOutcomes(next);
    const failed = next.filter((outcome) => !outcome.passed).length;
    if (failed >= STORM_MAX_MISTAKES) {
      finish("mistakes", next.length - failed);
      return;
    }
    if (index + 1 >= deck.length) {
      finish("deck", next.length - failed);
      return;
    }
    setIndex(index + 1);
  };

  const current = deck[index];

  return (
    <section className={`storm-runner storm-runner_phase_${phase}`} aria-labelledby={titleId}>
      <header className="storm-runner__head">
        <h2 id={titleId} className="storm-runner__title">
          <StopwatchIcon variant="classic-solid" className="storm-runner__title-icon" />
          Contrarreloj
        </h2>
        <p className="storm-runner__facts">
          <span className="storm-runner__clock" role="timer" aria-label={`Tiempo: ${clockOf(leftMs)}`}>
            {clockOf(leftMs)}
          </span>
          <span className="storm-runner__score" aria-label={`Puntos: ${score}`}>
            {score} {score === 1 ? "punto" : "puntos"}
          </span>
          <span className="storm-runner__mistakes" aria-label={`Errores: ${mistakes} de ${STORM_MAX_MISTAKES}`}>
            {Array.from({ length: STORM_MAX_MISTAKES }, (_, slot) => (
              <CircleXmarkIcon
                key={slot}
                variant="classic-solid"
                className={`storm-runner__mistake${slot < mistakes ? " storm-runner__mistake_state_used" : ""}`}
              />
            ))}
          </span>
          {best !== null && <span className="storm-runner__best">Mejor marca: {best}</span>}
        </p>
        <div
          className="storm-runner__bar"
          role="progressbar"
          aria-label="Tiempo restante"
          aria-valuemin={0}
          aria-valuemax={STORM_DURATION_MS}
          aria-valuenow={leftMs}
        >
          <span className="storm-runner__bar-fill" style={{ width: `${(leftMs / STORM_DURATION_MS) * 100}%` }} />
        </div>
        {sample && (
          <p className="storm-runner__note">
            Prueba sin guardar: la mejor marca se queda en este navegador y la partida no se registra.
          </p>
        )}
      </header>

      {phase === "ready" && (
        <div className="storm-runner__start">
          <p className="storm-runner__lead">
            Tres minutos, ejercicios cada vez más difíciles. Un acierto suma un punto; al tercer error se acaba. Sin
            pistas ni solución.
          </p>
          <button
            type="button"
            className="platform-button platform-button_variant_accent platform-button_size_lg"
            onClick={start}
            disabled={deck.length === 0}
          >
            Empezar
          </button>
          {deck.length === 0 && <p className="storm-runner__note">Todavía no hay ejercicios en la biblioteca.</p>}
        </div>
      )}

      {phase === "running" && current && (
        <StormExercise
          key={`${round}:${current.id}`}
          exercise={current}
          position={`${index + 1} / ${deck.length}`}
          onDone={(passed) => onDone(current, passed)}
        />
      )}

      {phase === "over" && (
        <div className="storm-runner__end">
          <p className="storm-runner__end-title">
            {end === "time" ? "Se acabó el tiempo" : end === "mistakes" ? "Tres errores" : "Se acabaron los ejercicios"}
          </p>
          <p className="storm-runner__end-score">
            {score} {score === 1 ? "punto" : "puntos"}
            {best !== null && score >= best && score > 0 && " · ¡Nueva mejor marca!"}
          </p>
          {outcomes.some((outcome) => !outcome.passed) && (
            <>
              <p className="storm-runner__end-lead">Los que fallaste:</p>
              <ul className="storm-runner__failed">
                {outcomes
                  .filter((outcome) => !outcome.passed)
                  .map((outcome) => (
                    <li key={outcome.exercise.id}>{outcome.exercise.title}</li>
                  ))}
              </ul>
            </>
          )}
          <div className="storm-runner__end-actions">
            <button type="button" className="platform-button platform-button_variant_accent" onClick={start}>
              Jugar otra vez
            </button>
            <Link href={platformRoutes.exerciseOverview} className="platform-button">
              Volver a Series y más
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

interface StormExerciseProps {
  exercise: ExerciseSolverExercise;
  position: string;
  onDone: (passed: boolean) => void;
}

/**
 * One exercise of the run on the board, over the solver's own hook in
 * `preview` mode (nothing is submitted): the first wrong move decides it
 * failed and, once the flash is over, the run moves on; the last correct move
 * decides it passed, after the reply if there is one.
 */
function StormExercise({ exercise, position, onDone }: StormExerciseProps) {
  const controls = useExerciseSolver({ exercise, mode: "preview" });
  const session = controls.session;
  const decided = session ? session.solve.failed || (isSessionOver(session) && session.waiting === null) : true;
  const passed = session ? isSessionOver(session) && !session.solve.failed : false;
  const settled = session ? decided && session.waiting === null : true;

  useEffect(() => {
    if (!settled) return;
    const timer = window.setTimeout(() => onDone(passed), 350);
    return () => window.clearTimeout(timer);
    // `onDone` closes over the run's state of the moment; the exercise's key remounts this on each deal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled, passed]);

  if (!session) return null;
  const player = session.solution.player;
  const prompt = exercise.prompt?.trim() || defaultExercisePrompt(player, exercise.kind, exercise.mateIn);

  return (
    <div className="storm-runner__exercise">
      <p className="storm-runner__prompt">
        <span className={`storm-runner__side storm-runner__side_color_${player}`} aria-hidden="true" />
        {prompt}
        <span className="storm-runner__position">{position}</span>
      </p>
      <div className={`storm-runner__board${session.board.tone === "error" ? " storm-runner__board_state_wrong" : ""}`}>
        <ChessBoard
          position={{
            fen: session.board.fen,
            lastMove: session.board.lastMove ?? undefined,
            check: session.board.check,
          }}
          interactive={canMove(session) && !session.solve.failed}
          movableColor={canMove(session) && !session.solve.failed ? player : "none"}
          onMove={controls.move}
          flipBoard={player === "black"}
          lastMoveTone={session.board.tone ?? undefined}
        />
      </div>
      <p className="storm-runner__feedback" aria-live="polite">
        {session.solve.failed ? "No es la jugada." : passed ? "¡Bien!" : session.feedback?.text}
      </p>
    </div>
  );
}
