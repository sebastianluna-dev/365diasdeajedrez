"use client";

import Link from "next/link";
import { useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { ArrowDownRightIcon } from "@/components/icons/arrow-down-right-icon.comp";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right-icon.comp";
import { BackwardStepIcon } from "@/components/icons/backward-step-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { ForwardStepIcon } from "@/components/icons/forward-step-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { ExerciseSessionHistory } from "@/components/platform/shared/exercise-session-history/exercise-session-history.comp";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";
import { defaultExercisePrompt, exerciseKindLabel } from "@/lib/chess/exercise-labels";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { setRatingSwitch, useExerciseRating } from "@/components/platform/shared/exercise-solver/exercise-rating.store";
import type { ExerciseSolverViewProps } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import {
  linePaths,
  notationRows,
  type NotationMove,
} from "@/components/platform/shared/exercise-solver/exercise-solver-notation";
import {
  BLOCK_NOTE,
  resultModeOf,
  resultTextOf,
  saveNoteOf,
} from "@/components/platform/shared/exercise-solver/exercise-solver-result";
import {
  boardAt,
  canMove,
  isSessionOver,
  sessionResult,
  walkthroughComment,
  type SolverResult,
} from "@/components/platform/shared/exercise-solver/exercise-solver-session";
import { submitsAttempt } from "@/components/platform/shared/exercise-solver/use-exercise-solver.hook";
import "./exercise-solver-page.comp.css";

/**
 * The full solve page of «Ejercicios» in the new design system (2026-10-23,
 * «M4» of the owner's canvas), what `ExerciseSolver` draws when it is given
 * an `aside`: the material board with Material's keys under it, and beside it
 * a column — the status card («Tu turno» with its chips, «Pista» and «Ver la
 * solución»; the wrong move; or the result and the way on), «Jugadas», «Esta
 * sesión», and at its foot the two switches of the rating, «Cuenta para tu
 * puntuación» with the rating and its last change, and «Pasar al siguiente al
 * resolver». The same session as the board-and-panel view, told the same way
 * (`exercise-solver-result.ts`); only the drawing differs. The page's toolbar
 * is the section's, around it.
 */
export function ExerciseSolverPage({
  exercise,
  next,
  back,
  aside,
  session,
  save,
  autoplay,
  onMove,
  onHint,
  onShowSolution,
  onStep,
  onToggleAutoplay,
  onRetry,
}: ExerciseSolverViewProps) {
  /** Once it is over, the move the board was taken back to through the moves or the keys; null is the end. */
  const [viewPath, setViewPath] = useState<string | null>(null);
  const rating = useExerciseRating();
  const { solution, solve, walkthrough, mode } = session;
  const player = solution.player;
  const prompt = exercise.prompt?.trim() || defaultExercisePrompt(player, exercise.kind, exercise.mateIn);
  const over = isSessionOver(session);
  const result = sessionResult(session);
  const comment = walkthroughComment(session);
  const saveNote = saveNoteOf(mode, save);

  // Over and not walking the solution, the line can be gone through: the moves and the keys move the board.
  const browsing = over && !walkthrough;
  const board = browsing && viewPath !== null ? boardAt(solution, viewPath) : session.board;
  const linePath = browsing ? solve.path : session.board.path;
  const rows = notationRows(solution, linePath, session.misses);
  const positions = ["", ...linePaths(linePath)];
  const at = positions.indexOf(board.path);
  const wrong = !over && session.feedback?.tone === "error";
  const feedback = comment ? null : over || wrong ? null : session.feedback;

  const goTo = (index: number) => {
    if (walkthrough) onStep(index);
    else setViewPath(positions[Math.max(0, Math.min(positions.length - 1, index))] ?? null);
  };
  const navIndex = walkthrough ? walkthrough.shown : at;
  const navLast = walkthrough ? walkthrough.steps.length : positions.length - 1;
  const navigable = walkthrough !== null || browsing;
  const resultText =
    over && result
      ? resultTextOf(result, session.misses.length, solve.solutionShown, submitsAttempt(resultModeOf(mode, save)))
      : null;
  const tone = resultText ? resultText.tone : wrong ? "wrong" : "turn";

  // Material's wide keys, as the explorer's: the way forward filled, the rest on the container's grey.
  const keyClass = (main = false) =>
    main
      ? `${mdIconButton("filled", "sm", "wide")} exercise-solver-page__key`
      : `${mdIconButton("tonal", "sm", "wide")} exercise-solver-page__key exercise-solver-page__key_tone_grey`;

  const moveCell = (move: NotationMove | null, empty: string) => {
    if (!move)
      return <span className="exercise-solver-page__move exercise-solver-page__move_state_empty">{empty}</span>;
    const current = move.path === board.path;
    const className = `exercise-solver-page__move${current ? " exercise-solver-page__move_state_current" : ""}`;
    const mark = move.byPlayer && <CheckIcon variant="classic-solid" className="exercise-solver-page__move-mark" />;
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

  const delta = rating.lastDelta;

  return (
    <section className={`exercise-solver-page exercise-solver-page_mode_${mode}`} aria-label={exercise.title}>
      <div className="exercise-solver-page__stage">
        <div
          className={`exercise-solver-page__board${board.tone === "error" ? " exercise-solver-page__board_state_wrong" : ""}`}
        >
          <ChessBoard
            position={{ fen: board.fen, lastMove: board.lastMove ?? undefined, check: board.check }}
            interactive={canMove(session)}
            movableColor={canMove(session) ? player : "none"}
            onMove={onMove}
            flipBoard={player === "black"}
            hintSquare={solve.hintSquare ?? undefined}
            lastMoveTone={board.tone ?? undefined}
            look="material"
          />
        </div>

        <div className="exercise-solver-page__keys" role="group" aria-label="Recorrer las jugadas">
          <button
            type="button"
            className={keyClass()}
            aria-label="Al principio"
            title="Al principio"
            disabled={!navigable || navIndex <= 0}
            onClick={() => goTo(0)}
          >
            <BackwardStepIcon variant="sharp-light" className="platform-md-icon" />
          </button>
          <button
            type="button"
            className={keyClass()}
            aria-label="Jugada anterior"
            title="Jugada anterior"
            disabled={!navigable || navIndex <= 0}
            onClick={() => goTo(navIndex - 1)}
          >
            <ChevronLeftIcon variant="sharp-light" className="platform-md-icon" />
          </button>
          <button
            type="button"
            className={keyClass()}
            aria-label={autoplay ? "Pausar" : "Reproducir la solución"}
            title={autoplay ? "Pausar" : "Reproducir la solución"}
            disabled={!walkthrough}
            onClick={onToggleAutoplay}
          >
            {autoplay ? (
              <PauseIcon variant="sharp-light" className="platform-md-icon" />
            ) : (
              <PlayIcon variant="sharp-light" className="platform-md-icon" />
            )}
          </button>
          <button
            type="button"
            className={keyClass(true)}
            aria-label="Jugada siguiente"
            title="Jugada siguiente"
            disabled={!navigable || navIndex >= navLast}
            onClick={() => goTo(navIndex + 1)}
          >
            <ChevronRightIcon variant="sharp-light" className="platform-md-icon" />
          </button>
          <button
            type="button"
            className={keyClass()}
            aria-label="Al final"
            title="Al final"
            disabled={!navigable || navIndex >= navLast}
            onClick={() => goTo(navLast)}
          >
            <ForwardStepIcon variant="sharp-light" className="platform-md-icon" />
          </button>
        </div>
      </div>

      <div className="exercise-solver-page__column">
        <div className={`exercise-solver-page__status exercise-solver-page__status_tone_${tone}`} aria-live="polite">
          {comment && <p className="exercise-solver-page__comment">{comment}</p>}

          {resultText && result ? (
            <ResultBody
              text={resultText}
              result={result}
              explanation={exercise.explanation}
              next={next}
              back={back}
              onRetry={() => {
                setViewPath(null);
                onRetry();
              }}
            />
          ) : wrong ? (
            <div className="exercise-solver-page__head">
              <CircleXmarkIcon
                variant="classic-solid"
                className="exercise-solver-page__mark exercise-solver-page__mark_tone_error"
              />
              <div className="exercise-solver-page__text">
                <p className="exercise-solver-page__title">Ésa no es la jugada</p>
                <p className="exercise-solver-page__line">
                  {submitsAttempt(mode)
                    ? "Prueba otra cosa. Ya no cuenta como resuelto, pero puedes terminarlo."
                    : "Prueba otra cosa."}
                </p>
              </div>
            </div>
          ) : (
            !over && (
              <>
                <div className="exercise-solver-page__head">
                  <span
                    className={`exercise-solver-page__side exercise-solver-page__side_color_${player}`}
                    aria-label={player === "white" ? "Juegan blancas" : "Juegan negras"}
                    role="img"
                  />
                  <p className="exercise-solver-page__title">Tu turno</p>
                </div>
                <p className="exercise-solver-page__line">{prompt}</p>
                <p className="exercise-solver-page__chips">
                  {aside?.topic && (
                    <span className="exercise-solver-page__chip">
                      <TagIcon variant="duotone-light" className="exercise-solver-page__chip-icon" />
                      {aside.topic.label}
                    </span>
                  )}
                  <span className="exercise-solver-page__chip">
                    {exerciseKindLabel(exercise.kind, exercise.mateIn)} · {exercise.difficulty}
                  </span>
                  {solve.failed && (
                    <span className="exercise-solver-page__chip exercise-solver-page__chip_tone_failed">Fallado</span>
                  )}
                </p>
                {feedback && (
                  <p className={`exercise-solver-page__feedback exercise-solver-page__feedback_tone_${feedback.tone}`}>
                    {feedback.text}
                  </p>
                )}
              </>
            )
          )}

          {session.textHints.length > 0 && !over && (
            <ol className="exercise-solver-page__hints" aria-label="Pistas">
              {session.textHints.map((hint, index) => (
                <li key={index} className="exercise-solver-page__hint">
                  <LightbulbIcon variant="classic-solid" className="exercise-solver-page__hint-icon" />
                  <span>
                    <span className="exercise-solver-page__hint-number">Pista {index + 1}:</span> {hint}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {!over && !walkthrough && (
            <div className="exercise-solver-page__actions">
              <button type="button" className={mdButton("tonal", "sm")} onClick={onHint} disabled={!canMove(session)}>
                <LightbulbIcon variant="classic-solid" className="platform-md-icon" />
                Pista
              </button>
              <button
                type="button"
                className={mdButton("outlined", "sm")}
                onClick={onShowSolution}
                disabled={solve.completed}
              >
                <EyeIcon variant="duotone-light" className="platform-md-icon" />
                Ver la solución
              </button>
            </div>
          )}

          {mode === "unscored" && (
            <p className="exercise-solver-page__note">Ya lo intentaste hoy: este intento no cuenta.</p>
          )}
          {mode === "block" && <p className="exercise-solver-page__note">{BLOCK_NOTE}</p>}
          {mode === "preview" && <p className="exercise-solver-page__note">Vista previa: el intento no se guarda.</p>}
          {saveNote && (
            <p
              className={`exercise-solver-page__note exercise-solver-page__note_tone_${saveNote.variant}`}
              role={saveNote.variant === "error" ? "alert" : undefined}
            >
              {saveNote.message}
            </p>
          )}
        </div>

        <div className="exercise-solver-page__card" role="group" aria-label="Jugadas">
          <p className="exercise-solver-page__label">Jugadas</p>
          {rows.length > 0 ? (
            <ol className="exercise-solver-page__notation">
              {rows.map((row, index) =>
                row.kind === "moves" ? (
                  <li key={index} className="exercise-solver-page__row">
                    <span className="exercise-solver-page__number">{row.number}.</span>
                    {moveCell(row.white, "…")}
                    {moveCell(row.black, "")}
                  </li>
                ) : (
                  <li key={index} className="exercise-solver-page__miss">
                    {row.label}
                    <XmarkIcon variant="classic-solid" className="exercise-solver-page__miss-mark" />
                    {row.first && <span className="exercise-solver-page__miss-note">tu intento</span>}
                  </li>
                ),
              )}
            </ol>
          ) : (
            <p className="exercise-solver-page__empty">Posición inicial: aún no hay jugadas.</p>
          )}
        </div>

        {aside && (
          <div className="exercise-solver-page__card">
            <ExerciseSessionHistory scope={aside.scope} current={{ title: exercise.title, open: !over }} />
          </div>
        )}

        <div
          className="exercise-solver-page__card exercise-solver-page__card_kind_setting exercise-solver-page__card_place_foot"
          aria-label="Tu puntuación"
          role="group"
        >
          <PlatformSwitch
            label="Cuenta para tu puntuación"
            checked={rating.rated}
            onCheckedChange={(on) => setRatingSwitch("rated", on)}
            layout="inline"
            className="exercise-solver-page__switch"
          />
          <span className="exercise-solver-page__rating">{rating.rating}</span>
          {delta !== null && delta !== 0 && (
            <span
              className={`exercise-solver-page__delta exercise-solver-page__delta_tone_${delta > 0 ? "up" : "down"}`}
            >
              {delta > 0 ? (
                <ArrowUpRightIcon variant="classic-solid" className="exercise-solver-page__delta-icon" />
              ) : (
                <ArrowDownRightIcon variant="classic-solid" className="exercise-solver-page__delta-icon" />
              )}
              {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
            </span>
          )}
        </div>
        <div className="exercise-solver-page__card exercise-solver-page__card_kind_setting">
          <PlatformSwitch
            label="Pasar al siguiente al resolver"
            checked={rating.autoNext}
            onCheckedChange={(on) => setRatingSwitch("autoNext", on)}
            layout="inline"
            className="exercise-solver-page__switch"
          />
        </div>
      </div>
    </section>
  );
}

interface ResultBodyProps {
  text: ReturnType<typeof resultTextOf>;
  result: SolverResult;
  explanation: string | null;
  next?: ExerciseSolverViewProps["next"];
  back?: ExerciseSolverViewProps["back"];
  onRetry: () => void;
}

/** What replaces «Tu turno» once it is over: how it went, the explanation, and the way on. */
function ResultBody({ text, result, explanation, next, back, onRetry }: ResultBodyProps) {
  const Icon = text.tone === "error" ? CircleXmarkIcon : CircleCheckIcon;
  return (
    <div className="exercise-solver-page__result" role="status">
      <div className="exercise-solver-page__head">
        <Icon
          variant="classic-solid"
          className={`exercise-solver-page__mark exercise-solver-page__mark_tone_${text.tone}`}
        />
        <div className="exercise-solver-page__text">
          <p className="exercise-solver-page__title">{text.title}</p>
          {text.line && <p className="exercise-solver-page__line">{text.line}</p>}
        </div>
      </div>
      {result.mistake && (
        <p className="exercise-solver-page__line">
          Jugaste {result.mistake.played}; la jugada era {result.mistake.expected}.
        </p>
      )}
      {explanation && <p className="exercise-solver-page__explanation">{explanation}</p>}

      <div className="exercise-solver-page__actions">
        {next && (
          <Link href={next.href} className={mdButton("filled", "sm")}>
            {next.label}
            <AngleRightIcon variant="classic-solid" className="platform-md-icon" />
          </Link>
        )}
        {back && (
          // One filled: the way on, or the way back when there is nothing after it.
          <Link href={back.href} className={mdButton(next ? "outlined" : "filled", "sm")}>
            {back.label}
          </Link>
        )}
        <button type="button" className={mdButton("text", "sm")} onClick={onRetry}>
          <RotateLeftIcon variant="classic-solid" className="platform-md-icon" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
