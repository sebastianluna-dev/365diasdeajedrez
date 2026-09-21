"use client";

import { useRef, useState } from "react";
import { deleteStudyGame } from "@/services/studies/studies.actions";
import "./delete-game.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface DeleteGameProps {
  studyId: string;
  gameId: string;
  name: string;
  /** Class blocks that cite it: deleting it leaves them empty. */
  classBlockCount: number;
  /**
   * `compact` for the record column, where the button spans the width and
   * matches the rest of the card's actions; `inline` for the record's foot,
   * where it is one more word of the row and not a box.
   */
  size?: "regular" | "compact" | "inline";
  /** The trigger text. At the foot "Borrar" is enough, it is already in context. */
  label?: string;
}

export function DeleteGame({
  studyId,
  gameId,
  name,
  classBlockCount,
  size = "regular",
  label = "Borrar partida",
}: DeleteGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Same condition as the server: the checkbox is only required when the game
  // is cited in some class. If the client let it submit without it where the
  // server requires it, the action would bounce to the error page instead of deleting.
  const needsConfirmation = classBlockCount > 0;

  const close = () => {
    dialogRef.current?.close();
    setConfirmed(false);
  };

  return (
    <div className="delete-game">
      <button
        type="button"
        className={`delete-game__open${size === "regular" ? "" : ` delete-game__open_size_${size}`}`}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
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
                Esta partida se usa en {classBlockCount} bloque{classBlockCount === 1 ? "" : "s"} de clase. Entiendo que
                se {classBlockCount === 1 ? "quedará vacío" : "quedarán vacíos"}.
              </span>
            </label>
          )}

          <div className="delete-game__actions">
            <span className="delete-game__note">Esta acción no se puede deshacer.</span>
            <button type="button" className="delete-game__cancel" onClick={close}>
              Cancelar
            </button>
            <SubmitButton
              className="delete-game__submit"
              disabled={needsConfirmation && !confirmed}
              pendingLabel="Borrando…"
            >
              Borrar partida
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
