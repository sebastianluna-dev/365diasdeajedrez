"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CodeBranchIcon } from "@/components/icons/code-branch-icon.comp";
import { CommentXmarkIcon } from "@/components/icons/comment-xmark-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import {
  GAME_DESTRUCTIVE_CONFIRMATIONS,
  type GameDestructiveStep,
} from "@/components/platform/shared/game-settings/game-settings.comp";
import type { GameListItem } from "@/components/platform/shared/game-list/game-list.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformSettingsGroup,
  PlatformSettingsPanel,
} from "@/components/platform/shared/platform-settings-panel/platform-settings-panel.comp";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { GAME_ANALYSIS_MODE, type GameAnalysisModeCode } from "@/constants/platform/study-codes.const";
import { StudyGameSettingsArt, type StudyGameSettingsArtKind } from "./study-game-settings-art.comp";

/**
 * What each clean-up asks before it is done, in the study's words: its games
 * are its chapters. The annotations' and the variations' are the game
 * settings' own.
 */
const CONFIRMATIONS: Record<GameDestructiveStep, { question: string; detail: string; submit: string }> = {
  ...GAME_DESTRUCTIVE_CONFIRMATIONS,
  game: {
    question: "¿Eliminar el capítulo?",
    detail: "Se elimina el capítulo entero, con su partida, sus variantes, comentarios y flechas.",
    submit: "Eliminar capítulo",
  },
};

/** What deleting a chapter a class shows takes with it, to be agreed to before the button works. */
const CLASS_BLOCKS_ACKNOWLEDGEMENT =
  "Este capítulo se usa en el contenido de alguna clase. Entiendo que esos bloques se quedarán vacíos.";

/** What «Ajustes del capítulo» can do, each a server action already bound to the study. */
export interface StudyGameSettingsActions {
  /** Saves one setting the moment it is chosen: the board's side, or the reading mode (`null`, the plain analysis). */
  setView: (
    gameId: string,
    setting: { orientationCode: "WHITE" | "BLACK" } | { analysisModeCode: GameAnalysisModeCode | null },
  ) => Promise<void>;
  clearAnnotations: (gameId: string) => Promise<void>;
  clearVariations: (gameId: string) => Promise<void>;
  /** Deletes the game; the action sends the browser on to where it belongs. */
  remove: (gameId: string, formData: FormData) => Promise<void>;
}

interface StudyGameSettingsProps {
  /** Every game of the study; the one on the board is read from the address. */
  games: GameListItem[];
  actions: StudyGameSettingsActions;
}

interface ChoiceProps {
  label: string;
  hint: string;
  art: StudyGameSettingsArtKind;
  isOn: boolean;
  onChoose: () => Promise<void>;
}

/**
 * One choice of the panel: a form whose button is the whole row — the ring,
 * the words and the drawing —, saving at once, as «Qué aprender» does in
 * the course's settings.
 */
function Choice({ label, hint, art, isOn, onChoose }: ChoiceProps) {
  return (
    <form action={onChoose}>
      <button
        type="submit"
        aria-pressed={isOn}
        className={`platform-settings__option${isOn ? " platform-settings__option_state_on" : ""}`}
      >
        <span className="platform-settings__ring" aria-hidden="true" />
        <span className="platform-settings__option-text">
          <span className="platform-settings__option-label">{label}</span>
          <span className="platform-settings__option-hint">{hint}</span>
        </span>
        <span className="platform-settings__option-art">
          <StudyGameSettingsArt kind={art} />
        </span>
      </button>
    </form>
  );
}

/** What each step of «Limpiar el capítulo» says on its row, and the icon at its lead. */
const CLEAN_STEPS: { step: GameDestructiveStep; label: string; hint: string; Icon: typeof TrashCanIcon }[] = [
  {
    step: "annotations",
    label: "Eliminar las anotaciones",
    hint: "Comentarios, flechas, signos y evaluaciones; las jugadas se quedan",
    Icon: CommentXmarkIcon,
  },
  { step: "variations", label: "Eliminar las variantes", hint: "Queda sólo la línea principal", Icon: CodeBranchIcon },
  {
    step: "game",
    label: "Eliminar el capítulo",
    hint: "Con su partida, sus variantes y comentarios",
    Icon: TrashCanIcon,
  },
];

/**
 * «Ajustes del capítulo» (2026-10-23, the owner's design on the canvas,
 * `MaterialM4EstudioAjustes`): the settings of the study's chapter on the
 * board — a study's games are its chapters — at the right of the workspace,
 * as «Ajustes del curso», opened by the gear in the bar
 * (`PlatformSettingsToggle`, which the layout puts there). It took the place
 * of the popup the rows' gears opened. Which side the board opens from and
 * how a reader goes through it, each saved the moment it is chosen; and what
 * clears the chapter — its annotations, its variations, the chapter itself —,
 * each behind its confirmation, since none can be undone. «Partida» is said
 * only of the game's own data, «Datos de la partida», where its name is
 * edited; the pinned comment, which the owner does not use, is not here.
 *
 * It belongs to the layout, as the study's column does, so it reads the
 * chapter on the board from the address; without one (an empty study) there
 * is no panel.
 */
export function StudyGameSettings({ games, actions }: StudyGameSettingsProps) {
  const { gameId = "" } = useParams<{ gameId?: string }>();
  const game = games.find((candidate) => candidate.id === gameId);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  /** The step the confirmation asks about: the last row pressed. */
  const [pending, setPending] = useState<GameDestructiveStep>("annotations");

  if (!game) return null;

  const isBlack = game.orientationCode === BOARD_ORIENTATION.BLACK;
  const conceals = game.analysisModeCode === GAME_ANALYSIS_MODE.CONCEAL;
  // The same condition as the server: only a game some class shows needs the
  // box ticked. Sent without it, the action would bounce instead of deleting.
  const needsClassConfirmation = pending === "game" && game.citedInClass === true;
  const confirmation = CONFIRMATIONS[pending];

  /** The words first, then the popup: it is named by them, and read as it opens. */
  const ask = (step: GameDestructiveStep) => {
    flushSync(() => setPending(step));
    confirm.current?.open();
  };

  const destroy = (formData: FormData) => {
    if (pending === "annotations") return actions.clearAnnotations(game.id);
    if (pending === "variations") return actions.clearVariations(game.id);
    return actions.remove(game.id, formData);
  };

  /**
   * After a clean-up the server rewrote the PGN the page holds in the
   * browser, so the page is loaded again with it: otherwise the next autosave
   * would write the old PGN back. After a deletion the action has sent the
   * browser on.
   */
  const done = () => {
    if (pending !== "game") window.location.reload();
  };

  return (
    <>
      <PlatformSettingsPanel title="Ajustes del capítulo">
        <PlatformSettingsGroup title="El tablero, desde">
          <Choice
            label="Las blancas"
            hint="Las blancas abajo"
            art="white"
            isOn={!isBlack}
            onChoose={() => actions.setView(game.id, { orientationCode: "WHITE" })}
          />
          <Choice
            label="Las negras"
            hint="El tablero se gira: las negras abajo"
            art="black"
            isOn={isBlack}
            onChoose={() => actions.setView(game.id, { orientationCode: "BLACK" })}
          />
        </PlatformSettingsGroup>

        <PlatformSettingsGroup title="Quien lo lee">
          <Choice
            label="Análisis normal"
            hint="Ve todas las jugadas"
            art="normal"
            isOn={!conceals}
            onChoose={() => actions.setView(game.id, { analysisModeCode: null })}
          />
          <Choice
            label="Ocultar los siguientes movimientos"
            hint="Ve hasta donde va; adivina la siguiente"
            art="conceal"
            isOn={conceals}
            onChoose={() => actions.setView(game.id, { analysisModeCode: GAME_ANALYSIS_MODE.CONCEAL })}
          />
        </PlatformSettingsGroup>

        <PlatformSettingsGroup title="Limpiar el capítulo">
          {CLEAN_STEPS.map(({ step, label, hint, Icon }) => (
            <button
              key={step}
              type="button"
              className={`platform-settings__option${step === "game" ? " platform-settings__option_tone_danger" : ""}`}
              onClick={() => ask(step)}
            >
              <span className="platform-settings__lead">
                <Icon variant="classic-solid" className="platform-settings__lead-icon" />
              </span>
              <span className="platform-settings__option-text">
                <span className="platform-settings__option-label">{label}</span>
                <span className="platform-settings__option-hint">{hint}</span>
              </span>
              <span className="platform-settings__option-art">
                <StudyGameSettingsArt kind={step} />
              </span>
            </button>
          ))}
        </PlatformSettingsGroup>
      </PlatformSettingsPanel>

      {/* A sibling of the panel, opened over it with the words of the row pressed. */}
      <PlatformConfirmPopup
        ref={confirm}
        subject={game.name}
        title={confirmation.question}
        description={`«${game.name}». ${confirmation.detail}`}
        acknowledgement={
          needsClassConfirmation ? { name: "confirmClassBlocks", label: CLASS_BLOCKS_ACKNOWLEDGEMENT } : undefined
        }
        action={destroy}
        confirmLabel={confirmation.submit}
        onDone={done}
      />
    </>
  );
}
