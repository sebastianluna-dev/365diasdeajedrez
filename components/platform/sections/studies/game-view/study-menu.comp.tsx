"use client";

import { useRef } from "react";
import { DropdownMenu } from "radix-ui";
import { EllipsisIcon } from "@/components/icons/ellipsis-icon.comp";
import {
  DeleteStudy,
  type DeleteStudyHandle,
} from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { EditStudy, type EditStudyHandle } from "@/components/platform/sections/studies/study-detail/edit-study.comp";
import type { StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
import "./study-menu.comp.css";

interface StudyMenuProps {
  /** The study whose menu this is: what its two dialogs open on, and what it may do. */
  study: StudyDetail;
  /** Kinds the study can change to, for «Editar datos». */
  kinds: StudyKindOption[];
}

/**
 * The study's own actions, behind three dots at the end of the head of its
 * card: «Editar datos» and, for a study that can be deleted, «Eliminar
 * estudio». They were two words under the study's name; a menu keeps the head
 * to one line and leaves room for what the study may do later.
 *
 * It is mounted only for whoever may edit the study — `StudyAside` decides —
 * and decides itself whether deleting is offered (`permissions.canDelete`:
 * "Mis partidas" is edited but never deleted).
 *
 * The two dialogs are mounted beside the menu and not inside it: the list of
 * the menu is unmounted when it closes, and a dialog inside it would go with
 * it. Each is opened through its handle. The focus goes back to the button
 * first, so that the dialog, on closing, returns it there and not to an item
 * that no longer exists.
 *
 * On Radix's `DropdownMenu`, not portalled like the rest of the platform's
 * popups, and not modal: it is a short list beside a button, and the page
 * behind it stays as it is.
 */
export function StudyMenu({ study, kinds }: StudyMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<EditStudyHandle>(null);
  const deleteRef = useRef<DeleteStudyHandle>(null);

  const openFrom = (dialog: { open: () => void } | null) => {
    buttonRef.current?.focus();
    dialog?.open();
  };

  return (
    <div className="study-menu">
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger ref={buttonRef} className="study-menu__open" aria-label={`Opciones de «${study.name}»`}>
          <EllipsisIcon variant="duotone-solid" className="study-menu__open-icon" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content className="study-menu__list" align="end" sideOffset={4}>
          <DropdownMenu.Item className="study-menu__item" onSelect={() => openFrom(editRef.current)}>
            Editar datos
          </DropdownMenu.Item>
          {study.permissions.canDelete && (
            <DropdownMenu.Item
              className="study-menu__item study-menu__item_variant_danger"
              onSelect={() => openFrom(deleteRef.current)}
            >
              Eliminar estudio
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

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
      />
      {study.permissions.canDelete && (
        <DeleteStudy
          ref={deleteRef}
          trigger="none"
          id={study.id}
          name={study.name}
          gameCount={study.gameCount}
          citedGameCount={study.citedGameCount}
        />
      )}
    </div>
  );
}
