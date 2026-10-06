"use client";

import { useRef } from "react";
import { PenToSquareIcon } from "@/components/icons/pen-to-square-icon.comp";
import { GameFields, type GameFieldValues } from "@/components/platform/shared/game-fields/game-fields.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import "./edit-game.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";

interface EditGameProps {
  /**
   * The server action that saves the record, already bound to its game. Each
   * screen brings its own, because each has its own border: the student's
   * checks the study is theirs, the staff's that they are staff.
   */
  action: (formData: FormData) => Promise<void>;
  values: GameFieldValues;
  /** Results catalog; its label IS the PGN token. */
  results: { code: string; label: string }[];
  /** What the name is for on this screen, under its field. */
  titleHint: string;
  /**
   * Trigger text. In the aside there is little room and "Editar" is enough; in
   * the editor bar it shares a row with three other buttons and needs to say what it is for.
   */
  label?: string;
  /**
   * `text` writes the label; `icon` is a pencil with no word, for the head of
   * a card that is already titled «Datos de la partida» (the game's record
   * beside the board).
   */
  trigger?: "text" | "icon";
}

/**
 * «Editar»: the button and the popup with a game's record. It saves through
 * the action it is given and closes; the moves are not edited here but on the
 * board.
 */
export function EditGame({ action, values, results, titleHint, label = "Editar", trigger = "text" }: EditGameProps) {
  const popup = useRef<PlatformPopupHandle>(null);

  return (
    <div className="edit-game">
      {/* Beside a game of the aside it is the action of a row; in the
          editor's bar it stands among buttons and is one. */}
      {trigger === "icon" ? (
        <button
          type="button"
          className="edit-game__open"
          aria-label="Editar los datos de la partida"
          onClick={(event) => popup.current?.open(event)}
        >
          <PenToSquareIcon className="edit-game__open-icon" />
        </button>
      ) : (
        <button
          type="button"
          className={label === "Editar" ? "platform-row-action" : "platform-button"}
          onClick={(event) => popup.current?.open(event)}
        >
          {label}
        </button>
      )}

      <PlatformPopup ref={popup} title="Datos de la partida" size="lg">
        <form action={action} className="edit-game__form" onSubmit={() => popup.current?.close()}>
          {/* Said once, before the fields: the row of actions does not repeat it. */}
          <p className="edit-game__subtitle">Al guardar, estos datos se escriben también en las cabeceras del PGN.</p>

          <div className="edit-game__body">
            {/* The same fields as the create form: if one were missing here, the
                value set on creation would be trapped. */}
            <GameFields values={values} results={results} titleHint={titleHint} />
          </div>

          <div className="edit-game__actions">
            <button type="button" className="platform-button" onClick={() => popup.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_ink">Guardar datos</SubmitButton>
          </div>
        </form>
      </PlatformPopup>
    </div>
  );
}
