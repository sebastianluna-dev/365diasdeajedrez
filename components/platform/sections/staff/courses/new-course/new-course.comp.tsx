"use client";

import { useRef, useState } from "react";
import { createCourse } from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import "./new-course.comp.css";
import { NewCourseForm } from "./new-course-form.comp";

interface NewCourseProps {
  /** The course types on offer, from the catalog; the first one is chosen. */
  types: CatalogOption[];
}

/**
 * "Nuevo curso": the button in the catalog's header and the dialog it opens.
 * Creating a course is three fields, so it lives in a modal on the list page
 * and not on a page of its own, like "Nuevo estudio" on the studies list.
 */
export function NewCourse({ types }: NewCourseProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Bumped on every opening: the form is remounted, so it never opens with
  // what was typed the last time.
  const [opening, setOpening] = useState(0);

  const open = () => {
    setOpening((count) => count + 1);
    dialogRef.current?.showModal();
  };

  return (
    <div className="new-course">
      {/* The quiet grey button: the catalog has no orange in it. */}
      <button type="button" className="platform-button platform-button_variant_quiet" onClick={open}>
        Nuevo curso
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog new-course__dialog">
        <NewCourseForm
          key={opening}
          types={types}
          action={createCourse}
          onClose={() => dialogRef.current?.close()}
          // The browser validates `required` and `pattern` before the submit
          // event fires (the form primitive only replaces its bubble with the
          // field's message), so the dialog does not close with a bad form.
          onSubmit={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
