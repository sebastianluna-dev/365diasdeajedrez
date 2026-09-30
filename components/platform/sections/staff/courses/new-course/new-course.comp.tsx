"use client";

import { useRef, useState } from "react";
import { createCourse } from "@/services/staff-courses/staff-courses.actions";
import type { ContentTypeOption } from "@/services/staff-courses/staff-courses.types";
import "./new-course.comp.css";
import { NewCourseForm } from "./new-course-form.comp";

interface NewCourseProps {
  /** The content types on offer, from the catalog; the course needs at least one. */
  contentTypes: ContentTypeOption[];
}

/**
 * "Nuevo curso": the button in the catalog's header and the dialog it opens.
 * Creating a course is three fields, so it lives in a modal on the list page
 * and not on a page of its own, like "Nuevo estudio" on the studies list.
 */
export function NewCourse({ contentTypes }: NewCourseProps) {
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
      <button type="button" className="platform-button" onClick={open}>
        Nuevo curso
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog new-course__dialog">
        <NewCourseForm
          key={opening}
          contentTypes={contentTypes}
          action={createCourse}
          onClose={() => dialogRef.current?.close()}
          // The browser validates `required` and `pattern` before the submit
          // event fires (the form primitive only replaces its bubble with the
          // field's message), and the form keeps its submit off until a content
          // type is chosen, so the dialog does not close with a bad form.
          onSubmit={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
