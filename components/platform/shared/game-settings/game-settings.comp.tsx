"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CodeBranchIcon } from "@/components/icons/code-branch-icon.comp";
import { CommentXmarkIcon } from "@/components/icons/comment-xmark-icon.comp";
import { GearIcon } from "@/components/icons/gear-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { GAME_ANALYSIS_MODE_LABELS } from "@/constants/platform/study-codes.const";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { mdIconButton } from "@/lib/material/material-classes";
import "./game-settings.comp.css";

/**
 * What a game's settings can do, each a server action already bound to the
 * study or the collection the game belongs to.
 */
export interface GameSettingsActions {
  /**
   * Saves what the form holds: `title`, `orientationCode`, `analysisModeCode`
   * and `pinnedComment`; an empty one is that setting's "nothing".
   */
  save: (gameId: string, formData: FormData) => Promise<void>;
  /** Takes out comments, arrows, signs and evaluations; moves and variations stay. */
  clearAnnotations: (gameId: string) => Promise<void>;
  /** Leaves the main line alone. */
  clearVariations: (gameId: string) => Promise<void>;
  /** Deletes the game; the action sends the browser on to where it belongs. */
  remove: (gameId: string, formData: FormData) => Promise<void>;
}

/** The game the settings are of, as its list shows it. */
export interface GameSettingsGame {
  id: string;
  /** What the list calls it: its own name, or its players when it has none. */
  name: string;
  /** The name it was given; absent while it is shown by its players. */
  title?: string;
  /** Which side the board opens from. */
  orientationCode: "WHITE" | "BLACK";
  /** How a reader goes through it. Absent = plain analysis. */
  analysisModeCode?: string;
  /** The owner's text heading the notation, before the moves. */
  pinnedComment?: string;
  /**
   * Whether some class shows the game. Deleting it leaves that block of the
   * class empty, so the server asks for an explicit confirmation
   * (`confirmClassBlocks`) and the confirmation asks for it before sending.
   */
  citedInClass?: boolean;
}

const ORIENTATION_OPTIONS = [
  { value: BOARD_ORIENTATION.WHITE, label: "Blancas" },
  { value: BOARD_ORIENTATION.BLACK, label: "Negras" },
];

const ANALYSIS_MODE_OPTIONS = Object.entries(GAME_ANALYSIS_MODE_LABELS).map(([value, label]) => ({ value, label }));

interface GameSettingsProps {
  game: GameSettingsGame;
  /**
   * Whether this is the game on screen. Its page holds the PGN in the
   * browser, so after a clean-up rewrote it on the server the page is loaded
   * again: otherwise the next autosave would write the old PGN back.
   */
  isCurrent: boolean;
  actions: GameSettingsActions;
  /**
   * `material`: the gear as Material's standard icon button, for a page
   * moved to the new design system (a study's side column, 2026-10-23).
   */
  look?: "material";
}

type Destructive = "annotations" | "variations" | "game";

/** What each destructive step says before it is taken, and on the button that takes it. */
const CONFIRMATIONS: Record<Destructive, { question: string; detail: string; submit: string }> = {
  annotations: {
    question: "¿Eliminar las anotaciones?",
    detail:
      "Se eliminan los comentarios, las flechas, los signos y las evaluaciones. Las jugadas y las variantes se quedan.",
    submit: "Eliminar anotaciones",
  },
  variations: {
    question: "¿Eliminar las variantes?",
    detail: "Se eliminan todas las variantes, con lo que tengan escrito. Queda sólo la línea principal.",
    submit: "Eliminar variantes",
  },
  game: {
    question: "¿Eliminar la partida?",
    detail: "Se elimina la partida entera, con sus variantes, comentarios y flechas.",
    submit: "Eliminar partida",
  },
};

/** What deleting a game a class shows takes with it, to be agreed to before the button works. */
const CLASS_BLOCKS_ACKNOWLEDGEMENT =
  "Esta partida se usa en el contenido de alguna clase. Entiendo que esos bloques se quedarán vacíos.";

/**
 * The gear at the end of a game's row and the popup it opens, as Lichess
 * keeps them behind a study's chapter: the game's name, which side its board
 * opens from, how a reader goes through it and a comment pinned at the head
 * of its notation; and the three things that destroy — its annotations, its
 * variations, the game itself —, each behind a confirmation, because none of
 * them can be undone. The three share one `PlatformConfirmPopup`, mounted as
 * a sibling of the settings and opened on top of them with the words of the
 * step pressed; the settings wait beneath. A game some class shows asks for
 * one thing more before it is deleted: a box that says the class's block
 * will be left empty.
 */
export function GameSettings({ game, isCurrent, actions, look }: GameSettingsProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  /** The step the confirmation asks about: the last red word pressed. */
  const [pending, setPending] = useState<Destructive>("annotations");
  // The same condition as the server: only a game some class shows needs the
  // box ticked. Sent without it, the action would bounce instead of deleting.
  const needsClassConfirmation = pending === "game" && game.citedInClass === true;

  /** The words first, then the popup: it is named by them, and read as it opens. */
  const ask = (step: Destructive) => {
    flushSync(() => setPending(step));
    confirm.current?.open();
  };

  const destroy = (formData: FormData) => {
    if (pending === "annotations") return actions.clearAnnotations(game.id);
    if (pending === "variations") return actions.clearVariations(game.id);
    return actions.remove(game.id, formData);
  };

  /**
   * After a clean-up: the server rewrote the PGN, and the game on screen is
   * loaded again with it; any other game's settings just close. After a
   * deletion the action has sent the browser on, and closing is harmless.
   */
  const done = () => {
    if (pending !== "game" && isCurrent) window.location.reload();
    else popup.current?.close();
  };

  const confirmation = CONFIRMATIONS[pending];

  return (
    <div className="game-settings">
      <button
        type="button"
        className={`${
          look === "material"
            ? mdIconButton("standard", "xs")
            : "platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
        } game-settings__open`}
        aria-label={`Ajustes de «${game.name}»`}
        onClick={(event) => popup.current?.open(event)}
      >
        <GearIcon
          variant="classic-solid"
          className={look === "material" ? "platform-md-icon" : "platform-button__icon"}
        />
      </button>

      {/* The popup opens on the name, the first control of the content, which
          is what one comes to change. */}
      <PlatformPopup ref={popup} title="Ajustes de la partida" size="sm">
        <PlatformForm
          action={(formData) => actions.save(game.id, formData)}
          className="game-settings__form"
          onSubmit={() => popup.current?.close()}
          autoComplete="off"
        >
          <PlatformFormField
            name="title"
            label="Nombre"
            info="Si lo dejas vacío, la partida se nombra por sus jugadores."
          >
            {/* Keyed by the saved name: reopened after a save, the field starts from what was saved. */}
            <input
              key={game.title ?? ""}
              type="text"
              maxLength={120}
              defaultValue={game.title ?? ""}
              placeholder={game.name}
            />
          </PlatformFormField>
          <div className="game-settings__pair">
            {/* One select each, so fields and not groups: the field gives
                the select its `name` and the `id` its label points at. */}
            <PlatformFormField name="orientationCode" label="Orientación">
              <PlatformSelect defaultValue={game.orientationCode} options={ORIENTATION_OPTIONS} />
            </PlatformFormField>
            <PlatformFormField name="analysisModeCode" label="Modo de análisis">
              <PlatformSelect
                defaultValue={game.analysisModeCode ?? ""}
                emptyOption="Análisis normal"
                options={ANALYSIS_MODE_OPTIONS}
              />
            </PlatformFormField>
          </div>
          <PlatformFormField
            name="pinnedComment"
            label="Comentario fijo"
            info="Se muestra al principio de la notación, antes de las jugadas, a quien abra la partida."
          >
            <textarea
              key={game.pinnedComment ?? ""}
              maxLength={1000}
              rows={3}
              defaultValue={game.pinnedComment ?? ""}
            />
          </PlatformFormField>
          <div className="game-settings__actions">
            <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
              Guardar
            </SubmitButton>
          </div>
        </PlatformForm>

        {/* What destroys, apart from what saves and under a rule: three
            pills, each opening the confirmation with its words. Graded: the
            two that clear part of the game are grey until pointed at
            (caution); the one that leaves nothing is red (danger). */}
        <div className="game-settings__danger">
          <button
            type="button"
            className="platform-button platform-button_variant_caution platform-button_size_sm platform-button_shape_pill"
            onClick={() => ask("annotations")}
          >
            <CommentXmarkIcon variant="classic-solid" className="platform-button__icon" />
            Eliminar anotaciones
          </button>
          <button
            type="button"
            className="platform-button platform-button_variant_caution platform-button_size_sm platform-button_shape_pill"
            onClick={() => ask("variations")}
          >
            <CodeBranchIcon variant="classic-solid" className="platform-button__icon" />
            Eliminar variantes
          </button>
          <button
            type="button"
            className="platform-button platform-button_variant_danger platform-button_size_sm platform-button_shape_pill"
            onClick={() => ask("game")}
          >
            <TrashCanIcon variant="classic-solid" className="platform-button__icon" />
            Eliminar partida
          </button>
        </div>
      </PlatformPopup>

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
    </div>
  );
}
