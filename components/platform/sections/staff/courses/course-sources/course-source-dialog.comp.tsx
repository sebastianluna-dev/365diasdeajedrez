"use client";

import { useRef, useState } from "react";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { saveCourseSource } from "@/services/staff-sources/staff-sources.actions";
import type { CourseSourceAdmin, SourceEntityOption } from "@/services/staff-sources/staff-sources.types";
import "./course-source-dialog.comp.css";
import { CourseSourceForm } from "./course-source-form.comp";

interface CourseSourceDialogProps {
  courseId: string;
  /** The source to edit; without it the dialog adds a new one. */
  source?: CourseSourceAdmin;
  sourceTypes: CatalogOption[];
  entities: SourceEntityOption[];
}

/**
 * The button and the native `<dialog>` that add or edit one source of the
 * course: «Añadir fuente» in the panel's header, «Editar» on each row. The
 * form is remounted on every opening, so an abandoned edit never shows up
 * the next time.
 */
export function CourseSourceDialog({ courseId, source, sourceTypes, entities }: CourseSourceDialogProps) {
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
        className={
          isEdit
            ? "course-source-dialog__open course-source-dialog__open_kind_edit"
            : "platform-button platform-button_variant_quiet course-source-dialog__open"
        }
        onClick={open}
      >
        {isEdit ? "Editar" : "Añadir fuente"}
      </button>

      <dialog ref={dialogRef} className="platform-dialog course-source-dialog__dialog">
        <CourseSourceForm
          key={opening}
          source={source}
          sourceTypes={sourceTypes}
          entities={entities}
          action={saveCourseSource.bind(null, courseId)}
          onClose={() => dialogRef.current?.close()}
          // The browser validates the fields before the submit event fires,
          // so the dialog does not close with a bad URL in it.
          onSubmit={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
