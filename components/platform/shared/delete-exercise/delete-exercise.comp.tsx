"use client";

import { useRef } from "react";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";

interface DeleteExerciseProps {
  /** What the confirmation names. */
  title: string;
  /** `deleteExercise` bound to the exercise; a stub in Storybook. */
  action: (formData: FormData) => Promise<void>;
}

/**
 * «Eliminar», the bank card's row word in the danger's ink, behind its
 * confirmation. The card's one piece with state (the confirmation's ref), so
 * the card itself renders on the server.
 */
export function DeleteExercise({ title, action }: DeleteExerciseProps) {
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
        description="Se elimina el ejercicio con su solución. Si está en alguna serie, sale de ella."
        confirmLabel="Eliminar ejercicio"
        action={action}
      />
    </>
  );
}
