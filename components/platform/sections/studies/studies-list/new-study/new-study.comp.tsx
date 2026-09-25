"use client";

import { useRef, useState } from "react";
import { createStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./new-study.comp.css";
import { NewStudyForm } from "./new-study-form.comp";

interface NewStudyProps {
  /**
   * Kinds the viewer can create. "Mis partidas" is never there — it is born
   * with the account — and "Colección" only for a teacher. See services/studies/study-rules.
   */
  kinds: StudyKindOption[];
}

export function NewStudy({ kinds }: NewStudyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Bumped on every opening: the form is remounted, so it never opens with
  // what was typed the last time.
  const [opening, setOpening] = useState(0);

  const open = () => {
    setOpening((count) => count + 1);
    dialogRef.current?.showModal();
  };

  return (
    <div className="new-study">
      <button type="button" className="platform-button new-study__open" onClick={open}>
        Nuevo estudio
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog new-study__dialog">
        <NewStudyForm
          key={opening}
          kinds={kinds}
          action={createStudy}
          onClose={() => dialogRef.current?.close()}
          // The browser validates `required` before the submit event fires (the
          // form primitive only replaces its bubble with the field's message),
          // so the dialog does not close with the form half filled.
          onSubmit={() => dialogRef.current?.close()}
        />
      </dialog>
    </div>
  );
}
