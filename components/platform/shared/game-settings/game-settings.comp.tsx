"use client";

import { useId, useRef, useState } from "react";
import { GearIcon } from "@/components/icons/gear-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { GAME_ANALYSIS_MODE_LABELS } from "@/constants/platform/study-codes.const";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
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
  /** The owner's text under the board, whatever the move. */
  pinnedComment?: string;
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

/**
 * The gear at the end of a game's row and the dialog it opens, as Lichess
 * keeps them behind a study's chapter: the game's name, which side its board
 * opens from, how a reader goes through it and a comment pinned under the
 * board; and the three things that destroy — its annotations, its variations,
 * the game itself —, each behind a confirmation of its own inside the same
 * dialog, because none of them can be undone.
 */
export function GameSettings({ game, isCurrent, actions }: GameSettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState<Destructive | null>(null);
  const titleId = useId();

  /** Opens on the name, which is what one comes to change, and not on the close button the browser would pick. */
  const open = () => {
    dialogRef.current?.showModal();
    nameRef.current?.focus();
  };

  const close = () => {
    dialogRef.current?.close();
    setConfirming(null);
  };

  /** A clean-up: the server rewrites the PGN, and the game on screen is loaded again with it. */
  const clear = async (run: (gameId: string) => Promise<void>) => {
    await run(game.id);
    if (isCurrent) window.location.reload();
    else close();
  };

  const destroy = (formData: FormData) => {
    if (confirming === "annotations") return clear(actions.clearAnnotations);
    if (confirming === "variations") return clear(actions.clearVariations);
    return actions.remove(game.id, formData);
  };

  const confirmation = confirming ? CONFIRMATIONS[confirming] : null;

  return (
    <div className="game-settings">
      <button type="button" className="game-settings__open" aria-label={`Ajustes de «${game.name}»`} onClick={open}>
        <GearIcon variant="duotone-solid" className="game-settings__open-icon" />
      </button>

      <dialog
        ref={dialogRef}
        className="platform-dialog game-settings__dialog"
        aria-labelledby={titleId}
        onClose={() => setConfirming(null)}
      >
        <header className="game-settings__head">
          <h2 id={titleId} className="game-settings__title">
            Ajustes de la partida
          </h2>
          <button type="button" className="game-settings__close" onClick={close} aria-label="Cerrar">
            <XmarkIcon className="game-settings__close-icon" />
          </button>
        </header>

        {confirmation ? (
          <form action={destroy} className="game-settings__confirm">
            <p className="game-settings__question">{confirmation.question}</p>
            <p className="game-settings__detail">
              «{game.name}». {confirmation.detail} Esta acción no se puede deshacer.
            </p>
            <div className="game-settings__actions">
              <button type="button" className="platform-button" onClick={() => setConfirming(null)}>
                Cancelar
              </button>
              <SubmitButton className="platform-button platform-button_variant_danger" pendingLabel="Eliminando…">
                {confirmation.submit}
              </SubmitButton>
            </div>
          </form>
        ) : (
          <>
            <PlatformForm
              action={(formData) => actions.save(game.id, formData)}
              className="game-settings__form"
              onSubmit={close}
              autoComplete="off"
            >
              <PlatformFormField
                name="title"
                label="Nombre"
                hint="Si lo dejas vacío, la partida se nombra por sus jugadores."
              >
                {/* Keyed by the saved name: reopened after a save, the field starts from what was saved. */}
                <input
                  ref={nameRef}
                  key={game.title ?? ""}
                  type="text"
                  maxLength={120}
                  defaultValue={game.title ?? ""}
                  placeholder={game.name}
                />
              </PlatformFormField>
              <div className="game-settings__pair">
                <PlatformFormGroup label="Orientación">
                  <PlatformSelect
                    name="orientationCode"
                    defaultValue={game.orientationCode}
                    options={ORIENTATION_OPTIONS}
                  />
                </PlatformFormGroup>
                <PlatformFormGroup label="Modo de análisis">
                  <PlatformSelect
                    name="analysisModeCode"
                    defaultValue={game.analysisModeCode ?? ""}
                    emptyOption="Análisis normal"
                    options={ANALYSIS_MODE_OPTIONS}
                  />
                </PlatformFormGroup>
              </div>
              <PlatformFormField
                name="pinnedComment"
                label="Comentario fijo"
                optionalLabel="Opcional"
                hint="Se muestra bajo el tablero en todas las jugadas, a quien abra la partida."
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

            <div className="game-settings__danger">
              <button type="button" className="game-settings__destroy" onClick={() => setConfirming("annotations")}>
                Eliminar anotaciones
              </button>
              <button type="button" className="game-settings__destroy" onClick={() => setConfirming("variations")}>
                Eliminar variantes
              </button>
              <button type="button" className="game-settings__destroy" onClick={() => setConfirming("game")}>
                Eliminar partida
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
