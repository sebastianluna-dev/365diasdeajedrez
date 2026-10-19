"use client";

import { Popover } from "radix-ui";
import { useId } from "react";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon.comp";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { CloneIcon } from "@/components/icons/clone-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import type { ClassBlockVisibilityCode } from "@/constants/platform/class-codes.const";
import {
  isTextKind,
  kindInfo,
  TEXT_KINDS,
  visibilityChoices,
  type EditorBlock,
  type TextKind,
} from "./class-page-editor.model";
import "./editor-block-menu.comp.css";

/** What each visibility is called in the editor and when the student sees it. */
export function visibilityWords(endHour: string): Record<ClassBlockVisibilityCode, { label: string; hint: string }> {
  return {
    BEFORE: { label: "Para preparar", hint: "Lo ven desde ahora" },
    AFTER: { label: "Después de la clase", hint: `Lo ven cuando termina, a las ${endHour}` },
    TEACHER: { label: "Guion del profesor", hint: "Sólo lo ves tú" },
  };
}

const VISIBILITY_ICONS = { BEFORE: EyeIcon, AFTER: ClockIcon, TEACHER: LockIcon };

interface EditorBlockMenuProps {
  block: EditorBlock;
  /** The hour the class ends, for «Después de la clase». */
  endHour: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onVisibility: (visibility: ClassBlockVisibilityCode) => void;
  onConvert: (kind: TextKind) => void;
  onDuplicate: () => void;
  onMove: (delta: -1 | 1) => void;
  /** Asks first: the editor opens its confirmation. */
  onRemove: () => void;
}

/**
 * What the ⋮⋮ handle of a block opens: who sees it, what kind of text it is
 * (for a text), and Duplicar, Mover arriba, Mover abajo and Eliminar. The
 * moves are the keyboard's way of doing what dragging the handle does. The
 * content of a Radix `Popover` whose trigger is the handle, not portalled,
 * and it plays on `data-state`.
 */
export function EditorBlockMenu({
  block,
  endHour,
  canMoveUp,
  canMoveDown,
  onVisibility,
  onConvert,
  onDuplicate,
  onMove,
  onRemove,
}: EditorBlockMenuProps) {
  const seenId = useId();
  const convertId = useId();
  const words = visibilityWords(endHour);

  return (
    <Popover.Content
      className="editor-block-menu"
      side="bottom"
      align="start"
      sideOffset={4}
      collisionPadding={8}
      aria-label={`Opciones del bloque «${kindInfo(block.kind).label}»`}
    >
      <p id={seenId} className="editor-block-menu__heading">
        Quién lo ve
      </p>
      <div className="editor-block-menu__group" role="group" aria-labelledby={seenId}>
        {visibilityChoices(block.kind).map((code) => {
          const Icon = VISIBILITY_ICONS[code];
          const isOn = block.visibility === code;
          return (
            <button
              key={code}
              type="button"
              className="editor-block-menu__item"
              aria-pressed={isOn}
              onClick={() => onVisibility(code)}
            >
              <Icon variant="classic-solid" className="editor-block-menu__icon" />
              <span className="editor-block-menu__text">
                <span>{words[code].label}</span>
                <span className="editor-block-menu__hint">{words[code].hint}</span>
              </span>
              {isOn && <CheckIcon variant="classic-solid" className="editor-block-menu__check" />}
            </button>
          );
        })}
      </div>

      {isTextKind(block.kind) && (
        <>
          <hr className="editor-block-menu__rule" />
          <p id={convertId} className="editor-block-menu__heading">
            Convertir en
          </p>
          <div className="editor-block-menu__chips" role="group" aria-labelledby={convertId}>
            {TEXT_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="editor-block-menu__chip"
                aria-pressed={block.kind === kind}
                onClick={() => onConvert(kind)}
              >
                {kindInfo(kind).label}
              </button>
            ))}
          </div>
        </>
      )}

      <hr className="editor-block-menu__rule" />
      <button type="button" className="editor-block-menu__item" onClick={onDuplicate}>
        <CloneIcon variant="classic-solid" className="editor-block-menu__icon" />
        Duplicar
      </button>
      <button type="button" className="editor-block-menu__item" disabled={!canMoveUp} onClick={() => onMove(-1)}>
        <ArrowUpIcon variant="classic-solid" className="editor-block-menu__icon" />
        Mover arriba
      </button>
      <button type="button" className="editor-block-menu__item" disabled={!canMoveDown} onClick={() => onMove(1)}>
        <ArrowDownIcon variant="classic-solid" className="editor-block-menu__icon" />
        Mover abajo
      </button>
      <button type="button" className="editor-block-menu__item editor-block-menu__item_tone_danger" onClick={onRemove}>
        <TrashCanIcon variant="classic-solid" className="editor-block-menu__icon" />
        Eliminar
      </button>
    </Popover.Content>
  );
}
