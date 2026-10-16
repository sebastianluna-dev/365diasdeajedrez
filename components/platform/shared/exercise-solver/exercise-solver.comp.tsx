"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { AngleLeftIcon } from "@/components/icons/angle-left-icon.comp";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { defaultExercisePrompt } from "@/lib/chess/exercise-labels";
import {
  canMove,
  isSessionOver,
  movesOnBoard,
  sessionResult,
  walkthroughComment,
  type SolverResult,
  type SolverSession,
} from "./exercise-solver-session";
import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
  SubmitExerciseAttempt,
} from "./exercise-solver.types";
import { useExerciseSolver, type SolverSaveState } from "./use-exercise-solver.hook";
import "./exercise-solver.comp.css";

export interface ExerciseSolverProps {
  exercise: ExerciseSolverExercise;
  /** How it counts: `solve` submits; `unscored` (a retry the same day) and `preview` («Probar») do not. */
  mode: ExerciseSolverMode;
  /** Where it is solved, for the attempt and the «3 / 10». Without it nothing is submitted. */
  context?: ExerciseSolverContext;
  /** What comes after it: «Siguiente ejercicio». */
  next?: ExerciseSolverLink;
  /** The way back to its container: «Volver a la serie». */
  back?: ExerciseSolverLink;
  /** Records the attempt; a stub in Storybook, absent in preview. */
  submit?: SubmitExerciseAttempt;
}

/**
 * The solve screen (PLAN.md §5.3), the same wherever an exercise is solved:
 * a series, and later a lesson, a class block, practice, review and the
 * editor's «Probar». The student plays their moves and the platform answers
 * with the opponent's; the first wrong move fails the attempt (D19) and is
 * sent at once, though the student may go on to learn; «Pista» shows the
 * author's texts, then the piece to move (D37); «Ver la solución» walks
 * through the answer and counts as failed (D20). Designed for a phone (D39).
 */
export function ExerciseSolver({ exercise, mode, context, next, back, submit }: ExerciseSolverProps) {
  const controls = useExerciseSolver({ exercise, mode, context, submit });
  if (!controls.session) {
    return <PlatformNotice message="Este ejercicio no se puede resolver: su solución no se lee." />;
  }
  return (
    <ExerciseSolverView
      exercise={exercise}
      context={context}
      next={next}
      back={back}
      session={controls.session}
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

const SAVE_NOTES: Partial<Record<SolverSaveState, { message: string; variant: "error" | "info" }>> = {
  failed: { message: "No se guardó el intento.", variant: "error" },
  notScored: { message: "Ya lo intentaste hoy: este intento no cuenta.", variant: "info" },
};

/** The solve screen as data: what `ExerciseSolver` draws from its hook, and what a story draws from a session. */
export function ExerciseSolverView({
  exercise,
  context,
  next,
  back,
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
  const titleId = useId();
  const [fullSolution, setFullSolution] = useState(false);
  const { solution, solve, board, walkthrough, mode } = session;
  const player = solution.player;
  const prompt = exercise.prompt?.trim() || defaultExercisePrompt(player, exercise.kind, exercise.mateIn);
  const over = isSessionOver(session);
  const result = sessionResult(session);
  const moves = movesOnBoard(solution, board.path);
  const comment = walkthroughComment(session);
  // Once it is over the result says how it went; the walk through the solution still says its comments.
  const feedback = comment ? { tone: "info" as const, text: comment } : over ? null : session.feedback;
  const saveNote = mode === "solve" ? SAVE_NOTES[save] : undefined;

  return (
    <section className={`exercise-solver exercise-solver_mode_${mode}`} aria-labelledby={titleId}>
      <header className="exercise-solver__head">
        <p className="exercise-solver__prompt" id={titleId}>
          {prompt}
        </p>
        <p className="exercise-solver__meta">
          <span className={`exercise-solver__side exercise-solver__side_color_${player}`} aria-hidden="true" />
          <span className="exercise-solver__clock" role="timer" aria-label={`Tiempo: ${clockOf(elapsedMs)}`}>
            {clockOf(elapsedMs)}
          </span>
          {context?.position && <span className="exercise-solver__position">{context.position}</span>}
          {solve.failed && <span className="platform-tag exercise-solver__failed">Fallado</span>}
        </p>
        {mode === "unscored" && <p className="exercise-solver__note">Ya lo intentaste hoy: este intento no cuenta.</p>}
        {mode === "preview" && <p className="exercise-solver__note">Vista previa: el intento no se guarda.</p>}
      </header>

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

      <p
        className={`exercise-solver__feedback${feedback ? ` exercise-solver__feedback_tone_${feedback.tone}` : ""}`}
        aria-live="polite"
      >
        {feedback?.text}
      </p>

      <div className="exercise-solver__panel">
        {session.textHints.length > 0 && (
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

        {walkthrough && (
          <div className="exercise-solver__walk" role="group" aria-label="La solución, jugada a jugada">
            <button
              type="button"
              className="platform-button platform-button_shape_square"
              aria-label="Jugada anterior"
              disabled={walkthrough.shown === 0}
              onClick={() => onStep(walkthrough.shown - 1)}
            >
              <AngleLeftIcon variant="classic-solid" className="platform-button__icon" />
            </button>
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
            <button
              type="button"
              className="platform-button platform-button_shape_square"
              aria-label="Jugada siguiente"
              disabled={walkthrough.shown >= walkthrough.steps.length}
              onClick={() => onStep(walkthrough.shown + 1)}
            >
              <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
            </button>
            <span className="exercise-solver__walk-count">
              {walkthrough.shown} de {walkthrough.steps.length}
            </span>
          </div>
        )}

        {over && result ? (
          <ResultPanel
            result={result}
            mode={mode}
            explanation={exercise.explanation}
            next={next}
            back={back}
            fullSolution={fullSolution}
            onToggleFullSolution={() => setFullSolution((current) => !current)}
            onRetry={onRetry}
          />
        ) : (
          <div className="exercise-solver__actions">
            <button
              type="button"
              className="platform-button platform-button_variant_soft platform-button_size_lg"
              onClick={onHint}
              disabled={!canMove(session)}
            >
              <LightbulbIcon variant="classic-solid" className="platform-button__icon" />
              Pista
            </button>
            <button
              type="button"
              className="platform-button platform-button_size_lg"
              onClick={onShowSolution}
              disabled={solve.completed}
            >
              <EyeIcon variant="classic-solid" className="platform-button__icon" />
              Ver la solución
            </button>
          </div>
        )}

        {saveNote && <PlatformNotice message={saveNote.message} variant={saveNote.variant} />}
      </div>

      {moves && (
        <p className="exercise-solver__moves">
          <span className="exercise-solver__moves-label">Jugadas:</span> {moves}
        </p>
      )}

      {over && fullSolution && (
        <div className="exercise-solver__full">
          <GameViewer pgn={exercise.solutionPgn} orientation={player} title="La solución completa" />
        </div>
      )}
    </section>
  );
}

const RESULT_TITLES: Record<"solve" | "again", Record<SolverResult["kind"], string>> = {
  solve: {
    clean: "¡Resuelto!",
    hinted: "Resuelto con pista",
    failed: "Fallado",
    shown: "Viste la solución",
  },
  // A retry or a preview says how it went this time, never «¡Resuelto!» (§2.7).
  again: {
    clean: "Esta vez, sin errores",
    hinted: "Esta vez, con pista",
    failed: "Esta vez, con un error",
    shown: "Esta vez viste la solución",
  },
};

interface ResultPanelProps {
  result: SolverResult;
  mode: ExerciseSolverMode;
  explanation: string | null;
  next?: ExerciseSolverLink;
  back?: ExerciseSolverLink;
  fullSolution: boolean;
  onToggleFullSolution: () => void;
  onRetry: () => void;
}

/** What replaces the actions once it is over: how it went, the explanation, and where to go. */
function ResultPanel({
  result,
  mode,
  explanation,
  next,
  back,
  fullSolution,
  onToggleFullSolution,
  onRetry,
}: ResultPanelProps) {
  const passed = result.kind === "clean" || result.kind === "hinted";
  const Icon = passed ? CircleCheckIcon : CircleXmarkIcon;
  const title = RESULT_TITLES[mode === "solve" ? "solve" : "again"][result.kind];
  // One accent: the way on, or the way back when there is nothing after it.
  const accentBack = !next;

  return (
    <div className="exercise-solver__result" role="status">
      <p className={`exercise-solver__result-title exercise-solver__result-title_tone_${passed ? "ok" : "error"}`}>
        <Icon variant="classic-solid" className="exercise-solver__result-icon" />
        {title}
      </p>
      {result.mistake && (
        <p className="exercise-solver__result-line">
          Jugaste {result.mistake.played}; la jugada era {result.mistake.expected}.
        </p>
      )}
      {explanation && <p className="exercise-solver__explanation">{explanation}</p>}

      <button type="button" className="platform-row-action" aria-expanded={fullSolution} onClick={onToggleFullSolution}>
        {fullSolution ? "Ocultar la solución completa" : "Ver la solución completa"}
      </button>

      <div className="exercise-solver__result-actions">
        {next && (
          <Link href={next.href} className="platform-button platform-button_variant_accent platform-button_size_lg">
            {next.label}
            <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
          </Link>
        )}
        {back && (
          <Link
            href={back.href}
            className={`platform-button platform-button_size_lg${accentBack ? " platform-button_variant_accent" : ""}`}
          >
            {back.label}
          </Link>
        )}
        <button type="button" className="platform-button platform-button_size_lg" onClick={onRetry}>
          <RotateLeftIcon variant="classic-solid" className="platform-button__icon" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
