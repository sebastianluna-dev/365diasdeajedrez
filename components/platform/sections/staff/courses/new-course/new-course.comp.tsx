"use client";

import { useRef, useState } from "react";
import { createCourse } from "@/services/staff-courses/staff-courses.actions";
import type { ContentTypeOption } from "@/services/staff-courses/staff-courses.types";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import "./new-course.comp.css";
import { NewCourseForm } from "./new-course-form.comp";

interface NewCourseProps {
  /** The content types on offer, from the catalog; the course needs at least one. */
  contentTypes: ContentTypeOption[];
}

/**
 * "Nuevo curso": the button in the catalog's header and the popup it opens.
 * Creating a course is three fields, so it lives in a modal on the list page
 * and not on a page of its own, like "Nuevo estudio" on the studies list.
 */
export function NewCourse({ contentTypes }: NewCourseProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  // Bumped on every closing: the form is remounted, so it never opens with
  // what was typed the last time. On closing and not on opening, because
  // `open()` focuses the form it finds, and one remounted in the same click
  // would take that focus away with it.
  const [opening, setOpening] = useState(0);

  return (
    <div className="new-course">
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Nuevo curso
      </button>

      {/* The widest popup: the eight content-type cards want three columns
          to keep the list short. */}
      <PlatformPopup ref={popup} title="Nuevo curso" size="lg" onClose={() => setOpening((count) => count + 1)}>
        <NewCourseForm
          key={opening}
          contentTypes={contentTypes}
          action={createCourse}
          onClose={() => popup.current?.close()}
          // The browser validates `required` and `pattern` before the submit
          // event fires (the form primitive only replaces its bubble with the
          // field's message), and the form keeps its submit off until a content
          // type is chosen, so the popup does not close with a bad form.
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>
    </div>
  );
}
