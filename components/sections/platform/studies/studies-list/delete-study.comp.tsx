"use client";

import { useRef, useState } from "react";
import { deleteStudy } from "@/services/studies/studies.actions";
import "./delete-study.comp.css";

interface DeleteStudyProps {
  id: string;
  name: string;
  gameCount: number;
  citedGameCount: number;
  /**
   * `icon` es el aspa de la tarjeta; `button` el botón con texto de la ficha
   * del estudio. Cambia el disparador, no el diálogo.
   */
  trigger?: "icon" | "button";
}

export function DeleteStudy({ id, name, gameCount, citedGameCount, trigger = "icon" }: DeleteStudyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Misma condición que el servidor: sólo se exige la casilla cuando hay algo
  // que perder. Si el cliente dejara enviar sin ella donde el servidor la pide,
  // la acción rebotaría a la página de error en vez de borrar.
  const needsConfirmation = gameCount > 0 || citedGameCount > 0;
  const blocked = needsConfirmation && !confirmed;

  const description =
    gameCount > 0
      ? `Se borra el estudio con sus ${gameCount} ${gameCount === 1 ? "partida" : "partidas"}, y con ellas sus variantes, comentarios y flechas.`
      : "Se borra el estudio. No tiene partidas dentro.";

  const warning =
    citedGameCount > 0
      ? `Entiendo que se borrará todo, y que ${citedGameCount} ${
          citedGameCount === 1 ? "partida citada en clases dejará ese bloque vacío" : "partidas citadas en clases dejarán esos bloques vacíos"
        }.`
      : "Entiendo que se borrará todo y que no se puede deshacer.";

  const close = () => {
    dialogRef.current?.close();
    setConfirmed(false);
  };

  return (
    <div className="delete-study">
      {trigger === "icon" ? (
        <button
          type="button"
          className="delete-study__open"
          title={`Borrar «${name}»`}
          onClick={() => dialogRef.current?.showModal()}
        >
          <span aria-hidden="true">✕</span>
          <span className="delete-study__open-label">Borrar «{name}»</span>
        </button>
      ) : (
        <button
          type="button"
          className="delete-study__open-wide"
          onClick={() => dialogRef.current?.showModal()}
        >
          Borrar estudio
        </button>
      )}

      <dialog ref={dialogRef} className="platform-dialog delete-study__dialog" onClose={() => setConfirmed(false)}>
        <form action={deleteStudy.bind(null, id)} className="delete-study__form">
          <div className="delete-study__head">
            <span className="delete-study__icon" aria-hidden="true">
              ✕
            </span>
            <div className="delete-study__heading">
              <h2 className="delete-study__title">¿Borrar «{name}»?</h2>
              <p className="delete-study__description">{description}</p>
            </div>
          </div>

          {needsConfirmation && (
            <label className="delete-study__confirm">
              {/* La casilla ES el campo que el servidor exige: sin marcar no se
                  envía, así que `confirmDelete` sólo llega cuando toca. */}
              <input
                type="checkbox"
                name="confirmDelete"
                value="yes"
                className="delete-study__checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span className="delete-study__warning">{warning}</span>
            </label>
          )}

          <div className="delete-study__actions">
            <span className="delete-study__note">Esta acción no se puede deshacer.</span>
            <button type="button" className="delete-study__cancel" onClick={close}>
              Cancelar
            </button>
            <button type="submit" className="delete-study__submit" disabled={blocked}>
              Borrar estudio
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
