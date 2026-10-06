"use client";

import { useRef } from "react";
import { BarsIcon } from "@/components/icons/bars-icon.comp";
import {
  DeleteStudy,
  type DeleteStudyHandle,
} from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { EditStudy, type EditStudyHandle } from "@/components/platform/sections/studies/study-detail/edit-study.comp";
import type { StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
import "./study-settings.comp.css";

interface StudySettingsProps {
  /** The study: what its two popups open on, and what it may do. */
  study: StudyDetail;
  /** Kinds the study can change to, for the form. */
  kinds: StudyKindOption[];
}

/**
 * The three bars at the end of the head of the study's card: one press opens
 * the study's form — its name, its description, its kind. For a study that
 * can be deleted the form also offers «Eliminar estudio», at its foot, which
 * opens the confirmation on top of the form.
 *
 * It was a menu of two items for an hour («Editar datos», «Eliminar
 * estudio»), and on "Mis partidas", which is never deleted, a menu of one:
 * the owner asked for the button to open the form at once.
 *
 * It is mounted only for whoever may edit the study — `StudyAside` decides —
 * and decides itself whether deleting is offered (`permissions.canDelete`).
 * The two popups are mounted here without triggers, as siblings, and opened
 * through their handles: the form by the bars, with the click, so the focus
 * comes back to them when it closes; the confirmation from the form's foot,
 * over the form, which stays open beneath until the study is gone.
 */
export function StudySettings({ study, kinds }: StudySettingsProps) {
  const editRef = useRef<EditStudyHandle>(null);
  const deleteRef = useRef<DeleteStudyHandle>(null);
  const canDelete = study.permissions.canDelete;

  return (
    <div className="study-settings">
      <button
        type="button"
        className="study-settings__open"
        aria-label={`Editar el estudio «${study.name}»`}
        onClick={(event) => editRef.current?.open(event)}
      >
        <BarsIcon variant="duotone-solid" className="study-settings__open-icon" />
      </button>

      <EditStudy
        ref={editRef}
        trigger="none"
        id={study.id}
        name={study.name}
        description={study.description}
        kindCode={study.kindCode}
        kindLabel={study.kindLabel}
        kinds={kinds}
        canChangeKind={study.permissions.canChangeKind}
        onDelete={canDelete ? () => deleteRef.current?.open() : undefined}
      />
      {canDelete && (
        <DeleteStudy
          ref={deleteRef}
          trigger="none"
          id={study.id}
          name={study.name}
          gameCount={study.gameCount}
          citedGameCount={study.citedGameCount}
          // The study is gone: the form beneath has nothing left to edit.
          onDone={() => editRef.current?.close()}
        />
      )}
    </div>
  );
}
