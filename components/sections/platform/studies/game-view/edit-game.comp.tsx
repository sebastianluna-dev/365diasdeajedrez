"use client";

import { useRef } from "react";
import { GameFields, type GameFieldValues } from "@/components/sections/platform/studies/game-fields.comp";
import { updateGameDetails } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./edit-game.comp.css";

interface EditGameProps {
  studyId: string;
  gameId: string;
  values: GameFieldValues;
  /** Catálogo de resultados; su label ES el token PGN. */
  results: StudyKindOption[];
  /**
   * Texto del disparador. En el aside cabe poco y basta «Editar»; en la barra
   * del editor comparte fila con otros tres botones y necesita decir de qué es.
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
            <p className="edit-game__subtitle">
              Al guardar, estos datos se escriben también en las cabeceras del PGN.
            </p>
          </div>

          <div className="edit-game__body">
            {/* Los mismos campos que el formulario de crear: si aquí faltara
                alguno, el dato que se puso al crear quedaría atrapado. */}
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
            <button type="submit" className="platform-button">
              Guardar datos
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
