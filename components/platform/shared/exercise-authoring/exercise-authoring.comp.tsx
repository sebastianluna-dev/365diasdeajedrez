"use client";

import { useActionState, useEffect, useId, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { INITIAL_FEN } from "chessops/fen";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PiecePlacementBoard } from "@/components/chess/piece-placement-board/piece-placement-board.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ArrowsRotateIcon } from "@/components/icons/arrows-rotate-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleExclamationIcon } from "@/components/icons/circle-exclamation-icon.comp";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { CloneIcon } from "@/components/icons/clone-icon.comp";
import { EraserIcon } from "@/components/icons/eraser-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { MovePathPicker, type FetchPgn } from "@/components/platform/shared/move-path-picker/move-path-picker.comp";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import type { ExerciseSolverExercise } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { PlatformTabPanel, PlatformTabs } from "@/components/platform/shared/platform-tabs/platform-tabs.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import {
  EXERCISE_ERROR_MESSAGES,
  SETUP_PROBLEM_MESSAGES,
  solutionProblemText,
  solutionWarningText,
} from "@/constants/platform/exercise-messages.const";
import {
  MATE_IN_MAX,
  analyzeSolution,
  dropMistakeVariants,
  emptySolutionPgn,
  exerciseSeedFromGame,
  type SolutionProblem,
} from "@/lib/chess/exercise-format";
import { FEN_MAX_LENGTH, readPositionInput } from "@/lib/chess/position-input";
import {
  availableCastling,
  enPassantOptions,
  setupOfFen,
  validateSetup,
  type SetupInput,
} from "@/lib/chess/position-setup";
import { formatEloRange } from "@/services/courses/level-rules";
import type { ExerciseFormTab } from "@/services/shared/exercise-form";
import { levelOfDifficulty } from "@/services/shared/exercise-level";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { topicCardGroups } from "@/services/shared/topic-groups";
import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseLockReason,
  ExerciseSaveAction,
  ExerciseSaveButton,
  ExerciseSaveIntent,
} from "./exercise-authoring.types";
import {
  defaultPrompt,
  draftFields,
  draftIssues,
  solutionFromPasted,
  solutionHasMoves,
  sourceOfPgn,
  startFenOf,
  startOfSetup,
  tabOfField,
  withSource,
  type DraftIssue,
  type ExerciseDraft,
} from "./exercise-draft";
import { useExerciseDraft } from "./use-exercise-draft.hook";
import "./exercise-authoring.comp.css";

export interface ExerciseAuthoringProps {
  /** The exercise, or a new one's prefill (`id` null). */
  exercise: ExerciseAuthoringExercise;
  catalogs: ExerciseAuthoringCatalogs;
  /** The author's study games, for «Desde una partida». */
  games: ExerciseAuthoringGame[];
  permissions: ExerciseAuthoringPermissions;
  /** The save bar's buttons, by what the author may ask for in this status. */
  buttons: ExerciseSaveButton[];
  /** The save, bound to this exercise on the server; a stub in Storybook. */
  save: ExerciseSaveAction;
  /** Reads a game of the author's studies for «Desde una partida». */
  fetchGamePgn: FetchPgn;
  /** «Duplicar», bound to this exercise: offered with a locked content. */
  duplicate?: (formData: FormData) => Promise<void>;
  /**
   * The tab it opens on. Without it, a saved exercise opens on «Solución» and
   * a new one on «Posición»; a new one seeded from a game («Crear ejercicio
   * desde aquí», D11) opens on «Solución», where what followed the move is.
   */
  initialTab?: ExerciseFormTab;
}

type Way = "place" | "paste" | "game";

/** The editor's steps: the three the form's errors belong to, and «Probar», which holds no field. */
type AuthoringTab = ExerciseFormTab | "try";

const TAB_LABELS: Record<AuthoringTab, string> = {
  position: "Posición",
  solution: "Solución",
  data: "Datos",
  try: "Probar",
};
const TABS: AuthoringTab[] = ["position", "solution", "data", "try"];

const LOCK_REASONS: Record<ExerciseLockReason, string> = {
  inReview: "Está en revisión: retira la propuesta para editarlo.",
  inLibrary: "Está en la biblioteca: duplícalo para hacer tu versión.",
};

const CASTLING_RIGHTS = [
  { right: "K", label: "Blancas, enroque corto" },
  { right: "Q", label: "Blancas, enroque largo" },
  { right: "k", label: "Negras, enroque corto" },
  { right: "q", label: "Negras, enroque largo" },
] as const;

const KIND_DESCRIPTIONS: Record<ExerciseKindCode, string> = {
  SEQUENCE: "El alumno juega la solución hasta el final.",
  MATE_IN: "Cada línea de la solución termina en mate.",
};

const MATE_IN_OPTIONS = Array.from({ length: MATE_IN_MAX }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

const SOLUTION_PROBLEMS = new Set<string>([
  "unreadable",
  "badPosition",
  "unsupportedVariant",
  "noMoves",
  "illegalMove",
  "mateInMissing",
  "mateInOnSequence",
  "notMate",
  "mateTooLong",
  "mateLengthMismatch",
  "notForced",
  "mistakeVariant",
]);

/** The issues of a refused save, in the words of the screen, each with its tab. */
function serverIssues(state: PopupFormState, draft: ExerciseDraft): DraftIssue[] {
  if (state.status !== "error") return [];
  return Object.entries(state.fieldErrors ?? {}).map(([field, error]) => {
    const mateIn = draft.kind === EXERCISE_KIND.MATE_IN ? Number(draft.mateIn) || null : null;
    const message =
      field === "solutionPgn" && SOLUTION_PROBLEMS.has(error.code)
        ? solutionProblemText(
            { code: error.code, path: String(error.args?.path ?? "") } as SolutionProblem,
            draft.solutionPgn,
            mateIn,
          )
        : (EXERCISE_ERROR_MESSAGES[error.code] ?? EXERCISE_ERROR_MESSAGES[field] ?? EXERCISE_ERROR_MESSAGES.invalid);
    return { tab: tabOfField(field), field, message: message ?? "" };
  });
}

/** The first focusable control inside what a field names, or the field's own input. */
function controlOf(root: HTMLElement, field: string): HTMLElement | null {
  const holder = root.querySelector<HTMLElement>(`[data-field="${field}"]`);
  const focusable = "input:not([type='hidden']):not(:disabled), textarea:not(:disabled), button:not(:disabled)";
  if (holder) return holder.matches(focusable) ? holder : (holder.querySelector<HTMLElement>(focusable) ?? holder);
  return root.querySelector<HTMLElement>(`[name="${field}"]:not([type='hidden'])`);
}

/**
 * The exercise editor (PLAN.md §4.2), the same for every author: the
 * teacher's bank, and later the staff's library and a lesson's exercises.
 * Three steps as tabs — «Posición» (pieces placed on a board, a pasted FEN or
 * PGN, or a move of one of the author's games), «Solución» (played on the
 * board, with variants and comments, and the solution's rules checked live)
 * and «Datos» — over one lifted draft, so switching tabs loses nothing, and
 * one save form outside the tabs that sends that draft. Before sending, the
 * same rules the server applies are checked: the editor moves to the tab of
 * the first problem and focuses it, and every tab with one carries a mark.
 */
export function ExerciseAuthoring({
  exercise,
  catalogs,
  games,
  permissions,
  buttons,
  save,
  fetchGamePgn,
  duplicate,
  initialTab,
}: ExerciseAuthoringProps) {
  const { draft, update, changePosition, pendingPosition, confirmPosition, cancelPosition, boardKey } =
    useExerciseDraft(exercise);
  const [tab, setTab] = useState<AuthoringTab>(initialTab ?? (exercise.id ? "solution" : "position"));
  const [state, formAction] = useActionState(save, POPUP_FORM_IDLE);
  const [isPending, startSave] = useTransition();
  const [pendingIntent, setPendingIntent] = useState<ExerciseSaveIntent | null>(null);
  /** The last button pressed: from then on its rules are checked live, so a mark goes when it is fixed. */
  const [attempt, setAttempt] = useState<{ needsReadiness: boolean } | null>(null);
  /** The draft the server's answer is about: its errors are shown while nothing changed since. */
  const [answered, setAnswered] = useState<ExerciseDraft | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ field: string; count: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<PlatformConfirmPopupHandle>(null);
  const confirmedRef = useRef(false);
  const locked = permissions.contentLocked !== null;

  const startFen = startFenOf(draft.solutionPgn);
  const setupCheck = validateSetup(draft.setup);
  const issues = [
    ...(attempt ? draftIssues(draft, attempt.needsReadiness) : []),
    ...(answered === draft ? serverIssues(state, draft) : []),
  ];
  const issueOf = (field: string) => issues.find((issue) => issue.field === field)?.message;
  const formError =
    state.status === "error" && state.formError && answered === draft
      ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
      : undefined;

  // The confirmation opens on the change it holds; it is a sibling of the tabs.
  useEffect(() => {
    if (pendingPosition) confirmRef.current?.open();
  }, [pendingPosition]);

  // After the tab of a problem has opened, its field takes the focus.
  useEffect(() => {
    if (!focusRequest || !rootRef.current) return;
    controlOf(rootRef.current, focusRequest.field)?.focus();
  }, [focusRequest, tab]);

  /** A new position and the solution that goes with it, asked first when it replaces moves. */
  const applyPosition = (next: ExerciseDraft, thenTab?: ExerciseFormTab) => {
    const held = changePosition(next);
    if (!held && thenTab) setTab(thenTab);
  };

  /** A change made with «Colocar piezas»: the solution follows only when the start changes. */
  const changeSetup = (setup: SetupInput) => {
    const next = startOfSetup(setup);
    if (next.startFen === null || next.startFen === startFen) {
      update({ setup: next.setup });
      return;
    }
    applyPosition({ ...draft, setup: next.setup, solutionPgn: emptySolutionPgn(next.startFen), sourceGameId: null });
  };

  /** A start that came another way (pasted, from a game): the board follows it. */
  const loadSolution = (solutionPgn: string, extra: Partial<ExerciseDraft>, thenTab?: ExerciseFormTab) => {
    const fen = startFenOf(solutionPgn);
    const setup = fen ? setupOfFen(fen) : null;
    if (!setup) return;
    applyPosition({ ...draft, ...extra, setup, solutionPgn }, thenTab);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const button = buttons.find((candidate) => candidate.intent === submitter?.value) ?? buttons[0];
    if (!button) return;
    setAttempt({ needsReadiness: button.needsReadiness });
    const found = draftIssues(draft, button.needsReadiness);
    const [first] = found;
    if (first) {
      setTab(first.tab);
      setFocusRequest((current) => ({ field: first.field, count: (current?.count ?? 0) + 1 }));
      return;
    }
    const formData = new FormData(event.currentTarget, submitter);
    setAnswered(draft);
    setPendingIntent(button.intent);
    startSave(() => formAction(formData));
  };

  const tabs = TABS.map((value) => ({
    value,
    label: TAB_LABELS[value],
    invalid: issues.some((issue) => issue.tab === value),
  }));

  return (
    <div className="exercise-authoring" ref={rootRef}>
      {permissions.contentLocked && (
        <p className="exercise-authoring__lock" role="status">
          <LockIcon variant="classic-solid" className="exercise-authoring__lock-icon" />
          {LOCK_REASONS[permissions.contentLocked]}
        </p>
      )}

      <PlatformTabs
        label="Pasos del ejercicio"
        tabs={tabs}
        value={tab}
        onValueChange={(value) => setTab(value as AuthoringTab)}
      >
        <PlatformTabPanel value="position">
          <PositionStep
            draft={draft}
            startFen={startFen}
            setupProblem={setupCheck.ok ? null : SETUP_PROBLEM_MESSAGES[setupCheck.problem]}
            issue={issueOf("position")}
            games={games}
            locked={locked}
            boardKey={boardKey}
            fetchGamePgn={fetchGamePgn}
            onSetupChange={changeSetup}
            onSolutionLoad={loadSolution}
          />
        </PlatformTabPanel>

        <PlatformTabPanel value="solution">
          <SolutionStep
            draft={draft}
            startFen={setupCheck.ok ? startFen : null}
            issue={issueOf("solutionPgn")}
            locked={locked}
            onSolutionChange={(solutionPgn) => update({ solutionPgn })}
          />
        </PlatformTabPanel>

        <PlatformTabPanel value="data">
          <DataStep
            draft={draft}
            startFen={startFen}
            catalogs={catalogs}
            locked={locked}
            issueOf={issueOf}
            onChange={update}
          />
        </PlatformTabPanel>

        <PlatformTabPanel value="try">
          <TryStep draft={draft} exerciseId={exercise.id} />
        </PlatformTabPanel>
      </PlatformTabs>

      {locked ? (
        permissions.canDuplicate &&
        duplicate && (
          <form action={duplicate} className="exercise-authoring__save">
            <div className="exercise-authoring__buttons">
              <SubmitButton className="platform-button platform-button_variant_accent" pendingLabel="Duplicando…">
                <CloneIcon variant="classic-solid" className="platform-button__icon" />
                Duplicar
              </SubmitButton>
            </div>
          </form>
        )
      ) : (
        <PlatformForm className="exercise-authoring__save" onSubmit={submit}>
          {draftFields(draft).map(([name, value], index) => (
            <input key={`${name}-${index}`} type="hidden" name={name} value={value} />
          ))}
          {formError && <PlatformNotice message={formError} />}
          {issues.length > 0 && (
            <p className="exercise-authoring__save-note">Revisa las pestañas marcadas antes de guardar.</p>
          )}
          <div className="exercise-authoring__buttons">
            {buttons.map((button) => (
              <SubmitButton
                key={button.intent}
                name="intent"
                value={button.intent}
                className={`platform-button${button.accent ? " platform-button_variant_accent" : ""}`}
                pending={isPending && pendingIntent === button.intent}
                disabled={isPending}
                pendingLabel={button.pendingLabel}
              >
                {button.label}
              </SubmitButton>
            ))}
          </div>
        </PlatformForm>
      )}

      <PlatformConfirmPopup
        ref={confirmRef}
        subject="la solución"
        title="¿Eliminar la solución?"
        description="Con otra posición, las jugadas de la solución ya no sirven: se eliminan y la juegas de nuevo."
        confirmLabel="Eliminar la solución"
        action={async () => {
          confirmedRef.current = true;
          confirmPosition();
        }}
        onClose={() => {
          if (!confirmedRef.current) cancelPosition();
          confirmedRef.current = false;
        }}
      />
    </div>
  );
}

interface PositionStepProps {
  draft: ExerciseDraft;
  startFen: string | null;
  setupProblem: string | null;
  issue: string | undefined;
  games: ExerciseAuthoringGame[];
  locked: boolean;
  boardKey: number;
  fetchGamePgn: FetchPgn;
  onSetupChange: (setup: SetupInput) => void;
  onSolutionLoad: (solutionPgn: string, extra: Partial<ExerciseDraft>, thenTab?: ExerciseFormTab) => void;
}

/** «Posición»: three ways in, one start (D09). */
function PositionStep({
  draft,
  startFen,
  setupProblem,
  issue,
  games,
  locked,
  boardKey,
  fetchGamePgn,
  onSetupChange,
  onSolutionLoad,
}: PositionStepProps) {
  const [way, setWay] = useState<Way>("place");
  const [flipped, setFlipped] = useState(false);
  const [pasteError, setPasteError] = useState<{ field: "fen" | "pgn"; message: string } | null>(null);
  const [gameId, setGameId] = useState("");
  const { setup } = draft;
  const available = availableCastling(setup.placement);
  const epOptions = enPassantOptions(setup.placement, setup.turn);
  const problem = issue ?? setupProblem;

  const paste = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reading = readPositionInput({ fen: String(data.get("fen") ?? ""), pgn: String(data.get("pgn") ?? "") });
    if (!reading.ok) {
      setPasteError({ field: reading.field ?? "fen", message: reading.message });
      return;
    }
    const useMoves = data.get("useMoves") === "on";
    const solutionPgn = solutionFromPasted(reading.pgn, useMoves);
    if (!solutionPgn) {
      setPasteError({ field: "pgn", message: "No es un PGN válido." });
      return;
    }
    setPasteError(null);
    event.currentTarget.reset();
    onSolutionLoad(
      solutionPgn,
      { ...withSource(draft, sourceOfPgn(reading.pgn)), sourceGameId: null },
      solutionHasMoves(solutionPgn) ? "solution" : undefined,
    );
  };

  const gameGroups = Object.values(
    games.reduce<Record<string, { label: string; options: { value: string; label: string }[] }>>((groups, game) => {
      const group = groups[game.studyName] ?? { label: game.studyName, options: [] };
      group.options.push({ value: game.id, label: game.label });
      groups[game.studyName] = group;
      return groups;
    }, {}),
  );

  return (
    <div className="exercise-authoring__position">
      {!locked && (
        <PlatformChoiceCards
          aria-label="Cómo llegar a la posición"
          value={way}
          onValueChange={(value) => setWay(value as Way)}
          options={[
            { value: "place", label: "Colocar piezas" },
            { value: "paste", label: "Pegar FEN o PGN" },
            { value: "game", label: "Desde una partida" },
          ]}
        />
      )}

      {way === "place" || locked ? (
        <div className="exercise-authoring__step">
          <div className="exercise-authoring__board" data-field="position">
            <PiecePlacementBoard
              key={boardKey}
              placement={setup.placement}
              onPlacementChange={(placement) => onSetupChange({ ...setup, placement })}
              orientation={flipped ? "black" : "white"}
              disabled={locked}
            />
            {problem && <PlatformNotice message={problem} />}
          </div>

          <PlatformForm className="exercise-authoring__fields" onSubmit={(event) => event.preventDefault()}>
            <PlatformFormGroup label="Turno">
              <PlatformChoiceCards
                value={setup.turn}
                onValueChange={(turn) => onSetupChange({ ...setup, turn: turn as SetupInput["turn"] })}
                disabled={locked}
                options={[
                  { value: "white", label: "Juegan blancas" },
                  { value: "black", label: "Juegan negras" },
                ]}
              />
            </PlatformFormGroup>

            <PlatformFormGroup label="Enroques">
              <div role="group" className="exercise-authoring__castling">
                {CASTLING_RIGHTS.map(({ right, label }) => (
                  <PlatformCheckbox
                    key={right}
                    label={label}
                    hint={available[right] ? undefined : "El rey o la torre no está en su casilla."}
                    checked={setup.castling[right]}
                    onCheckedChange={(checked) =>
                      onSetupChange({ ...setup, castling: { ...setup.castling, [right]: checked } })
                    }
                    disabled={locked || !available[right]}
                  />
                ))}
              </div>
            </PlatformFormGroup>

            <PlatformFormField
              name="epSquare"
              label="Captura al paso"
              hint={epOptions.length === 0 ? "Ningún peón acaba de avanzar dos casillas en esta posición." : undefined}
            >
              <PlatformSelect
                emptyOption="Ninguna"
                options={epOptions.map((square) => ({ value: square, label: square }))}
                value={setup.epSquare ?? ""}
                onValueChange={(square) => onSetupChange({ ...setup, epSquare: square || null })}
                disabled={locked || epOptions.length === 0}
              />
            </PlatformFormField>

            <div className="exercise-authoring__tools">
              <button
                type="button"
                className="platform-button platform-button_size_sm"
                disabled={locked}
                onClick={() => onSetupChange(setupOfFen(INITIAL_FEN) ?? setup)}
              >
                <ChessBoardIcon variant="classic-solid" className="platform-button__icon" />
                Posición inicial
              </button>
              <button
                type="button"
                className="platform-button platform-button_size_sm"
                disabled={locked}
                onClick={() => onSetupChange({ ...setup, placement: "8/8/8/8/8/8/8/8", epSquare: null })}
              >
                <EraserIcon variant="classic-solid" className="platform-button__icon" />
                Vaciar el tablero
              </button>
              <button
                type="button"
                className="platform-button platform-button_size_sm"
                onClick={() => setFlipped((current) => !current)}
              >
                <ArrowsRotateIcon variant="classic-solid" className="platform-button__icon" />
                Girar el tablero
              </button>
            </div>
          </PlatformForm>
        </div>
      ) : way === "paste" ? (
        <div className="exercise-authoring__step">
          <div className="exercise-authoring__board" data-field="position">
            <StaticDiagram fen={startFen ?? INITIAL_FEN} orientation={setup.turn} caption="La posición de ahora" />
            {problem && <PlatformNotice message={problem} />}
          </div>
          <PlatformForm className="exercise-authoring__fields" onSubmit={paste} onChange={() => setPasteError(null)}>
            <PlatformFormField
              name="fen"
              label="FEN"
              hint="Una posición. Si escribes los dos, se carga el PGN."
              serverError={pasteError?.field === "fen" ? pasteError.message : undefined}
            >
              <input
                type="text"
                maxLength={FEN_MAX_LENGTH}
                spellCheck={false}
                autoComplete="off"
                placeholder="6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"
              />
            </PlatformFormField>
            <PlatformFormField
              name="pgn"
              label="PGN"
              serverError={pasteError?.field === "pgn" ? pasteError.message : undefined}
            >
              <textarea rows={5} maxLength={PGN_MAX_LENGTH} spellCheck={false} placeholder={'[FEN "…"]\n1. Td8+ …'} />
            </PlatformFormField>
            <PlatformCheckbox
              name="useMoves"
              label="Usar sus jugadas como solución"
              hint="Si el PGN trae jugadas, la solución empieza con ellas."
              defaultChecked
            />
            <div className="exercise-authoring__tools">
              <button type="submit" className="platform-button">
                Cargar posición
              </button>
            </div>
          </PlatformForm>
        </div>
      ) : (
        <div className="exercise-authoring__from-game" data-field="position">
          {games.length === 0 ? (
            <p className="exercise-authoring__lead">
              Todavía no tienes partidas en tus estudios. Agrega una en «Mis estudios» y vuelve aquí.
            </p>
          ) : (
            <>
              <PlatformForm className="exercise-authoring__fields" onSubmit={(event) => event.preventDefault()}>
                <PlatformFormField name="gameId" label="Partida">
                  <PlatformSelect
                    groups={gameGroups}
                    value={gameId}
                    onValueChange={setGameId}
                    placeholder="Elige una partida"
                  />
                </PlatformFormField>
              </PlatformForm>
              <MovePathPicker
                referenceId={gameId}
                hint="Ve a la jugada desde la que empieza el ejercicio y pulsa «Usar esta posición»: lo que sigue en la partida será la solución."
                value=""
                fetchPgn={fetchGamePgn}
                onChange={(path, pgn) => {
                  const seed = exerciseSeedFromGame(pgn, path);
                  if (!seed) return;
                  onSolutionLoad(
                    seed.solutionPgn,
                    { ...withSource(draft, sourceOfPgn(pgn)), sourceGameId: gameId },
                    "solution",
                  );
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface SolutionStepProps {
  draft: ExerciseDraft;
  /** Null while the position is refused: there is nothing to play on. */
  startFen: string | null;
  issue: string | undefined;
  locked: boolean;
  onSolutionChange: (solutionPgn: string) => void;
}

/** «Solución»: played on the board (D10), its rules checked as it is played. */
function SolutionStep({ draft, startFen, issue, locked, onSolutionChange }: SolutionStepProps) {
  const confirmDrop = useRef<PlatformConfirmPopupHandle>(null);
  const mateIn = draft.kind === EXERCISE_KIND.MATE_IN ? Number(draft.mateIn) || null : null;
  const analysis = useMemo(
    () => analyzeSolution({ solutionPgn: draft.solutionPgn, kind: draft.kind, mateIn }),
    [draft.solutionPgn, draft.kind, mateIn],
  );

  if (!startFen) {
    return (
      <p className="exercise-authoring__lead" data-field="solutionPgn">
        Arregla la posición en «Posición» antes de jugar la solución.
      </p>
    );
  }

  const turn = startFen.split(" ")[1] === "b" ? "black" : "white";
  const problems = analysis.ok ? [] : analysis.problems;
  const hasMistakeVariant = problems.some((problem) => problem.code === "mistakeVariant");

  return (
    <div className="exercise-authoring__solution">
      <p className="exercise-authoring__lead">
        Juega en el tablero tus jugadas y las respuestas del rival. Una jugada hecha desde una posición anterior es una
        variante: cada variante tuya es otra respuesta que se acepta.
      </p>
      <GameViewer
        key={startFen}
        pgn={draft.solutionPgn}
        orientation={turn}
        editable={!locked}
        onPgnChange={onSolutionChange}
        tools={locked ? undefined : {}}
      />
      {/* tabIndex -1: the save moves the focus here when the solution is what stops it, so its problems are read first. */}
      <div className="exercise-authoring__report" data-field="solutionPgn" tabIndex={-1}>
        {issue && !problems.length && <PlatformNotice message={issue} />}
        {problems.length === 0 && (
          <p className="exercise-authoring__check exercise-authoring__check_tone_success">
            <CircleCheckIcon variant="classic-solid" className="exercise-authoring__check-icon" />
            La solución cumple las reglas.
          </p>
        )}
        {problems.length > 0 && (
          <ul className="exercise-authoring__checks">
            {problems.map((problem, index) => (
              <li key={index} className="exercise-authoring__check exercise-authoring__check_tone_danger">
                <CircleExclamationIcon variant="classic-solid" className="exercise-authoring__check-icon" />
                {solutionProblemText(problem, draft.solutionPgn, mateIn)}
              </li>
            ))}
          </ul>
        )}
        {analysis.warnings.length > 0 && (
          <ul className="exercise-authoring__checks">
            {analysis.warnings.map((warning, index) => (
              <li key={index} className="exercise-authoring__check">
                <CircleInfoIcon variant="classic-solid" className="exercise-authoring__check-icon" />
                {solutionWarningText(warning, draft.solutionPgn)}
              </li>
            ))}
          </ul>
        )}
        {hasMistakeVariant && !locked && (
          <>
            <button
              type="button"
              className="platform-button platform-button_size_sm platform-button_variant_caution"
              onClick={(event) => confirmDrop.current?.open(event)}
            >
              Eliminar las variantes marcadas como error
            </button>
            {/* «Eliminar»: the variants leave the solution with what hangs from them, and only playing them again brings them back. */}
            <PlatformConfirmPopup
              ref={confirmDrop}
              subject="las variantes marcadas como error"
              title="¿Eliminar las variantes marcadas como error?"
              description="Se eliminan de la solución las variantes marcadas como error, con sus jugadas y sus comentarios."
              confirmLabel="Eliminar las variantes"
              action={async () => onSolutionChange(dropMistakeVariants(draft.solutionPgn))}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface DataStepProps {
  draft: ExerciseDraft;
  startFen: string | null;
  catalogs: ExerciseAuthoringCatalogs;
  locked: boolean;
  issueOf: (field: string) => string | undefined;
  onChange: (patch: Partial<ExerciseDraft>) => void;
}

/** «Datos» (D13, D38): what the student reads and how the exercise is found. */
function DataStep({ draft, startFen, catalogs, locked, issueOf, onChange }: DataStepProps) {
  const difficulty = Number(draft.difficulty);
  const level = Number.isInteger(difficulty) ? levelOfDifficulty(difficulty, catalogs.levels) : null;
  const topicCards = topicCardGroups(catalogs.topics);
  const sourceId = useId();
  const text = (field: keyof ExerciseDraft) => ({
    value: draft[field] as string,
    onChange: (event: { currentTarget: { value: string } }) => onChange({ [field]: event.currentTarget.value }),
    disabled: locked,
  });

  return (
    <div className="exercise-authoring__step exercise-authoring__step_board_small">
      <div className="exercise-authoring__board">
        <StaticDiagram fen={startFen ?? INITIAL_FEN} orientation={draft.setup.turn} />
      </div>

      {/* Enter in a field does not save: the save is the bar's, and reads the draft. */}
      <PlatformForm className="exercise-authoring__fields" onSubmit={(event) => event.preventDefault()}>
        <PlatformFormField name="title" label="Título" serverError={issueOf("title")}>
          <input type="text" required maxLength={EXERCISE_LIMITS.title} {...text("title")} />
        </PlatformFormField>

        <PlatformFormField
          name="prompt"
          label="Enunciado"
          hint="Lo primero que lee el alumno. Si lo dejas vacío, dice quién juega."
          serverError={issueOf("prompt")}
        >
          <input
            type="text"
            maxLength={EXERCISE_LIMITS.prompt}
            placeholder={defaultPrompt(draft.setup.turn, draft.kind, draft.mateIn)}
            {...text("prompt")}
          />
        </PlatformFormField>

        <PlatformFormGroup label="Tipo">
          <PlatformChoiceCards
            value={draft.kind}
            onValueChange={(kind) =>
              onChange({ kind: kind as ExerciseKindCode, mateIn: kind === EXERCISE_KIND.MATE_IN ? draft.mateIn : "" })
            }
            disabled={locked}
            options={catalogs.kinds.map((kind) => ({
              value: kind.code,
              label: kind.label,
              description: KIND_DESCRIPTIONS[kind.code],
            }))}
          />
        </PlatformFormGroup>

        {draft.kind === EXERCISE_KIND.MATE_IN && (
          <div data-field="mateIn">
            <PlatformFormField name="mateIn" label="Mate en" serverError={issueOf("mateIn")}>
              <PlatformSelect
                required
                placeholder="Elige"
                options={MATE_IN_OPTIONS}
                value={draft.mateIn}
                onValueChange={(mateIn) => onChange({ mateIn })}
                disabled={locked}
              />
            </PlatformFormField>
          </div>
        )}

        <PlatformFormField
          name="difficulty"
          label="Dificultad"
          hint={
            level
              ? `Nivel: ${level.name} (${formatEloRange(level)})`
              : `Entre ${EXERCISE_LIMITS.difficultyMin} y ${EXERCISE_LIMITS.difficultyMax}, de ${EXERCISE_LIMITS.difficultyStep} en ${EXERCISE_LIMITS.difficultyStep}.`
          }
          serverError={issueOf("difficulty")}
        >
          <input
            type="number"
            required
            min={EXERCISE_LIMITS.difficultyMin}
            max={EXERCISE_LIMITS.difficultyMax}
            step={EXERCISE_LIMITS.difficultyStep}
            {...text("difficulty")}
          />
        </PlatformFormField>

        <div data-field="topics">
          <PlatformFormGroup label="Temas" serverError={issueOf("topics")}>
            <PlatformCheckCards
              layout="line"
              value={draft.topics}
              onValueChange={(topics) => onChange({ topics })}
              disabled={locked}
              {...topicCards}
            />
          </PlatformFormGroup>
        </div>

        {draft.hints.map((hint, index) => (
          <PlatformFormField
            key={index}
            name={`hint${index + 1}`}
            label={`Pista ${index + 1}`}
            hint={index === 0 ? "Sin pistas escritas, la pista señala la pieza que hay que mover." : undefined}
            serverError={index === 0 ? issueOf("hints") : undefined}
          >
            <input
              type="text"
              maxLength={EXERCISE_LIMITS.hint}
              value={hint}
              disabled={locked}
              onChange={(event) => {
                const hints = [...draft.hints] as ExerciseDraft["hints"];
                hints[index] = event.currentTarget.value;
                onChange({ hints });
              }}
            />
          </PlatformFormField>
        ))}

        <PlatformFormField
          name="explanation"
          label="Explicación"
          hint="Se muestra al terminar el ejercicio."
          serverError={issueOf("explanation")}
        >
          <textarea rows={4} maxLength={EXERCISE_LIMITS.explanation} {...text("explanation")} />
        </PlatformFormField>

        <div role="group" aria-labelledby={sourceId} className="exercise-authoring__source">
          <span id={sourceId} className="exercise-authoring__source-title">
            Origen
          </span>
          <OptionalFields>
            <div className="exercise-authoring__source-grid">
              <PlatformFormField name="sourceWhite" label="Blancas" serverError={issueOf("sourceWhite")}>
                <input type="text" maxLength={EXERCISE_LIMITS.sourcePlayer} {...text("sourceWhite")} />
              </PlatformFormField>
              <PlatformFormField name="sourceBlack" label="Negras" serverError={issueOf("sourceBlack")}>
                <input type="text" maxLength={EXERCISE_LIMITS.sourcePlayer} {...text("sourceBlack")} />
              </PlatformFormField>
              <PlatformFormField name="sourceEvent" label="Evento" serverError={issueOf("sourceEvent")}>
                <input type="text" maxLength={EXERCISE_LIMITS.sourceEvent} {...text("sourceEvent")} />
              </PlatformFormField>
              <PlatformFormField name="sourceYear" label="Año" serverError={issueOf("sourceYear")}>
                <input
                  type="number"
                  min={EXERCISE_LIMITS.sourceYearMin}
                  max={EXERCISE_LIMITS.sourceYearMax}
                  {...text("sourceYear")}
                />
              </PlatformFormField>
            </div>
          </OptionalFields>
        </div>
      </PlatformForm>
    </div>
  );
}

/** The draft as the solve screen reads it: what «Probar» solves, unsaved. */
function solverExerciseOf(draft: ExerciseDraft, exerciseId: string | null): ExerciseSolverExercise {
  return {
    id: exerciseId ?? "nuevo",
    title: draft.title.trim() || "Ejercicio sin título",
    prompt: draft.prompt.trim() || null,
    kind: draft.kind,
    mateIn: draft.kind === EXERCISE_KIND.MATE_IN ? Number.parseInt(draft.mateIn, 10) || null : null,
    solutionPgn: draft.solutionPgn,
    hints: draft.hints.map((hint) => hint.trim()).filter((hint) => hint.length > 0),
    explanation: draft.explanation.trim() || null,
    difficulty: Number.parseInt(draft.difficulty, 10) || 0,
  };
}

/**
 * «Probar» (PLAN.md §4.2): the solve screen in preview over the draft as it
 * stands — the prompt, the hints, the replies, the variants accepted and the
 * explanation —, before anything is saved. Nothing is recorded. It starts
 * again whenever the draft changes.
 */
function TryStep({ draft, exerciseId }: { draft: ExerciseDraft; exerciseId: string | null }) {
  const exercise = solverExerciseOf(draft, exerciseId);
  if (!solutionHasMoves(draft.solutionPgn)) {
    return (
      <p className="exercise-authoring__try-empty">
        Juega la solución en «Solución» para probarla aquí como la verán tus alumnos.
      </p>
    );
  }
  return (
    <div className="exercise-authoring__try">
      <ExerciseSolver
        key={[exercise.solutionPgn, exercise.kind, exercise.mateIn, ...exercise.hints].join("\u0000")}
        exercise={exercise}
        mode="preview"
      />
    </div>
  );
}
