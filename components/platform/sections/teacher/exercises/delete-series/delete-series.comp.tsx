"use client";

import { useRef } from "react";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";

interface DeleteSeriesProps {
  title: string;
  /** How many students have it now: said in what goes. */
  studentCount: number;
  /** `deleteExerciseSeries` bound to the series; it redirects to the bank's «Series». */
  action: (formData: FormData) => Promise<void>;
}

/**
 * «Eliminar la serie», at the foot of its page, behind its confirmation:
 * the exercises stay in the bank, the students stop seeing it, and their
 * attempts stay in their history.
 */
export function DeleteSeries({ title, studentCount, action }: DeleteSeriesProps) {
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_danger platform-button_size_sm"
        onClick={(event) => confirm.current?.open(event)}
      >
        <TrashCanIcon variant="classic-solid" className="platform-button__icon" />
        Eliminar la serie
      </button>
      <PlatformConfirmPopup
        ref={confirm}
        subject={title}
        description="Se elimina la serie. Sus ejercicios siguen en tu banco."
        consequences={[
          studentCount > 0
            ? `${studentCount === 1 ? "El alumno que la tiene deja" : `Los ${studentCount} alumnos que la tienen dejan`} de verla en «Ejercicios».`
            : "No la tiene ningún alumno.",
          "Los intentos que hicieron se conservan en su historial.",
        ]}
        action={action}
        confirmLabel="Eliminar la serie"
      />
    </>
  );
}
