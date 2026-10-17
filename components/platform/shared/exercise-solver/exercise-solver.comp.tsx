"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { BackwardFastIcon } from "@/components/icons/backward-fast-icon.comp";
import { BackwardStepIcon } from "@/components/icons/backward-step-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { ForwardFastIcon } from "@/components/icons/forward-fast-icon.comp";
import { ForwardStepIcon } from "@/components/icons/forward-step-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { defaultExercisePrompt } from "@/lib/chess/exercise-labels";
import {
  recordRatedExercise,
  useExerciseRating,
} from "@/components/platform/shared/exercise-solve-aside/exercise-rating.store";
import { ExerciseSessionHistory } from "@/components/platform/shared/exercise-session-history/exercise-session-history.comp";
import { recordSolve } from "@/components/platform/shared/exercise-session-history/exercise-solve-history.store";
import { ExerciseSolveAside } from "@/components/platform/shared/exercise-solve-aside/exercise-solve-aside.comp";
import { linePaths, notationRows, type NotationMove } from "./exercise-solver-notation";
import {
  boardAt,
  canMove,
  isSessionOver,
  sessionResult,
  walkthroughComment,
  type SolverResult,
  type SolverSession,
} from "./exercise-solver-session";
import type {
  ExerciseSolverAside,
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
  SubmitExerciseAttempt,
} from "./exercise-solver.types";
import { submitsAttempt, useExerciseSolver, type SolverSaveState } from "./use-exercise-solver.hook";
import "./exercise-solver.comp.css";

/** «Pasar al siguiente al resolver»: the pause on the result before the next exercise. */
export const AUTO_NEXT_MS = 1200;

export interface ExerciseSolverProps {
  exercise: ExerciseSolverExercise;
  /** How it counts: `solve` and `block` (a class block, scored no more today, D49) submit; `unscored` (a retry the same day) and `preview` («Probar») do not. */
  mode: ExerciseSolverMode;
  /** Where it is solved, for the attempt and the «3 / 10». Without it nothing is submitted. */
  context?: ExerciseSolverContext;
  /** What comes after it: «Siguiente ejercicio». */
  next?: ExerciseSolverLink;
  /** The way back to its container: «Volver a la serie». */
  back?: ExerciseSolverLink;
  /** Records the attempt; a stub in Storybook, absent in preview. */
  submit?: SubmitExerciseAttempt;
  /** The full page's left column and history (practice, a series); without it, the board and its panel alone. */
  aside?: ExerciseSolverAside;
}

/** The share of a win an exercise's result is worth for the sample rating. */
function scoreOf(result: SolverResult): number {
  if (result.kind === "clean") return 1;
  if (result.kind === "hinted") return 0.5;
  return 0;
}

const isPassed = (result: SolverResult) => result.kind === "clean" || result.kind === "hinted";

/**
 * The solve screen (PLAN.md §5.3), the same wherever an exercise is solved:
 * a series, practice, a lesson, a class block and the editor's «Probar». The
 * student plays their moves and the platform answers with the opponent's; the
 * first wrong move fails the attempt (D19) and is sent at once, though the
 * student may go on to learn, each wrong try written in the notation as a
 * variation; «Pista» shows the author's texts, then the piece to move (D37);
 * «Ver la solución» walks through the answer and counts as failed (D20).
 * With `aside` it is the full page: the rating, the exercise, its series or
 * topic and the visit's history around the board. Designed for a phone (D39).
 */
export function ExerciseSolver({ exercise, mode, context, next, back, submit, aside }: ExerciseSolverProps) {
  const controls = useExerciseSolver({ exercise, mode, context, submit });
  const router = useRouter();
  const { autoNext } = useExerciseRating();
  const session = controls.session;
  const result = session ? sessionResult(session) : null;
  const recordedRef = useRef(false);

  // The finished exercise joins the visit's history and moves the sample rating, once: a retry adds nothing.
  useEffect(() => {
    if (!aside || !session || !result || recordedRef.current) return;
    recordedRef.current = true;
    const delta = recordRatedExercise({
      difficulty: exercise.difficulty,
      score: scoreOf(result),
      counts: mode === "solve",
      topicCode: aside.topic?.code ?? null,
    });
    recordSolve(aside.scope, {
      exerciseId: exercise.id,
      title: exercise.title,
      href: aside.href,
      tone: isPassed(result) ? "clean" : session.solve.solutionShown ? "shown" : "late",
      delta,
    });
  }, [aside, session, result, exercise.difficulty, exercise.id, exercise.title, mode]);

  // «Pasar al siguiente al resolver»: a solved exercise goes on by itself, after a moment on its result.
  const goesOn = !!aside && !!next && autoNext && !!result && isPassed(result);
  const nextHref = next?.href;
  useEffect(() => {
    if (!goesOn || !nextHref) return;
    const timer = window.setTimeout(() => router.push(nextHref), AUTO_NEXT_MS);
    return () => window.clearTimeout(timer);
  }, [goesOn, nextHref, router]);

  if (!session) {
    return <PlatformNotice message="Este ejercicio no se puede resolver: su solución no se lee." />;
  }
  return (
    <ExerciseSolverView
      exercise={exercise}
      context={context}
      next={next}
      back={back}
      aside={aside}
      session={session}
      elapsedMs={controls.elapsedMs}
      save={controls.save}
      autoplay={controls.autoplay}
      onMove={controls.move}
      onHint={controls.hint}
      onShowSolution={controls.showSolution}
      onStep={controls.step}
      onToggleAutoplay={controls.toggleAutoplay}
      onRetry={controls.retry}
    />
  );
}

export interface ExerciseSolverViewProps {
  exercise: ExerciseSolverExercise;
  context?: ExerciseSolverContext;
  next?: ExerciseSolverLink;
  back?: ExerciseSolverLink;
  aside?: ExerciseSolverAside;
  /** The state to draw (`useExerciseSolver`, or a story's `reduceSession` steps). */
  session: SolverSession;
  elapsedMs: number;
  save: SolverSaveState;
  autoplay: boolean;
  onMove: (san: string) => void;
  onHint: () => void;
  onShowSolution: () => void;
  onStep: (to: number) => void;
  onToggleAutoplay: () => void;
  onRetry: () => void;
}

/** `mm:ss`, counting up (D21). */
function clockOf(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** What a class block's solve says on a day the exercise was already scored (D49): it marks the block, nothing else. */
const BLOCK_NOTE = "Ya lo intentaste hoy: este intento cuenta para la clase, no para tu racha.";

const SAVE_NOTES: Partial<Record<SolverSaveState, { message: string; variant: "error" | "info" }>> = {
  failed: { message: "No se guardó el intento.", variant: "error" },
  notScored: { message: "Ya lo intentaste hoy: este intento no cuenta.", variant: "info" },
  stored: { message: BLOCK_NOTE, variant: "info" },
};

/**
 * The note under the result about the save: only in a mode that submits, and
 * not what the head already says (a `block` page knows its attempt is stored
 * for the block alone).
 */
function saveNoteOf(mode: ExerciseSolverMode, save: SolverSaveState) {
  if (!submitsAttempt(mode)) return undefined;
  if (mode === "block" && save === "stored") return undefined;
  return SAVE_NOTES[save];
}

/**
 * The mode the result is told in: the server's answer wins over the page's
 * (a stale page, a second tab): an attempt that did not count never says
 * «¡Resuelto!» (§2.7), and one kept for its class block says so (D49).
 */
function resultModeOf(mode: ExerciseSolverMode, save: SolverSaveState): ExerciseSolverMode {
  if (mode !== "solve") return mode;
  if (save === "notScored") return "unscored";
  if (save === "stored") return "block";
  return mode;
}

/** The solve screen as data: what `ExerciseSolver` draws from its hook, and what a story draws from a session. */
export function ExerciseSolverView({
  exercise,
  context,
  next,
  back,
  aside,
  session,
  elapsedMs,
  save,
  autoplay,
  onMove,
  onHint,
  onShowSolution,
  onStep,
  onToggleAutoplay,
  onRetry,
}: ExerciseSolverViewProps) {
  const [fullSolution, setFullSolution] = useState(false);
  /** Once it is over, the move the board was taken back to through the notation or ‹ ›; null is the end. */
  const [viewPath, setViewPath] = useState<string | null>(null);
  const { solution, solve, walkthrough, mode } = session;
  const player = solution.player;
  const prompt = exercise.prompt?.trim() || defaultExercisePrompt(player, exercise.kind, exercise.mateIn);
  const over = isSessionOver(session);
  const result = sessionResult(session);
  const comment = walkthroughComment(session);
  const saveNote = saveNoteOf(mode, save);

  // Over and not walking the solution, the line can be gone through: the notation and the ‹ › move the board.
  const browsing = over && !walkthrough;
  const board = browsing && viewPath !== null ? boardAt(solution, viewPath) : session.board;
  const linePath = browsing ? solve.path : session.board.path;
  const rows = notationRows(solution, linePath, session.misses);
  const positions = ["", ...linePaths(linePath)];
  const at = positions.indexOf(board.path);
  const wrong = !over && session.feedback?.tone === "error";
  const feedback = comment ? { tone: "info" as const, text: comment } : over || wrong ? null : session.feedback;

  const goTo = (index: number) => {
    if (walkthrough) onStep(index);
    else setViewPath(positions[Math.max(0, Math.min(positions.length - 1, index))] ?? null);
  };
  const navIndex = walkthrough ? walkthrough.shown : at;
  const navLast = walkthrough ? walkthrough.steps.length : positions.length - 1;
  const navigable = walkthrough !== null || browsing;

  const moveCell = (move: NotationMove | null, empty: string) => {
    if (!move) return <span className="exercise-solver__move exercise-solver__move_state_empty">{empty}</span>;
    const current = move.path === board.path;
    const className = `exercise-solver__move${current ? " exercise-solver__move_state_current" : ""}`;
    const mark = move.byPlayer && <CheckIcon variant="classic-solid" className="exercise-solver__move-mark" />;
    return browsing ? (
      <button
        type="button"
        className={className}
        aria-current={current ? "step" : undefined}
        onClick={() => setViewPath(move.path)}
      >
        {move.san}
        {mark}
      </button>
    ) : (
      <span className={className} aria-current={current ? "step" : undefined}>
        {move.san}
        {mark}
      </span>
    );
  };

  return (
    <section
      className={`exercise-solver exercise-solver_mode_${mode}${aside ? " exercise-solver_layout_page" : ""}`}
      aria-label={exercise.title}
    >
      {aside && <ExerciseSolveAside aside={aside} exercise={exercise} />}

      <div className={`exercise-solver__board${board.tone === "error" ? " exercise-solver__board_state_wrong" : ""}`}>
        <ChessBoard
          position={{ fen: board.fen, lastMove: board.lastMove ?? undefined, check: board.check }}
          interactive={canMove(session)}
          movableColor={canMove(session) ? player : "none"}
          onMove={onMove}
          flipBoard={player === "black"}
          hintSquare={solve.hintSquare ?? undefined}
          lastMoveTone={board.tone ?? undefined}
        />
      </div>

      {aside && <ExerciseSessionHistory scope={aside.scope} current={{ title: exercise.title, open: !over }} />}

      <div className="exercise-solver__panel">
        {rows.length > 0 ? (
          <ol className="exercise-solver__notation" aria-label="Jugadas">
            {rows.map((row, index) =>
              row.kind === "moves" ? (
                <li key={index} className="exercise-solver__row">
                  <span className="exercise-solver__number">{row.number}</span>
                  {moveCell(row.white, "…")}
                  {moveCell(row.black, "")}
                </li>
              ) : (
                <li key={index} className="exercise-solver__miss">
                  {row.label}
                  <XmarkIcon variant="classic-solid" className="exercise-solver__miss-mark" />
                  {row.first && <span className="exercise-solver__miss-note">tu intento</span>}
                </li>
              ),
            )}
          </ol>
        ) : (
          <p className="exercise-solver__notation-empty">Posición inicial: aún no hay jugadas.</p>
        )}

        <div
          className={`exercise-solver__status${wrong ? " exercise-solver__status_tone_wrong" : ""}`}
          aria-live="polite"
        >
          {comment && <p className="exercise-solver__comment">{comment}</p>}
          {over && result ? (
            <ResultPanel
              result={result}
              misses={session.misses.length}
              solutionShown={solve.solutionShown}
              elapsedMs={elapsedMs}
              mode={resultModeOf(mode, save)}
              explanation={exercise.explanation}
              next={next}
              back={back}
              fullSolution={fullSolution}
              onToggleFullSolution={() => setFullSolution((current) => !current)}
              onRetry={() => {
                setViewPath(null);
                onRetry();
              }}
            />
          ) : wrong ? (
            <div className="exercise-solver__turn">
              <CircleXmarkIcon variant="classic-solid" className="exercise-solver__turn-mark" />
              <div className="exercise-solver__turn-text">
                <p className="exercise-solver__turn-title">Ésa no es la jugada</p>
                <p className="exercise-solver__turn-line">
                  {submitsAttempt(mode)
                    ? "Prueba otra cosa. Ya no cuenta como resuelto, pero puedes terminarlo."
                    : "Prueba otra cosa."}
                </p>
              </div>
            </div>
          ) : (
            !over && (
              <div className="exercise-solver__turn">
                <span
                  className={`exercise-solver__side exercise-solver__side_color_${player}`}
                  aria-label={player === "white" ? "Juegan blancas" : "Juegan negras"}
                  role="img"
                />
                <div className="exercise-solver__turn-text">
                  <p className="exercise-solver__turn-title">Tu turno</p>
                  <p className="exercise-solver__turn-line">{prompt}</p>
                  <p className="exercise-solver__meta">
                    <span className="exercise-solver__clock" role="timer" aria-label={`Tiempo: ${clockOf(elapsedMs)}`}>
                      {clockOf(elapsedMs)}
                    </span>
                    {context?.position && !aside && (
                      <span className="exercise-solver__position">{context.position}</span>
                    )}
                    {solve.failed && <span className="platform-tag exercise-solver__failed">Fallado</span>}
                  </p>
                  {feedback && (
                    <p className={`exercise-solver__feedback exercise-solver__feedback_tone_${feedback.tone}`}>
                      {feedback.text}
                    </p>
                  )}
                </div>
              </div>
            )
          )}

          {session.textHints.length > 0 && !over && (
            <ol className="exercise-solver__hints" aria-label="Pistas">
              {session.textHints.map((hint, index) => (
                <li key={index} className="exercise-solver__hint">
                  <LightbulbIcon variant="classic-solid" className="exercise-solver__hint-icon" />
                  <span>
                    <span className="exercise-solver__hint-number">Pista {index + 1}:</span> {hint}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {!over && !walkthrough && (
            <div className="exercise-solver__actions">
              <button type="button" className="platform-button" onClick={onHint} disabled={!canMove(session)}>
                <LightbulbIcon variant="classic-solid" className="platform-button__icon" />
                Pista
              </button>
              <button type="button" className="platform-button" onClick={onShowSolution} disabled={solve.completed}>
                <EyeIcon variant="classic-solid" className="platform-button__icon" />
                Ver la solución
              </button>
            </div>
          )}

          {mode === "unscored" && (
            <p className="exercise-solver__note">Ya lo intentaste hoy: este intento no cuenta.</p>
          )}
          {mode === "block" && <p className="exercise-solver__note">{BLOCK_NOTE}</p>}
          {mode === "preview" && <p className="exercise-solver__note">Vista previa: el intento no se guarda.</p>}
          {saveNote && <PlatformNotice message={saveNote.message} variant={saveNote.variant} />}
        </div>
      </div>

      <div className="exercise-solver__nav" role="group" aria-label="Recorrer las jugadas">
        <button
          type="button"
          className="platform-button platform-button_shape_square"
          aria-label="Al principio"
          disabled={!navigable || navIndex <= 0}
          onClick={() => goTo(0)}
        >
          <BackwardFastIcon variant="classic-solid" className="platform-button__icon" />
        </button>
        <button
          type="button"
          className="platform-button platform-button_shape_square"
          aria-label="Jugada anterior"
          disabled={!navigable || navIndex <= 0}
          onClick={() => goTo(navIndex - 1)}
        >
          <BackwardStepIcon variant="classic-solid" className="platform-button__icon" />
        </button>
        {walkthrough && (
          <button
            type="button"
            className="platform-button platform-button_shape_square"
            aria-label={autoplay ? "Pausar" : "Reproducir la solución"}
            onClick={onToggleAutoplay}
          >
            {autoplay ? (
              <PauseIcon variant="classic-solid" className="platform-button__icon" />
            ) : (
              <PlayIcon variant="classic-solid" className="platform-button__icon" />
            )}
          </button>
        )}
        <button
          type="button"
          className="platform-button platform-button_shape_square"
          aria-label="Jugada siguiente"
          disabled={!navigable || navIndex >= navLast}
          onClick={() => goTo(navIndex + 1)}
        >
          <ForwardStepIcon variant="classic-solid" className="platform-button__icon" />
        </button>
        <button
          type="button"
          className="platform-button platform-button_shape_square"
          aria-label="Al final"
          disabled={!navigable || navIndex >= navLast}
          onClick={() => goTo(navLast)}
        >
          <ForwardFastIcon variant="classic-solid" className="platform-button__icon" />
        </button>
      </div>

      {over && fullSolution && (
        <div className="exercise-solver__full">
          <GameViewer pgn={exercise.solutionPgn} orientation={player} title="La solución completa" />
        </div>
      )}
    </section>
  );
}

// A retry or a preview says how it went this time, never «¡Resuelto!» (§2.7). A class
// block's solve on a day already scored (`block`, D49) is «¡Resuelto!»: it marks the block.
const AGAIN_TITLES: Record<SolverResult["kind"], string> = {
  clean: "Esta vez, sin errores",
  hinted: "Esta vez, con pista",
  failed: "Esta vez, con un error",
  shown: "Esta vez viste la solución",
};

/** How it went, told to the student: the title, the line under it, and the tone of its mark. */
function resultTextOf(
  result: SolverResult,
  misses: number,
  solutionShown: boolean,
  elapsedMs: number,
  counts: boolean,
): { title: string; line: string | null; tone: "ok" | "late" | "error" } {
  if (!counts) {
    return { title: AGAIN_TITLES[result.kind], line: null, tone: isPassed(result) ? "ok" : "error" };
  }
  if (result.kind === "clean")
    return { title: "¡Resuelto!", line: `Sin errores, en ${clockOf(elapsedMs)}.`, tone: "ok" };
  if (result.kind === "hinted") return { title: "Resuelto con pista", line: "Cuenta como resuelto.", tone: "ok" };
  if (solutionShown) return { title: "Viste la solución", line: "Cuenta como fallado.", tone: "error" };
  return {
    title: misses === 1 ? "Resuelto, después de un error" : `Resuelto, después de ${misses} errores`,
    line: "Cuenta como fallado: lo decide la primera jugada.",
    tone: "late",
  };
}

interface ResultPanelProps {
  result: SolverResult;
  /** The wrong tries, for «después de 2 errores». */
  misses: number;
  solutionShown: boolean;
  elapsedMs: number;
  mode: ExerciseSolverMode;
  explanation: string | null;
  next?: ExerciseSolverLink;
  back?: ExerciseSolverLink;
  fullSolution: boolean;
  onToggleFullSolution: () => void;
  onRetry: () => void;
}

/** What replaces «Tu turno» once it is over: how it went, the explanation, and the way on. */
function ResultPanel({
  result,
  misses,
  solutionShown,
  elapsedMs,
  mode,
  explanation,
  next,
  back,
  fullSolution,
  onToggleFullSolution,
  onRetry,
}: ResultPanelProps) {
  const text = resultTextOf(result, misses, solutionShown, elapsedMs, submitsAttempt(mode));
  const Icon = text.tone === "error" ? CircleXmarkIcon : CircleCheckIcon;
  // One accent: the way on, or the way back when there is nothing after it.
  const accentBack = !next;

  return (
    <div className="exercise-solver__result" role="status">
      <div className="exercise-solver__turn">
        <Icon
          variant="classic-solid"
          className={`exercise-solver__result-mark exercise-solver__result-mark_tone_${text.tone}`}
        />
        <div className="exercise-solver__turn-text">
          <p className="exercise-solver__turn-title">{text.title}</p>
          {text.line && <p className="exercise-solver__turn-line">{text.line}</p>}
        </div>
      </div>
      {result.mistake && (
        <p className="exercise-solver__result-line">
          Jugaste {result.mistake.played}; la jugada era {result.mistake.expected}.
        </p>
      )}
      {explanation && <p className="exercise-solver__explanation">{explanation}</p>}

      {next && (
        <Link
          href={next.href}
          className="platform-button platform-button_variant_accent platform-button_size_lg exercise-solver__next"
        >
          {next.label}
          <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
        </Link>
      )}
      <div className="exercise-solver__result-actions">
        {back && (
          <Link
            href={back.href}
            className={`platform-button platform-button_size_sm${accentBack ? " platform-button_variant_accent" : ""}`}
          >
            {back.label}
          </Link>
        )}
        <button type="button" className="platform-button platform-button_size_sm" onClick={onRetry}>
          <RotateLeftIcon variant="classic-solid" className="platform-button__icon" />
          Reintentar
        </button>
        <button
          type="button"
          className="platform-row-action"
          aria-expanded={fullSolution}
          onClick={onToggleFullSolution}
        >
          {fullSolution ? "Ocultar la solución completa" : "Ver la solución completa"}
        </button>
      </div>
    </div>
  );
}
