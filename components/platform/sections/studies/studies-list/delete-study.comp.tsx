"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { mdIconButton } from "@/lib/material/material-classes";
import { deleteStudy } from "@/services/studies/studies.actions";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import "./delete-study.comp.css";

interface DeleteStudyProps {
  id: string;
  name: string;
  gameCount: number;
  citedGameCount: number;
  /**
   * `icon` is the card's cross, Material's icon button (the library moved
   * to the new design system on 2026-10-23); `none` draws no trigger, and whoever mounts it opens the
   * confirmation through `ref` (`StudySettings` beside the board, from
   * «Eliminar estudio» at the foot of the study's form). The trigger
   * changes, not the confirmation.
   */
  trigger?: "icon" | "none";
  ref?: Ref<DeleteStudyHandle>;
  /**
   * Called once the study is deleted, after the confirmation closed: where a
   * host that opened it over a popup closes that popup (`StudySettings`
   * closes the study's form). Never called on cancel. Alone, from a card,
   * the action's redirect does the rest and this is omitted.
   */
  onDone?: () => void;
}

/** What a host that draws its own trigger gets: the way to open the confirmation. */
export interface DeleteStudyHandle {
  /** Given the click, the trigger takes the focus first, so cancelling brings it back there. */
  open: (event?: { currentTarget: HTMLElement }) => void;
}

/**
 * The words of the study's confirmation, on `PlatformConfirmPopup`: what is
 * lost, by the counts, and the box the server requires exactly when there is
 * something to lose. Two triggers for the same confirmation.
 */
export function DeleteStudy({ id, name, gameCount, citedGameCount, trigger = "icon", ref, onDone }: DeleteStudyProps) {
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  useImperativeHandle(ref, () => ({ open: (event) => confirm.current?.open(event) }), []);

  // Same condition as the server: the box is only required when there is
  // something to lose. If the client let it submit without it where the server
  // requires it, the action would bounce to the error page instead of deleting.
  const needsConfirmation = gameCount > 0 || citedGameCount > 0;

  const description =
    gameCount > 0
      ? `Se elimina el estudio con sus ${gameCount} ${gameCount === 1 ? "capítulo" : "capítulos"}, y con ellos sus variantes, comentarios y flechas.`
      : "Se elimina el estudio. No tiene capítulos dentro.";

  const warning =
    citedGameCount > 0
      ? `Entiendo que se eliminará todo, y que ${citedGameCount} ${
          citedGameCount === 1
            ? "capítulo citado en clases dejará ese bloque vacío"
            : "capítulos citados en clases dejarán esos bloques vacíos"
        }.`
      : "Entiendo que se eliminará todo y que no se puede deshacer.";

  return (
    <div className="delete-study">
      {trigger === "icon" ? (
        <button
          type="button"
          className={`${mdIconButton("standard", "xs")} delete-study__open`}
          title={`Eliminar «${name}»`}
          onClick={(event) => confirm.current?.open(event)}
        >
          <XmarkIcon variant="classic-solid" className="platform-md-icon" />
          <span className="delete-study__open-label">Eliminar «{name}»</span>
        </button>
      ) : null}

      <PlatformConfirmPopup
        ref={confirm}
        subject={name}
        description={description}
        acknowledgement={needsConfirmation ? { name: "confirmDelete", label: warning } : undefined}
        action={deleteStudy.bind(null, id)}
        confirmLabel="Eliminar estudio"
        onDone={onDone}
      />
    </div>
  );
}
