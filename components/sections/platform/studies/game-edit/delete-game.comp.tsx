"use client";

import { useRef, useState } from "react";
import { deleteStudyGame } from "@/services/studies/studies.actions";
import "./delete-game.comp.css";

interface DeleteGameProps {
  studyId: string;
  gameId: string;
  name: string;
  /** Bloques de clase que la citan: borrarla los deja vacíos. */
  classBlockCount: number;
}

export function DeleteGame({ studyId, gameId, name, classBlockCount }: DeleteGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Misma condición que el servidor: sólo se exige la casilla cuando la partida
  // está citada en alguna clase. Si el cliente dejara enviar sin ella donde el
  // servidor la pide, la acción rebotaría a la página de error en vez de borrar.
  const needsConfirmation = classBlockCount > 0;

  const close = () => {
    dialogRef.current?.close();
    setConfirmed(false);
  };

  return (
    <div className="delete-game">
      <button type="button" className="delete-game__open" onClick={() => dialogRef.current?.showModal()}>
        Borrar partida
      </button>

      <dialog ref={dialogRef} className="platform-dialog delete-game__dialog" onClose={() => setConfirmed(false)}>
        <form action={deleteStudyGame.bind(null, studyId, gameId)} className="delete-game__form">
          <div className="delete-game__head">
            <span className="delete-game__icon" aria-hidden="true">
              ✕
            </span>
            <div>
              <h2 className="delete-game__title">¿Borrar «{name}»?</h2>
              <p className="delete-game__description">
                Se borra la partida entera, con sus variantes, comentarios y flechas.
              </p>
            </div>
          </div>

          {needsConfirmation && (
            <label className="delete-game__confirm">
              <input
                type="checkbox"
                name="confirmClassBlocks"
                value="yes"
                className="delete-game__checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span className="delete-game__warning">
                Esta partida se usa en {classBlockCount} bloque{classBlockCount === 1 ? "" : "s"} de clase.
                Entiendo que se {classBlockCount === 1 ? "quedará vacío" : "quedarán vacíos"}.
              </span>
            </label>
          )}

          <div className="delete-game__actions">
            <span className="delete-game__note">Esta acción no se puede deshacer.</span>
            <button type="button" className="delete-game__cancel" onClick={close}>
              Cancelar
            </button>
            <button type="submit" className="delete-game__submit" disabled={needsConfirmation && !confirmed}>
              Borrar partida
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
