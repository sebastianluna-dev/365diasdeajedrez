"use client";

import { useRef } from "react";
import { GameFields, type GameFieldValues } from "@/components/platform/shared/game-fields/game-fields.comp";
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
}

/**
 * «Editar»: the button and the dialog with a game's record. It saves through
 * the action it is given and closes; the moves are not edited here but on the
 * board.
 */
export function EditGame({ action, values, results, titleHint, label = "Editar" }: EditGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="edit-game">
      {/* Beside a game of the aside it is the action of a row; in the
          editor's bar it stands among buttons and is one. */}
      <button
        type="button"
        className={label === "Editar" ? "platform-row-action" : "platform-button"}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>

      <dialog ref={dialogRef} className="platform-dialog edit-game__dialog">
        <form action={action} className="edit-game__form" onSubmit={() => dialogRef.current?.close()}>
          <div className="edit-game__head">
            <h2 className="edit-game__title">Datos de la partida</h2>
            <p className="edit-game__subtitle">Al guardar, estos datos se escriben también en las cabeceras del PGN.</p>
          </div>

          <div className="edit-game__body">
            {/* The same fields as the create form: if one were missing here, the
                value set on creation would be trapped. */}
            <GameFields values={values} results={results} titleHint={titleHint} />
          </div>

          <div className="edit-game__actions">
            <span className="edit-game__note">Se escriben en las cabeceras del PGN.</span>
            <button type="button" className="platform-button" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_ink">Guardar datos</SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
