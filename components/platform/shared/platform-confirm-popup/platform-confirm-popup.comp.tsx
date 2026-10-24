"use client";

import { useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import { Checkbox } from "radix-ui";
import { BanIcon } from "@/components/icons/ban-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CircleMinusIcon } from "@/components/icons/circle-minus-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import { TriangleExclamationIcon } from "@/components/icons/triangle-exclamation-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  lookOf,
  MATERIAL_DIALOG,
  needsLook,
  PlatformLookContext,
  type PlatformLook,
} from "@/components/platform/shared/platform-look";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { mdButton } from "@/lib/material/material-classes";
import "./platform-confirm-popup.comp.css";

/** What whoever draws the trigger gets: opening, and closing it from outside. */
export interface PlatformConfirmPopupHandle {
  /**
   * `showModal()`. Given the click, the trigger takes the focus first, as
   * `PlatformPopup.open` does, so that cancelling brings the focus back to a
   * card's cross and not to `<body>` (Safari, and Firefox on a Mac, do not
   * focus a pressed button). A red word inside an open popup needs no event:
   * the popup's focus trap already has it.
   */
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
  isOpen: () => boolean;
}

/**
 * The box the server requires before it acts. Its `name` and `value` are
 * exactly what the action reads (`confirmDelete=yes`, `confirmClassBlocks=yes`,
 * `confirm=on`): unticked, nothing is sent, so the server's own check holds
 * for a direct POST too. While it is unticked the confirming button is off.
 */
export interface PlatformConfirmAcknowledgement {
  name: string;
  /** Default `"yes"`. The course actions read `"on"`. */
  value?: string;
  /** First person, what is understood: «Entiendo que se eliminará todo y que no se puede deshacer.» */
  label: string;
}

/**
 * The three verbs a confirmation asks with: «Eliminar» destroys, «Quitar»
 * takes out of where it is, «Cancelar» closes a class for good (history, not
 * destruction: the seats go back to their payments).
 */
export type PlatformConfirmVerb = "Eliminar" | "Quitar" | "Cancelar";

/** A field the confirmation asks to fill before acting: the reason of a cancellation. */
export interface PlatformConfirmField {
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  hint?: string;
  placeholder?: string;
}

export interface PlatformConfirmPopupProps {
  /**
   * «Eliminar» (the default) destroys: the bin, and a warning that it cannot
   * be undone. «Quitar» takes something out of where it is: the minus, and no
   * warning unless `note` gives one. «Cancelar» closes a class: the ban sign,
   * and the warning that another class is the way to give it another day.
   */
  verb?: PlatformConfirmVerb;
  /**
   * What the way out says. «Cancelar» by default; with the verb «Cancelar»
   * it is «Volver», so the two buttons never say the same word.
   */
  exitLabel?: string;
  /**
   * What has to be written before confirming — the reason of a cancellation,
   * the note the students read —, each a `PlatformFormField` with a
   * textarea. With fields the form is a `PlatformForm`: the browser holds a
   * required one empty, or one too long, before anything is sent.
   */
  fields?: PlatformConfirmField[];
  /** What is destroyed or taken out, by its name: the title reads «¿{verb} «{subject}»?». */
  subject: string;
  /**
   * The question, when it is not «¿{verb} «{subject}»?»: «¿Eliminar las
   * anotaciones de «Kasparov – Topalov»?», «¿Quitar «Finales» de mis cursos?».
   * Always a question; the popup is named by it.
   */
  title?: string;
  /** One sentence: what goes. «Se elimina el estudio con sus 12 partidas.» */
  description: string;
  /** What else goes or stays, one line each, drawn as a list. */
  consequences?: string[];
  acknowledgement?: PlatformConfirmAcknowledgement;
  /**
   * The warning under what goes, in the danger colour with a triangle. By verb
   * when absent (see `verb`); `null` draws none.
   */
  note?: string | null;
  /**
   * The form's action: the server action, already bound
   * (`deleteStudy.bind(null, id)`), or a client function that awaits one. If
   * it redirects, the page takes the popup away; if it only revalidates, the
   * popup closes itself and calls `onDone`.
   */
  action: (formData: FormData) => Promise<void>;
  /** The button's verb and object: «Eliminar estudio», «Quitar de mis cursos». */
  confirmLabel: string;
  /** A gerund with «…». By verb when absent: «Eliminando…», «Quitando…». */
  pendingLabel?: string;
  /**
   * Called once the action settled, after this popup closed: where a host
   * closes the popup beneath (`popup.current?.close()`), reloads, or does
   * nothing. Never called on cancel.
   */
  onDone?: () => void;
  /** The native `close` event, whichever exit. */
  onClose?: () => void;
  ref?: Ref<PlatformConfirmPopupHandle>;
}

const NOTES: Record<PlatformConfirmVerb, string | null> = {
  Eliminar: "Esta acción no se puede deshacer.",
  Quitar: null,
  Cancelar: "No se puede deshacer: para darla otro día, crea otra clase.",
};

const PENDING_LABELS: Record<PlatformConfirmVerb, string> = {
  Eliminar: "Eliminando…",
  Quitar: "Quitando…",
  Cancelar: "Cancelando…",
};

const ICONS: Record<PlatformConfirmVerb, typeof TrashCanIcon> = {
  Eliminar: TrashCanIcon,
  Quitar: CircleMinusIcon,
  Cancelar: BanIcon,
};

/**
 * The popup that asks before something is destroyed, or taken out of where
 * it is: a question, what goes, what one has to agree to, and the two
 * buttons. It is the heavier of the platform's two popups on purpose: no
 * strip and no cross (a question is answered, not dismissed: «Cancelar» and
 * Escape are the ways out), a disc with the bin, a rule in the danger colour
 * along its top, a longer shadow and a darker backdrop of its own.
 *
 * It is opened on top of whatever popup is open, never in its place: a
 * second modal stacks over the first in the top layer, with its own backdrop
 * painted right over the first popup, which waits beneath, inert, with what
 * was typed in it. Escape and «Cancelar» close only this one. Confirming
 * runs the action with this popup still on top (the button says it is on its
 * way); when the action settles this one closes and `onDone` tells the host,
 * which closes the popup beneath. An action that redirects takes the page,
 * and both popups, away by itself. Mounted as a SIBLING of the popup it is
 * opened from, never inside it: a `<dialog>` under one that is closed is not
 * drawn.
 *
 * On a page moved to the new design system (inside `.platform-workspace`,
 * `lookOf`, decided as it opens) it is Material 3's basic dialog instead,
 * «Confirmación 1» of the owner's canvas: 28px corners on the dialog's
 * surface and its own scrim, the verb's icon centred on top (in the error's
 * red for «Eliminar»), the question centred in the display font, what goes
 * as supporting text, the box to tick as a soft card, and two text buttons
 * at the right — the way out in the primary, the action in the error's red.
 * No rule, no disc: Material says it is heavy with its icon and its red word.
 * Everything else — the verbs, the fields, the box, the stacking, `onDone`,
 * the focus — is the same piece.
 */
export function PlatformConfirmPopup({
  verb = "Eliminar",
  exitLabel,
  fields,
  subject,
  title,
  description,
  consequences,
  acknowledgement,
  note,
  action,
  confirmLabel,
  pendingLabel,
  onDone,
  onClose,
  ref,
}: PlatformConfirmPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const warningId = useId();
  const checkId = useId();
  const [look, setLook] = useState<PlatformLook>("platform");

  useImperativeHandle(
    ref,
    () => ({
      open: (event) => {
        const dialog = dialogRef.current;
        if (!dialog || dialog.open) return;
        event?.currentTarget.focus();
        // Drawn in its page's look before it is shown and takes the focus.
        const next = lookOf(dialog);
        if (needsLook(dialog, next)) flushSync(() => setLook(next));
        dialog.showModal();
      },
      close: () => dialogRef.current?.close(),
      isOpen: () => dialogRef.current?.open ?? false,
    }),
    [],
  );

  // The same gate as the server's: the box is only required when there is
  // something to agree to, and the button waits for it.
  const blocked = acknowledgement !== undefined && !acknowledged;
  const warning = note === undefined ? NOTES[verb] : note;
  const Icon = ICONS[verb];
  const exit = exitLabel ?? (verb === "Cancelar" ? "Volver" : "Cancelar");
  // With fields the form validates them before sending; without, a plain form is enough.
  const Shell = fields && fields.length > 0 ? PlatformForm : "form";

  /**
   * The form's action: the one given, then the closing. A redirecting action
   * rejects here with the redirect the router then follows, so the closing
   * is in `finally`: it is harmless on a page that is being replaced, and on
   * one that stays it is what takes the two popups away, this one first.
   */
  const submit = async (formData: FormData) => {
    try {
      await action(formData);
    } finally {
      dialogRef.current?.close();
      onDone?.();
    }
  };

  const material = look === "material";

  return (
    <dialog
      ref={dialogRef}
      className={`platform-dialog platform-confirm-popup${material ? ` ${MATERIAL_DIALOG} platform-confirm-popup_look_material` : ""}`}
      aria-labelledby={titleId}
      aria-describedby={warning ? `${descriptionId} ${warningId}` : descriptionId}
      onClose={() => {
        // Nothing stays half agreed to.
        setAcknowledged(false);
        onClose?.();
      }}
    >
      {/* Its look, handed to the fields it asks to fill. */}
      <PlatformLookContext value={look}>
        <Shell action={submit} className="platform-confirm-popup__form">
          <div className="platform-confirm-popup__head">
            {/* Material's icon is the verb's glyph alone, centred, in the
              error's red when it destroys; the platform's sits on a disc. */}
            <span
              className={`platform-confirm-popup__icon${verb === "Eliminar" ? " platform-confirm-popup__icon_tone_error" : ""}`}
              aria-hidden="true"
            >
              <Icon
                variant={material ? "duotone-light" : "duotone-solid"}
                className="platform-confirm-popup__icon-glyph"
              />
            </span>
            <div className="platform-confirm-popup__heading">
              <h2 id={titleId} className="platform-confirm-popup__title">
                {title ?? `¿${verb} «${subject}»?`}
              </h2>
              <p id={descriptionId} className="platform-confirm-popup__description">
                {description}
              </p>
            </div>
          </div>

          {consequences && consequences.length > 0 && (
            <ul className="platform-confirm-popup__consequences">
              {consequences.map((consequence) => (
                <li key={consequence} className="platform-confirm-popup__consequence">
                  {consequence}
                </li>
              ))}
            </ul>
          )}

          {/* Under what goes and what stays, the last thing read before
            deciding (2026-10-07: it was a note in the foot, beside the two
            buttons, where a long confirming label squeezed it into a column
            of one word a line). Part of the dialog's description. */}
          {warning && (
            <p id={warningId} className="platform-confirm-popup__warning">
              {/* Material's is a line of the supporting text, in the error's
                red: the icon on top already warns. */}
              {!material && (
                <TriangleExclamationIcon variant="classic-solid" className="platform-confirm-popup__warning-icon" />
              )}
              {warning}
            </p>
          )}

          {fields && fields.length > 0 && (
            <div className="platform-confirm-popup__fields">
              {fields.map((field) => (
                <PlatformFormField key={field.name} name={field.name} label={field.label} hint={field.hint}>
                  <textarea
                    rows={3}
                    required={field.required}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                  />
                </PlatformFormField>
              ))}
            </div>
          )}

          {acknowledgement && (
            <label htmlFor={checkId} className="platform-confirm-popup__acknowledgement">
              {/* The box IS the field the server requires: the primitive's hidden
                input sends `name`/`value` only while it is checked. */}
              <Checkbox.Root
                id={checkId}
                name={acknowledgement.name}
                value={acknowledgement.value ?? "yes"}
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="platform-confirm-popup__check"
              >
                <Checkbox.Indicator className="platform-confirm-popup__check-mark" forceMount>
                  <CheckIcon variant="classic-solid" className="platform-confirm-popup__check-icon" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="platform-confirm-popup__acknowledgement-text">{acknowledgement.label}</span>
            </label>
          )}

          {/* Material's are two text buttons: the way out in the primary, the
            action in the error's red (`platform-md-error`). */}
          <div className="platform-confirm-popup__foot">
            <button
              type="button"
              className={material ? mdButton("text") : "platform-button"}
              onClick={() => dialogRef.current?.close()}
            >
              {exit}
            </button>
            <SubmitButton
              className={
                material ? `${mdButton("text")} platform-md-error` : "platform-button platform-button_variant_danger"
              }
              disabled={blocked}
              pendingLabel={pendingLabel ?? PENDING_LABELS[verb]}
            >
              {confirmLabel}
            </SubmitButton>
          </div>
        </Shell>
      </PlatformLookContext>
    </dialog>
  );
}
