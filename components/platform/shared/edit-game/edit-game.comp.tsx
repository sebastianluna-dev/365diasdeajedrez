"use client";

import { useImperativeHandle, useRef, type MouseEvent, type Ref } from "react";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { PenToSquareIcon } from "@/components/icons/pen-to-square-icon.comp";
import { GameFields, type GameFieldValues } from "@/components/platform/shared/game-fields/game-fields.comp";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { mdIconButton } from "@/lib/material/material-classes";
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
   * `text` writes «Editar» as the action of a row; `icon` is a pencil with no
   * word, for the head of a card that is already titled «Datos de la partida»
   * (the game's record beside the board); `none` draws no trigger, for a
   * record whose pencil someone else draws (the study's game, whose record
   * is the viewer's, 2026-10-23), which opens it through `ref`.
   */
  trigger?: "text" | "icon" | "none";
  /** Opens the popup from outside, for `trigger="none"`. */
  ref?: Ref<EditGameHandle>;
  /**
   * `material`: the pencil as Material's standard icon button, for a page
   * moved to the new design system (a study's game, 2026-10-23). Only the
   * `icon` trigger has one.
   */
  look?: "material";
}

/** What a host that draws its own pencil can do with the popup. */
export interface EditGameHandle {
  /** Opens it, giving the focus back to the button pressed when it closes. */
  open: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * «Editar»: the button and the popup with a game's record. It saves through
 * the action it is given and closes; the moves are not edited here but on the
 * board.
 */
export function EditGame({ action, values, results, titleHint, trigger = "text", look, ref }: EditGameProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  useImperativeHandle(ref, () => ({ open: (event) => popup.current?.open(event) }), []);

  return (
    <div className="edit-game">
      {/* Beside a game of a list it is the action of a row; in the head of
          the record, the pencil. */}
      {trigger === "none" ? null : trigger === "icon" && look === "material" ? (
        <button
          type="button"
          className={`${mdIconButton("standard", "xs")} edit-game__open`}
          aria-label="Editar los datos de la partida"
          onClick={(event) => popup.current?.open(event)}
        >
          <PenIcon className="platform-md-icon" />
        </button>
      ) : trigger === "icon" ? (
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square edit-game__open"
          aria-label="Editar los datos de la partida"
          onClick={(event) => popup.current?.open(event)}
        >
          <PenToSquareIcon variant="classic-solid" className="platform-button__icon" />
        </button>
      ) : (
        <button type="button" className="platform-row-action" onClick={(event) => popup.current?.open(event)}>
          Editar
        </button>
      )}

      <PlatformPopup ref={popup} title="Datos de la partida" size="lg">
        {/* The platform's form, whose context the record's fields need. It
            only calls `onSubmit` for a valid form: a field the browser rejects
            keeps the popup open and shows its own message. */}
        <PlatformForm action={action} className="edit-game__form" onSubmit={() => popup.current?.close()}>
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
        </PlatformForm>
      </PlatformPopup>
    </div>
  );
}
