"use client";

import { useRef, useState } from "react";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { deleteCourseSource, saveCourseSource } from "@/services/staff-sources/staff-sources.actions";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";
import "./course-source-dialog.comp.css";
import { CourseSourceForm } from "./course-source-form.comp";

interface CourseSourceDialogProps {
  courseId: string;
  /** The source to edit; without it the dialog adds a new one. */
  source?: CourseSourceAdmin;
  sourceTypes: CatalogOption[];
}

/**
 * The button and the native `<dialog>` that add or edit one source of the
 * course: «Agregar fuente» in the panel's header, «Editar» on each row, where
 * the source is also removed. The form is remounted on every opening, so an
 * abandoned edit never shows up the next time.
 */
export function CourseSourceDialog({ courseId, source, sourceTypes }: CourseSourceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opening, setOpening] = useState(0);
  const isEdit = source !== undefined;

  const open = () => {
    setOpening((count) => count + 1);
    dialogRef.current?.showModal();
  };

  return (
    <div className="course-source-dialog">
      <button
        type="button"
        // On a row it is the action of that row; in the panel's header it is
        // the one button of the card.
        className={isEdit ? "platform-row-action" : "platform-button platform-button_size_compact"}
        aria-label={isEdit ? `Editar la fuente «${source.originalTitle ?? source.sourceTypeLabel}»` : undefined}
        onClick={open}
      >
        {isEdit ? "Editar" : "Agregar fuente"}
      </button>

      <dialog ref={dialogRef} className="platform-dialog course-source-dialog__dialog">
        <CourseSourceForm
          key={opening}
          source={source}
          sourceTypes={sourceTypes}
          action={saveCourseSource.bind(null, courseId)}
          deleteAction={deleteCourseSource.bind(null, courseId)}
          onClose={() => dialogRef.current?.close()}
          // The browser validates the fields before the submit event fires,
          // so the dialog does not close with a bad URL in it.
          onSubmit={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
