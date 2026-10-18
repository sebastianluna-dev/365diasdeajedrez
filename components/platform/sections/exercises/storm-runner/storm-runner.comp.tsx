"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { BoltIcon } from "@/components/icons/bolt-icon.comp";
import { CalendarDayIcon } from "@/components/icons/calendar-day-icon.comp";
import { ChartSimpleIcon } from "@/components/icons/chart-simple-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { FireFlameCurvedIcon } from "@/components/icons/fire-flame-curved-icon.comp";
import { FlagIcon } from "@/components/icons/flag-icon.comp";
import { InfinityIcon } from "@/components/icons/infinity-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { PuzzlePieceIcon } from "@/components/icons/puzzle-piece-icon.comp";
import { RotateRightIcon } from "@/components/icons/rotate-right-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { useExerciseSolver } from "@/components/platform/shared/exercise-solver/use-exercise-solver.hook";
import { canMove, isSessionOver } from "@/components/platform/shared/exercise-solver/exercise-solver-session";
import type { ExerciseSolverExercise } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { defaultExercisePrompt } from "@/lib/chess/exercise-labels";
import { STORM_MAX_MISTAKES } from "@/lib/exercises/storm-deck";
import { platformRoutes } from "@/lib/platform-routes";
import "./storm-runner.comp.css";

export interface StormRunnerProps {
  /** The run's exercises, in the order they are dealt (`buildStormDeck`). */
  deck: ExerciseSolverExercise[];
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type ModeKey = "three" | "five" | "survival";

/** The three ways to play: against three or five minutes, or with no clock until the third mistake. */
const MODES: Record<ModeKey, { label: string; ms: number | null; Icon: typeof BoltIcon }> = {
  three: { label: "3 min", ms: 3 * 60 * 1000, Icon: BoltIcon },
  five: { label: "5 min", ms: 5 * 60 * 1000, Icon: StopwatchIcon },
  survival: { label: "Supervivencia", ms: null, Icon: InfinityIcon },
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

/** How long a chip takes to slide to its new place, or to come in. */
const CHIP_MOVE_MS = 240;

/**
 * The chips glide instead of jumping (FLIP): before the browser paints a
 * longer list, each chip that was already there starts from where it was
 * and slides to its new place, and the new one grows in. The rows are
 * centred, so a new chip moves all the others. Skipped under reduced motion.
 */
function useGlidingChips(count: number) {
  const listRef = useRef<HTMLOListElement>(null);
  const places = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const chips = Array.from(list.querySelectorAll<HTMLElement>("[data-chip]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, DOMRect>();
    for (const chip of chips) {
      const key = chip.dataset.chip ?? "";
      const place = chip.getBoundingClientRect();
      next.set(key, place);
      if (reduced || typeof chip.animate !== "function") continue;
      const before = places.current.get(key);
      if (!before) {
        chip.animate(
          [
            { opacity: 0, transform: "scale(0.6)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: CHIP_MOVE_MS, easing: "ease-out" },
        );
        continue;
      }
      const dx = before.left - place.left;
      const dy = before.top - place.top;
      if (dx === 0 && dy === 0) continue;
      chip.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
        duration: CHIP_MOVE_MS,
        easing: "ease-out",
      });
    }
    places.current = next;
  }, [count]);

  return listRef;
}

/** How long the score shows big on the board before the summary card. */
const BURST_MS = 1400;

/**
 * «Puzzle Rush» (D21, D34; PLAN.md §5.6), drawn like a rush: the board on the
 * left and a panel on the right. Before a run the panel shows today's best
 * and the best ever, the three modes (3 min, 5 min, Supervivencia) and
 * «Jugar»; during it, the mistakes in its top band, the score, the clock and
 * a chip per exercise with its difficulty, green or red; at its end the score
 * bursts on the board and a card sums it up, and the panel offers «Jugar
 * otra vez» and «Nuevo Rush». A pass adds one, a wrong move costs a mistake,
 * and the run ends at 0:00, at the third mistake, when the deck runs out or
 * at «Salir». While nothing persists the scores are the browser's.
 */
export function StormRunner({ deck }: StormRunnerProps) {
  const [mode, setMode] = useState<ModeKey>("three");
  const [tab, setTab] = useState<"play" | "scores">("play");
  const [phase, setPhase] = useState<Phase>("ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [end, setEnd] = useState<End | null>(null);
  const [record, setRecord] = useState<"best" | "today" | null>(null);
  const [view, setView] = useState<BoardView>({ fen: START_FEN, flip: false });
  const [prompt, setPrompt] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<"burst" | "card" | null>(null);
  const [round, setRound] = useState(0);
  const scores = parseScores(useSyncExternalStore(subscribeScores, readScoresText, () => "{}"));
  const titleId = useId();
  const cardTitleId = useId();
  // The board of the exercise on screen, so «Salir» leaves it in place.
  const liveView = useRef<BoardView | null>(null);
  const chipsRef = useGlidingChips(outcomes.length);

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
    setPrompt(null);
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

  return (
    <section className={`storm-runner storm-runner_phase_${phase}`} aria-labelledby={titleId}>
      <div className="storm-runner__stage">
        {phase === "running" && current ? (
          <StormExercise
            key={`${round}:${current.id}`}
            exercise={current}
            onPrompt={setPrompt}
            viewRef={liveView}
            onDone={(passed, lastView) => onDone(current, passed, lastView)}
          />
        ) : (
          <div className="storm-runner__board">
            <ChessBoard position={{ fen: view.fen }} flipBoard={view.flip} />
          </div>
        )}

        {phase === "over" && overlay === "burst" && (
          <div className="storm-runner__burst" aria-hidden="true">
            <PuzzlePieceIcon variant="duotone-solid" className="storm-runner__burst-piece" />
            <span className="storm-runner__burst-score">{score}</span>
          </div>
        )}

        {phase === "over" && overlay === "card" && (
          <div className="storm-runner__card" role="group" aria-labelledby={cardTitleId}>
            <button
              type="button"
              className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square storm-runner__card-close"
              aria-label="Cerrar el resumen"
              onClick={() => setOverlay(null)}
            >
              <XmarkIcon variant="classic-solid" className="platform-button__icon" />
            </button>
            <div className="storm-runner__card-head">
              <p id={cardTitleId} className="storm-runner__card-title">
                {endTitle}
              </p>
              <span className="storm-runner__card-badge" aria-hidden="true">
                <PuzzlePieceIcon variant="duotone-solid" />
              </span>
            </div>
            <p className="storm-runner__card-score">{score}</p>
            <dl className="storm-runner__card-tiles">
              <div className="storm-runner__card-tile">
                <dt>
                  <CalendarDayIcon variant="classic-solid" className="storm-runner__card-tile-icon" />
                  Hoy
                </dt>
                <dd>{bests.today ?? score}</dd>
              </div>
              <div className="storm-runner__card-tile">
                <dt>
                  <TrophyIcon variant="classic-solid" className="storm-runner__card-tile-icon" />
                  Mejor
                </dt>
                <dd>{bests.best ?? score}</dd>
              </div>
              <div className="storm-runner__card-tile">
                <dt>
                  <XmarkIcon variant="classic-solid" className="storm-runner__card-tile-icon" />
                  Errores
                </dt>
                <dd>
                  {mistakes}/{STORM_MAX_MISTAKES}
                </dd>
              </div>
            </dl>
            <dl className="storm-runner__card-stats">
              <div className="storm-runner__card-stat">
                <dt>
                  <FireFlameCurvedIcon variant="classic-solid" className="storm-runner__card-stat-icon" />
                  Racha más larga
                </dt>
                <dd>{longestStreak(outcomes)}</dd>
              </div>
              <div className="storm-runner__card-stat">
                <dt>
                  <CheckIcon variant="classic-solid" className="storm-runner__card-stat-icon" />
                  Ejercicio más difícil resuelto
                </dt>
                <dd>{hardest ?? "–"}</dd>
              </div>
              <div className="storm-runner__card-stat">
                <dt>
                  <ClockIcon variant="classic-solid" className="storm-runner__card-stat-icon" />
                  Tiempo medio por ejercicio
                </dt>
                <dd>{average}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="storm-runner__panel">
        {phase === "ready" ? (
          <>
            <header className="storm-runner__head">
              <Link
                href={platformRoutes.exercises}
                className="platform-button platform-button_variant_quiet platform-button_shape_square storm-runner__back"
                aria-label="Volver a Ejercicios"
              >
                <ArrowLeftIcon variant="classic-solid" className="platform-button__icon" />
              </Link>
              <h1 id={titleId} className="storm-runner__title">
                <PuzzlePieceIcon variant="duotone-solid" className="storm-runner__title-icon" />
                Puzzle Rush
              </h1>
            </header>

            <dl className="storm-runner__bests">
              <div className="storm-runner__best">
                <dt>El mejor de hoy</dt>
                <dd>
                  <CalendarDayIcon variant="classic-solid" className="storm-runner__best-icon" />
                  {bests.today ?? "--"}
                </dd>
              </div>
              <div className="storm-runner__best">
                <dt>Mejor puntuación</dt>
                <dd>
                  <ChartSimpleIcon variant="classic-solid" className="storm-runner__best-icon" />
                  {bests.best ?? "--"}
                </dd>
              </div>
            </dl>

            <div className="storm-runner__tabs" role="tablist" aria-label="Puzzle Rush">
              {(
                [
                  ["play", "Jugar"],
                  ["scores", "Tus marcas"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={`storm-runner__tab${tab === key ? " storm-runner__tab_state_current" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "play" ? (
              <div className="storm-runner__modes" role="radiogroup" aria-label="Modo">
                {MODE_KEYS.map((key) => {
                  const { label, Icon } = MODES[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={mode === key}
                      className={`storm-runner__mode${mode === key ? " storm-runner__mode_state_chosen" : ""}`}
                      onClick={() => setMode(key)}
                    >
                      <Icon variant="classic-solid" className="storm-runner__mode-icon" />
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <dl className="storm-runner__marks">
                {MODE_KEYS.map((key) => {
                  const { label, Icon } = MODES[key];
                  const mark = bestsOf(scores, key);
                  return (
                    <div key={key} className="storm-runner__mark">
                      <dt>
                        <Icon variant="classic-solid" className="storm-runner__mode-icon" />
                        {label}
                      </dt>
                      <dd>
                        <span className="storm-runner__mark-best">{mark.best ?? "--"}</span>
                        <span className="storm-runner__mark-today">Hoy: {mark.today ?? "--"}</span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            <div className="storm-runner__foot">
              <button
                type="button"
                className="platform-button platform-button_variant_accent platform-button_size_lg storm-runner__play"
                onClick={start}
                disabled={deck.length === 0}
              >
                Jugar
              </button>
              {deck.length === 0 && <p className="storm-runner__note">Todavía no hay ejercicios en la biblioteca.</p>}
            </div>
          </>
        ) : (
          <>
            <div
              className={`storm-runner__band${mistakes > 0 ? " storm-runner__band_state_missed" : ""}`}
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
            </div>

            <div className="storm-runner__scoreboard">
              <h1 id={titleId} className="storm-runner__visually-hidden">
                Puzzle Rush
              </h1>
              <span className="storm-runner__badge" aria-hidden="true">
                <PuzzlePieceIcon variant="duotone-solid" />
              </span>
              <p className="storm-runner__score" aria-label={`Puntos: ${score}`}>
                {score}
              </p>
              <p
                className="storm-runner__clock"
                role="timer"
                aria-label={limit === null ? `Tiempo: ${clock}` : `Quedan ${clock}`}
              >
                {limit === null ? (
                  <InfinityIcon variant="classic-solid" className="storm-runner__clock-icon" />
                ) : (
                  <StopwatchIcon variant="classic-solid" className="storm-runner__clock-icon" />
                )}
                {clock}
              </p>
              {phase === "running" && prompt && <p className="storm-runner__prompt">{prompt}</p>}
            </div>

            <ol ref={chipsRef} className="storm-runner__chips" aria-label="Ejercicios del rush">
              {outcomes.map((outcome, slot) => (
                <li
                  key={`${outcome.exercise.id}-${slot}`}
                  data-chip={`${outcome.exercise.id}-${slot}`}
                  className={`storm-runner__chip storm-runner__chip_result_${outcome.passed ? "pass" : "miss"}`}
                >
                  <span className="storm-runner__chip-mark">
                    {outcome.passed ? (
                      <CheckIcon variant="classic-solid" className="storm-runner__chip-icon" />
                    ) : (
                      <XmarkIcon variant="classic-solid" className="storm-runner__chip-icon" />
                    )}
                  </span>
                  <span className="storm-runner__chip-difficulty">{outcome.exercise.difficulty}</span>
                  <span className="storm-runner__visually-hidden">{outcome.passed ? "resuelto" : "fallado"}</span>
                </li>
              ))}
            </ol>

            <div className="storm-runner__foot">
              {phase === "running" ? (
                <button
                  type="button"
                  className="platform-button platform-button_variant_quiet storm-runner__quit"
                  onClick={() => finish("quit", score, liveView.current ?? undefined)}
                >
                  <FlagIcon variant="classic-solid" className="platform-button__icon" />
                  Salir
                </button>
              ) : (
                <div className="storm-runner__again">
                  <button
                    type="button"
                    className="platform-button platform-button_variant_accent platform-button_size_lg"
                    onClick={start}
                  >
                    <RotateRightIcon variant="classic-solid" className="platform-button__icon" />
                    Jugar otra vez
                  </button>
                  <button type="button" className="platform-button platform-button_size_lg" onClick={reset}>
                    <PlusIcon variant="classic-solid" className="platform-button__icon" />
                    Nuevo Rush
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

interface StormExerciseProps {
  exercise: ExerciseSolverExercise;
  /** The side to move and the task, for the panel. */
  onPrompt: (prompt: string) => void;
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
function StormExercise({ exercise, onPrompt, viewRef, onDone }: StormExerciseProps) {
  const controls = useExerciseSolver({ exercise, mode: "preview" });
  const session = controls.session;
  const decided = session ? session.solve.failed || (isSessionOver(session) && session.waiting === null) : true;
  const passed = session ? isSessionOver(session) && !session.solve.failed : false;
  const settled = session ? decided && session.waiting === null : true;
  const player = session?.solution.player ?? "white";
  const prompt = exercise.prompt?.trim() || defaultExercisePrompt(player, exercise.kind, exercise.mateIn);

  useEffect(() => {
    if (session) viewRef.current = { fen: session.board.fen, flip: player === "black" };
  });

  useEffect(() => {
    if (session) onPrompt(prompt);
    // Once per exercise: the key remounts this on each deal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(session), prompt]);

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
      />
    </div>
  );
}
