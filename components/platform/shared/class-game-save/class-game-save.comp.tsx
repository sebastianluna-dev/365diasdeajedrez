"use client";

import { useRef } from "react";
import { BookmarkPlusIcon } from "@/components/icons/bookmark-plus-icon.comp";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SaveToStudyPopup } from "@/components/platform/shared/save-to-study-popup/save-to-study-popup.comp";
import "./class-game-save.comp.css";

/** `saveClassGameToStudy`, as the page hands it down. */
export type SaveClassGameAction = (classId: string, blockId: string, formData: FormData) => Promise<void>;

export interface ClassGameSaveProps {
  classId: string;
  blockId: string;
  /** The name the copy is proposed with: the game's players. */
  title: string;
  /** The student's own studies. */
  studies: { id: string; name: string }[];
  action: SaveClassGameAction;
}

/**
 * «Guardar en un estudio» under a game seen in class: the button and its
 * `SaveToStudyPopup`, a sibling. The copy goes to a study of the student's;
 * the class keeps its game. The action arrives as a prop, bound here to the
 * class and the block.
 */
export function ClassGameSave({ classId, blockId, title, studies, action }: ClassGameSaveProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <div className="class-game-save">
      <button
        type="button"
        className="platform-button platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        <BookmarkPlusIcon variant="classic-solid" className="platform-button__icon" />
        Guardar en un estudio
      </button>
      <SaveToStudyPopup
        ref={popup}
        studies={studies}
        defaultTitle={title}
        action={action.bind(null, classId, blockId)}
        onCancel={() => popup.current?.close()}
      />
    </div>
  );
}
