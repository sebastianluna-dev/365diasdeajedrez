"use client";

import { useRef } from "react";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";

/** What the bank's confirmation says goes: the exercise, and its place in any series. */
const BANK_DESCRIPTION = "Se elimina el ejercicio con su solución. Si está en alguna serie, sale de ella.";

interface DeleteExerciseProps {
  /** What the confirmation names. */
  title: string;
  /** One sentence: what goes. The bank's by default; a lesson's panel says what its students lose. */
  description?: string;
  /** `deleteExercise` bound to the exercise; a stub in Storybook. */
  action: (formData: FormData) => Promise<void>;
}

/**
 * «Eliminar», the bank card's row word in the danger's ink, behind its
 * confirmation. The card's one piece with state (the confirmation's ref), so
 * the card itself renders on the server.
 */
export function DeleteExercise({ title, description = BANK_DESCRIPTION, action }: DeleteExerciseProps) {
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-row-action platform-row-action_variant_danger"
        onClick={(event) => confirm.current?.open(event)}
      >
        Eliminar
      </button>
      <PlatformConfirmPopup
        ref={confirm}
        subject={title}
        description={description}
        confirmLabel="Eliminar ejercicio"
        action={action}
      />
    </>
  );
}
