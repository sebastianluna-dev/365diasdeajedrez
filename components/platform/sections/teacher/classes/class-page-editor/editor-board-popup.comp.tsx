"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { DiagramEditor } from "@/components/platform/sections/teacher/classes/class-block-editor/diagram-editor.comp";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import "./editor-board-popup.comp.css";

/** What the popup edits: a diagram's PGN, or a question's position written as one, and where the result goes. */
export interface EditorBoardTarget {
  pgn: string;
  /** The position alone: a question's board draws no marks. */
  positionOnly: boolean;
  onSave: (pgn: string) => void;
}

export interface EditorBoardPopupHandle {
  open: (event: { currentTarget: HTMLElement }, target: EditorBoardTarget) => void;
}

/**
 * The diagram editor in a popup, for the class editor: a diagram's two steps,
 * or a question's position alone. «Guardar» hands the PGN back and closes it;
 * the editor is mounted anew on every use.
 */
export function EditorBoardPopup({ ref }: { ref: Ref<EditorBoardPopupHandle> }) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const [target, setTarget] = useState<EditorBoardTarget | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (event, next) => {
        setTarget(next);
        popup.current?.open(event);
      },
    }),
    [],
  );

  return (
    <PlatformPopup
      ref={popup}
      title={target?.positionOnly ? "La posición de la pregunta" : "Diagrama"}
      size="lg"
      onClose={() => setUse((count) => count + 1)}
    >
      {target && (
        <PlatformForm
          key={use}
          className="editor-board-popup"
          onSubmit={(event) => {
            event.preventDefault();
            const pgn = new FormData(event.currentTarget).get("pgn");
            if (typeof pgn === "string") target.onSave(pgn);
            popup.current?.close();
          }}
        >
          <DiagramEditor defaultPgn={target.pgn} positionOnly={target.positionOnly} />
          <div className="editor-board-popup__foot">
            <button type="submit" className="platform-button platform-button_variant_ink">
              {target.positionOnly ? "Guardar la posición" : "Guardar el diagrama"}
            </button>
          </div>
        </PlatformForm>
      )}
    </PlatformPopup>
  );
}
