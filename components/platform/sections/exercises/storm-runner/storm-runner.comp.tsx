"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { CalendarDayIcon } from "@/components/icons/calendar-day-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { FireFlameCurvedIcon } from "@/components/icons/fire-flame-curved-icon.comp";
import { InfinityIcon } from "@/components/icons/infinity-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { NavArt } from "@/components/platform/sections/shell/nav-art.comp";
import { useExerciseSolver } from "@/components/platform/shared/exercise-solver/use-exercise-solver.hook";
import { canMove, isSessionOver } from "@/components/platform/shared/exercise-solver/exercise-solver-session";
import type { ExerciseSolverExercise } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { exerciseKindLabel } from "@/lib/chess/exercise-labels";
import { STORM_MAX_MISTAKES } from "@/lib/exercises/storm-deck";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { ExercisesToolbar, type ExercisesToolbarAction } from "../exercises-toolbar.comp";
import "./storm-runner.comp.css";

export interface StormRunnerProps {
  /** The run's exercises, in the order they are dealt (`buildStormDeck`). */
  deck: ExerciseSolverExercise[];
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type ModeKey = "three" | "five" | "survival";

/** The three ways to play: against three or five minutes, or with no clock until the third mistake. */
const MODES: Record<ModeKey, { label: string; line: string; ms: number | null }> = {
  three: { label: "3 min", line: "Contra el reloj", ms: 3 * 60 * 1000 },
  five: { label: "5 min", line: "Con más tiempo", ms: 5 * 60 * 1000 },
  survival: { label: "Supervivencia", line: "Sin reloj, hasta el tercer error", ms: null },
};

const MODE_KEYS = Object.keys(MODES) as ModeKey[];

// The scores live in the browser while nothing persists: per mode, the best
// ever and the best of today (with its date).
const SCORES_KEY = "exercises:storm:scores";
const SCORES_EVENT = "exercises:storm:scores";

interface ModeScores {
  best: number | null;
  today: { date: string; score: number } | null;
}

type Scores = Partial<Record<ModeKey, ModeScores>>;

const todayOf = () => new Date().toLocaleDateString("en-CA");

function readScoresText(): string {
  try {
    return window.localStorage.getItem(SCORES_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function parseScores(text: string): Scores {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" ? (value as Scores) : {};
  } catch {
    return {};
  }
}

function saveScore(mode: ModeKey, score: number): void {
  const scores = parseScores(readScoresText());
  const current = scores[mode] ?? { best: null, today: null };
  const today = todayOf();
  scores[mode] = {
    best: current.best === null || score > current.best ? score : current.best,
    today:
      current.today && current.today.date === today && current.today.score >= score
        ? current.today
        : { date: today, score },
  };
  try {
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // A private window, or storage blocked: the score is told, not kept.
  }
  window.dispatchEvent(new Event(SCORES_EVENT));
}

function subscribeScores(onChange: () => void): () => void {
  window.addEventListener(SCORES_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SCORES_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The best ever and today's best of a mode, as the browser keeps them. */
function bestsOf(scores: Scores, mode: ModeKey): { best: number | null; today: number | null } {
  const entry = scores[mode];
  return {
    best: entry?.best ?? null,
    today: entry?.today && entry.today.date === todayOf() ? entry.today.score : null,
  };
}

/** `m:ss`. */
function clockOf(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type Phase = "ready" | "running" | "over";
type End = "time" | "mistakes" | "deck" | "quit";

interface Outcome {
  exercise: ExerciseSolverExercise;
  passed: boolean;
}

/** What the board shows outside a run: the start before, the last position after. */
interface BoardView {
  fen: string;
  flip: boolean;
}

/** The longest run of passes in a row. */
function longestStreak(outcomes: readonly Outcome[]): number {
  let best = 0;
  let current = 0;
  for (const outcome of outcomes) {
    current = outcome.passed ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

/** How long the score shows big on the board before the summary card. */
const BURST_MS = 1400;

/**
 * «Puzzle Rush» (D21, D34; PLAN.md §5.6), on the panel of «Ejercicios» in the
 * new design system (2026-10-23, the owner's «M4»). Before a run: the rush's
 * drawing and what it is, today's best and the best ever of the mode chosen,
 * the three modes as cards (3 min, 5 min, Supervivencia), «Jugar», and at the
 * right the marks of every mode and how it is played. During it, the material
 * board and beside it the score, the clock and the three mistakes' slots,
 * who plays and which exercise it is, the grid of the run's exercises — each
 * with its difficulty, green or red, the one on the board ringed — and the
 * best of the mode, «Vas por un récord» once it is beaten; «Salir» in the
 * toolbar. At its end the score bursts on the board and a card sums it up,
 * and the toolbar offers «Nuevo Rush» and «Jugar otra vez». A pass adds one,
 * a wrong move costs a mistake, and the run ends at 0:00, at the third
 * mistake, when the deck runs out or at «Salir». While nothing persists the
 * scores are the browser's.
 */
export function StormRunner({ deck }: StormRunnerProps) {
  const [mode, setMode] = useState<ModeKey>("three");
  const [phase, setPhase] = useState<Phase>("ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [end, setEnd] = useState<End | null>(null);
  const [record, setRecord] = useState<"best" | "today" | null>(null);
  const [view, setView] = useState<BoardView>({ fen: START_FEN, flip: false });
  const [player, setPlayer] = useState<"white" | "black">("white");
  const [overlay, setOverlay] = useState<"burst" | "card" | null>(null);
  const [round, setRound] = useState(0);
  const scores = parseScores(useSyncExternalStore(subscribeScores, readScoresText, () => "{}"));
  const cardTitleId = useId();
  // The board of the exercise on screen, so «Salir» leaves it in place.
  const liveView = useRef<BoardView | null>(null);

  const limit = MODES[mode].ms;
  const score = outcomes.filter((outcome) => outcome.passed).length;
  const mistakes = outcomes.length - score;
  const elapsed = startedAt === null ? 0 : Math.max(0, (endedAt ?? now) - startedAt);
  const clock = limit === null ? clockOf(elapsed) : clockOf(limit - elapsed);
  const bests = bestsOf(scores, mode);

  const finish = (why: End, final: number, lastView?: BoardView) => {
    const at = Date.now();
    setEnd(why);
    setEndedAt(at);
    setPhase("over");
    if (lastView) setView(lastView);
    setRecord(
      final > 0 && (bests.best === null || final > bests.best)
        ? "best"
        : final > 0 && (bests.today === null || final > bests.today)
          ? "today"
          : null,
    );
    saveScore(mode, final);
    setOverlay("burst");
  };
  // The clock's tick reads the run as it stands, not as it was when the clock started.
  const finishRef = useRef(finish);
  const scoreRef = useRef(score);
  useEffect(() => {
    finishRef.current = finish;
    scoreRef.current = score;
  });

  // The run's clock, a quarter second at a time; at 0:00 the tick ends a timed run.
  useEffect(() => {
    if (phase !== "running" || startedAt === null) return;
    const timer = window.setInterval(() => {
      const at = Date.now();
      setNow(at);
      if (limit !== null && at >= startedAt + limit) finishRef.current("time", scoreRef.current);
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, startedAt, limit]);

  // The score bursts on the board for a moment, then the card sums the run up.
  useEffect(() => {
    if (overlay !== "burst") return;
    const timer = window.setTimeout(() => setOverlay("card"), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [overlay]);

  const start = () => {
    setOutcomes([]);
    setIndex(0);
    setEnd(null);
    setRecord(null);
    setOverlay(null);
    const at = Date.now();
    setStartedAt(at);
    setNow(at);
    setEndedAt(null);
    setRound((count) => count + 1);
    setPhase("running");
  };

  const reset = () => {
    setPhase("ready");
    setOutcomes([]);
    setStartedAt(null);
    setEndedAt(null);
    setOverlay(null);
    setView({ fen: START_FEN, flip: false });
  };

  const onDone = (exercise: ExerciseSolverExercise, passed: boolean, lastView: BoardView) => {
    const next = [...outcomes, { exercise, passed }];
    setOutcomes(next);
    const failed = next.filter((outcome) => !outcome.passed).length;
    if (failed >= STORM_MAX_MISTAKES) {
      finish("mistakes", next.length - failed, lastView);
      return;
    }
    if (index + 1 >= deck.length) {
      finish("deck", next.length - failed, lastView);
      return;
    }
    setIndex(index + 1);
  };

  const current = deck[index];
  const passedOnes = outcomes.filter((outcome) => outcome.passed);
  const hardest = passedOnes.length > 0 ? Math.max(...passedOnes.map((outcome) => outcome.exercise.difficulty)) : null;
  const average = outcomes.length > 0 ? clockOf(elapsed / outcomes.length) : "–";
  const endTitle =
    record === "best"
      ? "¡Nueva mejor puntuación!"
      : record === "today"
        ? "¡Lo mejor de hoy!"
        : end === "time"
          ? "Se acabó el tiempo"
          : end === "mistakes"
            ? "Tres errores"
            : end === "deck"
              ? "Se acabaron los ejercicios"
              : "Fin del rush";
  const beating = score > 0 && (bests.best === null || score > bests.best);

  const actions: ExercisesToolbarAction[] =
    phase === "running"
      ? [{ label: "Salir", tone: "outlined", onClick: () => finish("quit", score, liveView.current ?? undefined) }]
      : phase === "over"
        ? [
            { label: "Nuevo Rush", tone: "outlined", onClick: reset },
            { label: "Jugar otra vez", tone: "filled", onClick: start },
          ]
        : [];

  return (
    <section className={`platform-workspace__panel storm-runner storm-runner_phase_${phase}`} aria-label="Puzzle Rush">
      <ExercisesToolbar
        title={phase === "ready" ? "Puzzle Rush" : `Puzzle Rush · ${MODES[mode].label}`}
        actions={actions}
      />

      {phase === "ready" ? (
        <div className="storm-runner__ready">
          <div className="storm-runner__intro">
            <div className="storm-runner__hero">
              <NavArt art="rush" className="storm-runner__art" />
              <div className="storm-runner__hero-text">
                <h2 className="storm-runner__title">Puzzle Rush</h2>
                <p className="storm-runner__lead">
                  Ejercicios cada vez más difíciles: un acierto suma un punto y al tercer error se acaba.
                </p>
              </div>
            </div>

            <dl className="storm-runner__tiles">
              <div className="storm-runner__tile">
                <dt>El mejor de hoy</dt>
                <dd>{bests.today ?? "--"}</dd>
              </div>
              <div className="storm-runner__tile">
                <dt>Mejor puntuación</dt>
                <dd>{bests.best ?? "--"}</dd>
              </div>
            </dl>

            <div className="storm-runner__choose">
              <p className="storm-runner__label" id={`${cardTitleId}-modo`}>
                Modo
              </p>
              <div className="storm-runner__modes" role="radiogroup" aria-labelledby={`${cardTitleId}-modo`}>
                {MODE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={mode === key}
                    className={`storm-runner__mode${mode === key ? " storm-runner__mode_state_chosen" : ""}`}
                    onClick={() => setMode(key)}
                  >
                    <span className="storm-runner__ring" aria-hidden="true" />
                    <span className="storm-runner__mode-name">{MODES[key].label}</span>
                    <span className="storm-runner__mode-line">{MODES[key].line}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="storm-runner__go">
              <button
                type="button"
                className={`${mdButton("filled", "md")} storm-runner__play`}
                onClick={start}
                disabled={deck.length === 0}
              >
                <PlayIcon variant="classic-solid" className="platform-md-icon" />
                Jugar
              </button>
              {deck.length === 0 && <p className="storm-runner__note">Todavía no hay ejercicios en la biblioteca.</p>}
            </div>
          </div>

          <div className="storm-runner__aside">
            <section className="storm-runner__card" aria-labelledby={`${cardTitleId}-marcas`}>
              <h2 className="storm-runner__label" id={`${cardTitleId}-marcas`}>
                Tus marcas
              </h2>
              <dl className="storm-runner__marks">
                {MODE_KEYS.map((key) => {
                  const mark = bestsOf(scores, key);
                  return (
                    <div key={key} className="storm-runner__mark">
                      <dt>
                        {MODES[key].label}
                        <span className="storm-runner__mark-today">Hoy: {mark.today ?? "--"}</span>
                      </dt>
                      <dd>{mark.best ?? "--"}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
            <section className="storm-runner__card" aria-labelledby={`${cardTitleId}-reglas`}>
              <h2 className="storm-runner__label" id={`${cardTitleId}-reglas`}>
                Cómo se juega
              </h2>
              <ul className="storm-runner__rules">
                <li>La primera jugada equivocada falla el ejercicio.</li>
                <li>Cada acierto suma un punto; al tercer error se acaba.</li>
                <li>También termina si se acaba el tiempo o los ejercicios.</li>
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <div className="storm-runner__play-area">
          <div className="storm-runner__stage">
            {phase === "running" && current ? (
              <StormExercise
                key={`${round}:${current.id}`}
                exercise={current}
                onPlayer={setPlayer}
                viewRef={liveView}
                onDone={(passed, lastView) => onDone(current, passed, lastView)}
              />
            ) : (
              <div className="storm-runner__board">
                <ChessBoard position={{ fen: view.fen }} flipBoard={view.flip} look="material" />
              </div>
            )}

            {phase === "over" && overlay === "burst" && (
              <div className="storm-runner__burst" aria-hidden="true">
                <span className="storm-runner__burst-score">{score}</span>
              </div>
            )}

            {phase === "over" && overlay === "card" && (
              <div className="storm-runner__summary" role="group" aria-labelledby={cardTitleId}>
                <button
                  type="button"
                  className={`${mdIconButton("standard", "sm")} storm-runner__summary-close`}
                  aria-label="Cerrar el resumen"
                  onClick={() => setOverlay(null)}
                >
                  <XmarkIcon variant="classic-solid" className="platform-md-icon" />
                </button>
                <p id={cardTitleId} className="storm-runner__summary-title">
                  {endTitle}
                </p>
                <p className="storm-runner__summary-score">{score}</p>
                <dl className="storm-runner__summary-tiles">
                  <div className="storm-runner__summary-tile">
                    <dt>
                      <CalendarDayIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Hoy
                    </dt>
                    <dd>{bests.today ?? score}</dd>
                  </div>
                  <div className="storm-runner__summary-tile">
                    <dt>
                      <TrophyIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Mejor
                    </dt>
                    <dd>{bests.best ?? score}</dd>
                  </div>
                  <div className="storm-runner__summary-tile">
                    <dt>
                      <XmarkIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Errores
                    </dt>
                    <dd>
                      {mistakes}/{STORM_MAX_MISTAKES}
                    </dd>
                  </div>
                </dl>
                <dl className="storm-runner__summary-stats">
                  <div className="storm-runner__summary-stat">
                    <dt>
                      <FireFlameCurvedIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Racha más larga
                    </dt>
                    <dd>{longestStreak(outcomes)}</dd>
                  </div>
                  <div className="storm-runner__summary-stat">
                    <dt>
                      <CheckIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Ejercicio más difícil resuelto
                    </dt>
                    <dd>{hardest ?? "–"}</dd>
                  </div>
                  <div className="storm-runner__summary-stat">
                    <dt>
                      <ClockIcon variant="classic-solid" className="storm-runner__summary-icon" />
                      Tiempo medio por ejercicio
                    </dt>
                    <dd>{average}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="storm-runner__column">
            <div className="storm-runner__scoreboard" role="group" aria-label="Marcador">
              <div className="storm-runner__figure">
                <p className="storm-runner__label">Puntos</p>
                <p className="storm-runner__score">{score}</p>
              </div>
              <div className="storm-runner__figure">
                <p className="storm-runner__label">Tiempo</p>
                <p
                  className="storm-runner__clock"
                  role="timer"
                  aria-label={limit === null ? `Llevas ${clock}` : `Quedan ${clock}`}
                >
                  {limit === null ? (
                    <InfinityIcon variant="classic-solid" className="storm-runner__clock-icon" />
                  ) : (
                    <StopwatchIcon variant="classic-solid" className="storm-runner__clock-icon" />
                  )}
                  {clock}
                </p>
              </div>
              <div className="storm-runner__figure">
                <p className="storm-runner__label">Errores</p>
                <p
                  className="storm-runner__slots"
                  role="img"
                  aria-label={`Errores: ${mistakes} de ${STORM_MAX_MISTAKES}`}
                >
                  {Array.from({ length: STORM_MAX_MISTAKES }, (_, slot) => (
                    <span
                      key={slot}
                      className={`storm-runner__slot${slot < mistakes ? " storm-runner__slot_state_used" : ""}`}
                    >
                      {slot < mistakes && <XmarkIcon variant="classic-solid" className="storm-runner__slot-icon" />}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {phase === "running" && current && (
              <div className="storm-runner__status" aria-live="polite">
                <p className="storm-runner__turn">
                  <span className={`storm-runner__side storm-runner__side_color_${player}`} aria-hidden="true" />
                  {player === "white" ? "Juegan blancas" : "Juegan negras"}
                </p>
                <p className="storm-runner__line">
                  Ejercicio {index + 1} · {exerciseKindLabel(current.kind, current.mateIn)} · {current.difficulty}
                </p>
                {current.prompt?.trim() && <p className="storm-runner__line">{current.prompt.trim()}</p>}
              </div>
            )}

            <section
              className="storm-runner__card storm-runner__card_kind_runs"
              aria-labelledby={`${cardTitleId}-runs`}
            >
              <h2 className="storm-runner__label" id={`${cardTitleId}-runs`}>
                Ejercicios del rush · {outcomes.length} {outcomes.length === 1 ? "hecho" : "hechos"}
              </h2>
              <ol className="storm-runner__runs">
                {outcomes.map((outcome, slot) => (
                  <li
                    key={`${outcome.exercise.id}-${slot}`}
                    className={`storm-runner__run storm-runner__run_result_${outcome.passed ? "pass" : "miss"}`}
                  >
                    {outcome.passed ? (
                      <CheckIcon variant="classic-solid" className="storm-runner__run-icon" />
                    ) : (
                      <XmarkIcon variant="classic-solid" className="storm-runner__run-icon" />
                    )}
                    {outcome.exercise.difficulty}
                    <span className="storm-runner__visually-hidden">{outcome.passed ? "resuelto" : "fallado"}</span>
                  </li>
                ))}
                {phase === "running" && current && (
                  <li className="storm-runner__run storm-runner__run_result_now">
                    {current.difficulty}
                    <span className="storm-runner__visually-hidden">en curso</span>
                  </li>
                )}
              </ol>
            </section>

            <div className="storm-runner__card storm-runner__card_kind_best">
              <div>
                <p className="storm-runner__label">Tu mejor en {MODES[mode].label}</p>
                <p className="storm-runner__best">{bests.best ?? "--"}</p>
              </div>
              {beating && <span className="storm-runner__record">Vas por un récord</span>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface StormExerciseProps {
  exercise: ExerciseSolverExercise;
  /** The side to move, for the status card. */
  onPlayer: (player: "white" | "black") => void;
  /** Where the board stands, for a run ended mid-exercise. */
  viewRef: { current: BoardView | null };
  onDone: (passed: boolean, lastView: BoardView) => void;
}

/**
 * One exercise of the run on the board, over the solver's own hook in
 * `preview` mode (nothing is submitted): the first wrong move decides it
 * failed and, once the flash is over, the run moves on; the last correct move
 * decides it passed, after the reply if there is one.
 */
function StormExercise({ exercise, onPlayer, viewRef, onDone }: StormExerciseProps) {
  const controls = useExerciseSolver({ exercise, mode: "preview" });
  const session = controls.session;
  const decided = session ? session.solve.failed || (isSessionOver(session) && session.waiting === null) : true;
  const passed = session ? isSessionOver(session) && !session.solve.failed : false;
  const settled = session ? decided && session.waiting === null : true;
  const player = session?.solution.player ?? "white";

  useEffect(() => {
    if (session) viewRef.current = { fen: session.board.fen, flip: player === "black" };
  });

  useEffect(() => {
    if (session) onPlayer(player);
    // Once per exercise: the key remounts this on each deal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(session), player]);

  useEffect(() => {
    if (!settled) return;
    const fen = session?.board.fen ?? START_FEN;
    const timer = window.setTimeout(() => onDone(passed, { fen, flip: player === "black" }), 350);
    return () => window.clearTimeout(timer);
    // `onDone` closes over the run's state of the moment; the exercise's key remounts this on each deal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled, passed]);

  if (!session) return <div className="storm-runner__board" />;
  const movable = canMove(session) && !session.solve.failed;

  return (
    <div className={`storm-runner__board${session.board.tone === "error" ? " storm-runner__board_state_wrong" : ""}`}>
      <ChessBoard
        position={{
          fen: session.board.fen,
          lastMove: session.board.lastMove ?? undefined,
          check: session.board.check,
        }}
        interactive={movable}
        movableColor={movable ? player : "none"}
        onMove={controls.move}
        flipBoard={player === "black"}
        lastMoveTone={session.board.tone ?? undefined}
        look="material"
      />
    </div>
  );
}
