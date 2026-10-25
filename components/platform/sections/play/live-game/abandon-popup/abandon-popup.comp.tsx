"use client";

import type { Ref } from "react";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { popupButton, usePlatformLook } from "@/components/platform/shared/platform-look";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { mdButton } from "@/lib/material/material-classes";
import "./abandon-popup.comp.css";

interface AbandonPopupProps {
  ref: Ref<PlatformPopupHandle>;
  /** Closes the game, lost; the popup closes once it resolves. */
  onAbandon: () => Promise<void>;
  /** «Seguir jugando». */
  onCancel: () => void;
}

/**
 * «¿Abandonas la partida?» (P1): a small popup, and on a phone a sheet on the
 * bottom edge (P3). Not a destruction — the game stays on the profile, lost —
 * so it is a `PlatformPopup` and not the bin's `PlatformConfirmPopup`. On a
 * game's page, which is in the new design system, it opens as Material's
 * dialog, and its two answers are Material's text buttons, «Abandonar» in the
 * error's red, as a confirmation draws its action.
 */
export function AbandonPopup({ ref, onAbandon, onCancel }: AbandonPopupProps) {
  return (
    <PlatformPopup ref={ref} title="¿Abandonas la partida?" size="sm" phone="sheet">
      <form action={onAbandon} className="abandon-popup">
        <p className="abandon-popup__text">La partida cuenta como perdida y queda en tu perfil.</p>
        <AbandonFoot onCancel={onCancel} />
      </form>
    </PlatformPopup>
  );
}

/** The two answers, in the look the popup opened in (read from inside it). */
function AbandonFoot({ onCancel }: { onCancel: () => void }) {
  const look = usePlatformLook();
  return (
    <footer className="abandon-popup__foot">
      <button type="button" className={popupButton(look, "exit")} onClick={onCancel}>
        Seguir jugando
      </button>
      <SubmitButton
        className={
          look === "material"
            ? `${mdButton("text")} platform-md-error`
            : "platform-button platform-button_variant_danger"
        }
        pendingLabel="Abandonando…"
      >
        Abandonar
      </SubmitButton>
    </footer>
  );
}
