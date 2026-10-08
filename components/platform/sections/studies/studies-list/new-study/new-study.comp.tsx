"use client";

import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { useRef, useState } from "react";
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
 * «Nuevo estudio»: the dashed slot that heads the grid of «Mis estudios», and
 * the popup it opens. The only way in since 2026-10-07: the page's head had a
 * button to the same popup, which the owner took out.
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
      {/* The first cell of the grid: what does not exist yet, dashed, lit when
          it is about to be pressed. */}
      <button type="button" className="new-study__slot" onClick={(event) => popup.current?.open(event)}>
        <PlusIcon variant="classic-solid" className="new-study__slot-icon" />
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
