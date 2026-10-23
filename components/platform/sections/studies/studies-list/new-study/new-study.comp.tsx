"use client";

import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { useRef, useState } from "react";
import { mdFab } from "@/lib/material/material-classes";
import { createStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import "./new-study.comp.css";
import { NewStudyForm } from "./new-study-form.comp";

interface NewStudyProps {
  /**
   * Kinds the viewer can create. "Mis partidas" is never there — it is born
   * with the account — and "Colección" only for a teacher. See services/studies/study-rules.
   */
  kinds: StudyKindOption[];
}

/**
 * «Nuevo estudio»: the page's main action, at the top of its side column as
 * Material's extended FAB (the new design system, 2026-10-23; until then the
 * dashed slot that headed the grid), and the popup it opens.
 */
export function NewStudy({ kinds }: NewStudyProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  // Bumped on every closing: the form is remounted, so it never opens with
  // what was typed the last time. On closing and not on opening, because
  // `open()` focuses the form it finds, and one remounted in the same click
  // would take that focus away with it.
  const [opening, setOpening] = useState(0);

  return (
    <div className="new-study">
      {/* A button and not `PlatformSideNav`'s action, which is a link: this
          one opens a popup. It wears the same FAB and takes the same place. */}
      <button
        type="button"
        className={`${mdFab("primary-container")} new-study__fab`}
        onClick={(event) => popup.current?.open(event)}
      >
        <PlusIcon variant="classic-solid" className="platform-md-icon" />
        Nuevo estudio
      </button>

      <PlatformPopup ref={popup} title="Nuevo estudio" size="md" onClose={() => setOpening((count) => count + 1)}>
        <NewStudyForm
          key={opening}
          kinds={kinds}
          action={createStudy}
          onClose={() => popup.current?.close()}
          // The browser validates `required` before the submit event fires (the
          // form primitive only replaces its bubble with the field's message),
          // so the popup does not close with the form half filled.
          onSubmit={() => popup.current?.close()}
        />
      </PlatformPopup>
    </div>
  );
}
