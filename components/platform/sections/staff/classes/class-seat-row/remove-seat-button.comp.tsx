"use client";

import { useRef } from "react";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";

interface RemoveSeatButtonProps {
  studentName: string;
  /** «Taller de finales de torre» and «sáb 17 oct · 10:00–11:30». */
  classTitle: string;
  whenLabel: string;
  /** What the seat was: «Su clase vuelve a su pago del jue 1 oct.», «No tenía pago.», «Tenía la clase gratis.» */
  consequence: string;
  /** The server action, already bound to the class and the student. */
  action: (formData: FormData) => Promise<void>;
}

/** The row's «Quitar», with its confirmation as a sibling: the seat leaves the class, never destroyed. */
export function RemoveSeatButton({ studentName, classTitle, whenLabel, consequence, action }: RemoveSeatButtonProps) {
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-row-action" onClick={(event) => confirm.current?.open(event)}>
        Quitar
      </button>
      <PlatformConfirmPopup
        ref={confirm}
        verb="Quitar"
        subject={studentName}
        title={`¿Quitar a ${studentName} de la clase?`}
        description={`Sale de «${classTitle}» del ${whenLabel}.`}
        consequences={[consequence]}
        action={action}
        confirmLabel="Quitar de la clase"
      />
    </>
  );
}
