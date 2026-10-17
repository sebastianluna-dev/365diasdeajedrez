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
  /** Whose series: a teacher's (the default, given to `studentCount` students) or the academy's (published to everyone, or to nobody). */
  audience?: "teacher" | "academy";
  /** An academy series: whether every student sees it now. */
  published?: boolean;
}

/**
 * «Eliminar la serie», at the foot of its page, behind its confirmation:
 * the exercises stay in the bank (or the library), the students stop seeing
 * it, and their attempts stay in their history.
 */
export function DeleteSeries({
  title,
  studentCount,
  action,
  audience = "teacher",
  published = false,
}: DeleteSeriesProps) {
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  const who =
    audience === "academy"
      ? published
        ? "Todos los alumnos dejan de verla en «Ejercicios»."
        : "No estaba publicada: ningún alumno la veía."
      : studentCount > 0
        ? `${studentCount === 1 ? "El alumno que la tiene deja" : `Los ${studentCount} alumnos que la tienen dejan`} de verla en «Ejercicios».`
        : "No la tiene ningún alumno.";
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
        description={
          audience === "academy"
            ? "Se elimina la serie. Sus ejercicios siguen en la biblioteca."
            : "Se elimina la serie. Sus ejercicios siguen en tu banco."
        }
        consequences={[who, "Los intentos que hicieron se conservan en su historial."]}
        action={action}
        confirmLabel="Eliminar la serie"
      />
    </>
  );
}
