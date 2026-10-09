"use client";

import { useId, useImperativeHandle, useRef, type ReactNode, type Ref } from "react";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import "./platform-popup.comp.css";

/** What a host gets through `ref`: the three things it can do to the popup. */
export interface PlatformPopupHandle {
  /**
   * `showModal()`: the top layer, the focus trap, Escape and the backdrop
   * come with it. Given the click, the trigger takes the focus first (Safari,
   * and Firefox on a Mac, do not focus a pressed button), so the focus comes
   * back to it on closing instead of landing on `<body>`. Then the first
   * control of the content is focused; with none, the cross keeps it.
   */
  open: (event?: { currentTarget: HTMLElement }) => void;
  /** `close()`: the exit plays from the frame's stylesheet, `onClose` fires, and the focus returns to the trigger. */
  close: () => void;
  isOpen: () => boolean;
}

interface PlatformPopupProps {
  /**
   * What the strip says. It is also the popup's accessible name
   * (`aria-labelledby`), so it changes when the content changes («Autores» →
   * «Editar autor»).
   */
  title: string;
  /** How the host opens and closes it. Every host draws its own trigger: the popup has none. */
  ref: Ref<PlatformPopupHandle>;
  /** `sm` 480px, `md` 600px (the default), `lg` 720px; always within the viewport. */
  size?: "sm" | "md" | "lg";
  /**
   * `sheet`: on a phone (under 640px) it comes up from the bottom, as wide as
   * the screen, instead of standing in the middle (P3): for a short question
   * asked over a board, where the thumb already is.
   */
  phone?: "sheet";
  /**
   * The native `close` event, whichever exit (the cross, Escape, `close()`, a
   * form that closes on submit): where a host resets what the content held —
   * a ticked box, a chosen tab, a form it remounts with a key. Reset on
   * closing and not on opening: `open()` focuses the content it finds, and a
   * content remounted in the same click would take that focus away with it.
   */
  onClose?: () => void;
  /** What is under the strip. It pads itself: the frame and the strip pad nothing below the rule. */
  children: ReactNode;
}

/** What can take the focus inside the content: the first of them is focused on opening. */
const FOCUSABLE =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * The platform's modal popup: the one piece every popup of the platform is.
 * Only the strip is the same in all of them, the name on the left and the
 * cross on the right; what is under it is the content's, which brings its own
 * padding, its fields, its buttons and its foot. A native `<dialog>` on the
 * frame `.platform-dialog` of platform.css, which centres it, scrolls it past
 * the viewport and plays its entry and exit: this piece draws no motion of
 * its own.
 *
 * It is opened and closed through its handle, never by a trigger of its own,
 * so a host can keep it open while a `PlatformConfirmPopup` is opened on top
 * of it: a second modal stacks in the top layer over this one, with its own
 * backdrop, and this one waits beneath, inert, until the question is
 * answered.
 */
export function PlatformPopup({ title, ref, size = "md", phone, onClose, children }: PlatformPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useImperativeHandle(
    ref,
    () => ({
      open: (event) => {
        const dialog = dialogRef.current;
        if (!dialog || dialog.open) return;
        event?.currentTarget.focus();
        dialog.showModal();
        // The browser focuses the first focusable element, which is the
        // cross: the content's first control is what one comes for.
        const first = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].find(
          (element) => !element.closest(".platform-popup__head"),
        );
        first?.focus();
      },
      close: () => dialogRef.current?.close(),
      isOpen: () => dialogRef.current?.open ?? false,
    }),
    [],
  );

  return (
    <dialog
      ref={dialogRef}
      className={`platform-dialog platform-popup platform-popup_size_${size}${phone ? " platform-dialog_phone_sheet" : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <header className="platform-popup__head">
        <h2 id={titleId} className="platform-popup__title">
          {title}
        </h2>
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square platform-popup__close"
          onClick={() => dialogRef.current?.close()}
          aria-label="Cerrar"
        >
          <XmarkIcon variant="classic-solid" className="platform-button__icon" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
