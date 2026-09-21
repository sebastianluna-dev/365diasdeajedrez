"use client";

import { useRef } from "react";
import { GameFields, type GameFieldValues } from "@/components/platform/sections/studies/game-fields.comp";
import { updateGameDetails } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./edit-game.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface EditGameProps {
  studyId: string;
  gameId: string;
  values: GameFieldValues;
  /** Results catalog; its label IS the PGN token. */
  results: StudyKindOption[];
  /**
   * Trigger text. In the aside there is little room and "Editar" is enough; in
   * the editor bar it shares a row with three other buttons and needs to say what it is for.
   */
  label?: string;
}

export function EditGame({ studyId, gameId, values, results, label = "Editar" }: EditGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="edit-game">
      <button
        type="button"
        className={`edit-game__open${label === "Editar" ? "" : " edit-game__open_size_wide"}`}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>

      <dialog ref={dialogRef} className="platform-dialog edit-game__dialog">
        <form
          action={updateGameDetails.bind(null, studyId, gameId)}
          className="edit-game__form"
          onSubmit={() => dialogRef.current?.close()}
        >
          <div className="edit-game__head">
            <h2 className="edit-game__title">Datos de la partida</h2>
            <p className="edit-game__subtitle">Al guardar, estos datos se escriben también en las cabeceras del PGN.</p>
          </div>

          <div className="edit-game__body">
            {/* The same fields as the create form: if one were missing here, the
                value set on creation would be trapped. */}
            <GameFields
              values={values}
              results={results}
              titleHint="Cómo identificas esta partida dentro del estudio. Si lo dejas vacío se usan los dos jugadores."
            />
          </div>

          <div className="edit-game__actions">
            <span className="edit-game__note">Se escriben en las cabeceras del PGN.</span>
            <button
              type="button"
              className="platform-button platform-button_variant_secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <SubmitButton>Guardar datos</SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
