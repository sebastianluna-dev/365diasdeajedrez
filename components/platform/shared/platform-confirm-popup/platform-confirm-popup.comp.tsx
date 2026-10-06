"use client";

import { useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { Checkbox } from "radix-ui";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CircleMinusIcon } from "@/components/icons/circle-minus-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
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

/** The two verbs a confirmation asks with: «Eliminar» destroys, «Quitar» takes out of where it is. */
export type PlatformConfirmVerb = "Eliminar" | "Quitar";

export interface PlatformConfirmPopupProps {
  /**
   * «Eliminar» (the default) destroys: the bin, and the foot says it cannot
   * be undone. «Quitar» takes something out of where it is: the minus, and no
   * note unless `note` gives one.
   */
  verb?: PlatformConfirmVerb;
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
  /** The foot's note. By verb when absent (see `verb`); `null` draws none. */
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
};

const PENDING_LABELS: Record<PlatformConfirmVerb, string> = {
  Eliminar: "Eliminando…",
  Quitar: "Quitando…",
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
 */
export function PlatformConfirmPopup({
  verb = "Eliminar",
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
  const checkId = useId();

  useImperativeHandle(
    ref,
    () => ({
      open: (event) => {
        const dialog = dialogRef.current;
        if (!dialog || dialog.open) return;
        event?.currentTarget.focus();
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
  const footNote = note === undefined ? NOTES[verb] : note;
  const Icon = verb === "Eliminar" ? TrashCanIcon : CircleMinusIcon;

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

  return (
    <dialog
      ref={dialogRef}
      className="platform-dialog platform-confirm-popup"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => {
        // Nothing stays half agreed to.
        setAcknowledged(false);
        onClose?.();
      }}
    >
      <form action={submit} className="platform-confirm-popup__form">
        <div className="platform-confirm-popup__head">
          <span className="platform-confirm-popup__icon" aria-hidden="true">
            <Icon variant="duotone-solid" className="platform-confirm-popup__icon-glyph" />
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

        <div className="platform-confirm-popup__foot">
          {footNote && <span className="platform-confirm-popup__note">{footNote}</span>}
          <button type="button" className="platform-button" onClick={() => dialogRef.current?.close()}>
            Cancelar
          </button>
          <SubmitButton
            className="platform-button platform-button_variant_danger"
            disabled={blocked}
            pendingLabel={pendingLabel ?? PENDING_LABELS[verb]}
          >
            {confirmLabel}
          </SubmitButton>
        </div>
      </form>
    </dialog>
  );
}
