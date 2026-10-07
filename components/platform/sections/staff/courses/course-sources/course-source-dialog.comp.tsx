"use client";

import { useRef, useState } from "react";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { deleteCourseSource, saveCourseSource } from "@/services/staff-sources/staff-sources.actions";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";
import "./course-source-dialog.comp.css";
import { CourseSourceForm } from "./course-source-form.comp";

interface CourseSourceDialogProps {
  courseId: string;
  /** The source to edit; without it the popup adds a new one. */
  source?: CourseSourceAdmin;
  sourceTypes: CatalogOption[];
}

/**
 * The button and the popup that add or edit one source of the course:
 * «Agregar fuente» in the panel's header, «Editar» on each row, where the
 * source is also deleted, through a confirmation opened on top of the popup.
 * The form is remounted on every closing, so an abandoned edit never shows
 * up the next time.
 */
export function CourseSourceDialog({ courseId, source, sourceTypes }: CourseSourceDialogProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  // Bumped on closing, not on the click that opens: `open()` focuses the
  // form it finds, and one remounted in the same click would take that
  // focus away with it.
  const [opening, setOpening] = useState(0);
  const isEdit = source !== undefined;

  return (
    <div className="course-source-dialog">
      <button
        type="button"
        // On a row it is the action of that row; in the panel's header it is
        // the one button of the card.
        className={isEdit ? "platform-row-action" : "platform-button platform-button_size_sm"}
        aria-label={isEdit ? `Editar la fuente «${source.originalTitle ?? source.sourceTypeLabel}»` : undefined}
        onClick={(event) => popup.current?.open(event)}
      >
        {isEdit ? "Editar" : "Agregar fuente"}
      </button>

      <PlatformPopup
        ref={popup}
        title={isEdit ? "Editar fuente" : "Nueva fuente"}
        size="lg"
        onClose={() => setOpening((count) => count + 1)}
      >
        <CourseSourceForm
          key={opening}
          source={source}
          sourceTypes={sourceTypes}
          action={saveCourseSource.bind(null, courseId)}
          onDelete={isEdit ? () => confirm.current?.open() : undefined}
          onClose={() => popup.current?.close()}
          // The browser validates the fields before the submit event fires,
          // so the popup does not close with a bad URL in it.
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>

      {/* A sibling of the popup, never inside it: it stacks on top, and when
          the source is gone it closes the popup beneath through `onDone`. */}
      {isEdit && (
        <PlatformConfirmPopup
          ref={confirm}
          subject={source.originalTitle ?? source.sourceTypeLabel}
          description="Se elimina la fuente del curso."
          action={deleteCourseSource.bind(null, courseId, source.id)}
          confirmLabel="Eliminar fuente"
          onDone={() => popup.current?.close()}
        />
      )}
    </div>
  );
}
