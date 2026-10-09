"use client";

import type { Ref } from "react";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
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
 * so it is a `PlatformPopup` and not the bin's `PlatformConfirmPopup`.
 */
export function AbandonPopup({ ref, onAbandon, onCancel }: AbandonPopupProps) {
  return (
    <PlatformPopup ref={ref} title="¿Abandonas la partida?" size="sm" phone="sheet">
      <form action={onAbandon} className="abandon-popup">
        <p className="abandon-popup__text">La partida cuenta como perdida y queda en tu perfil.</p>
        <footer className="abandon-popup__foot">
          <button type="button" className="platform-button" onClick={onCancel}>
            Seguir jugando
          </button>
          <SubmitButton className="platform-button platform-button_variant_danger" pendingLabel="Abandonando…">
            Abandonar
          </SubmitButton>
        </footer>
      </form>
    </PlatformPopup>
  );
}
