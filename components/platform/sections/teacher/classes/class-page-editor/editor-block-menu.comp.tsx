"use client";

import { Popover } from "radix-ui";
import { useId } from "react";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon.comp";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { CloneIcon } from "@/components/icons/clone-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import { isTextKind, kindInfo, TEXT_KINDS, type EditorBlock, type TextKind } from "./class-page-editor.model";
import "./editor-block-menu.comp.css";

interface EditorBlockMenuProps {
  block: EditorBlock;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onConvert: (kind: TextKind) => void;
  onDuplicate: () => void;
  onMove: (delta: -1 | 1) => void;
  /** Asks first: the editor opens its confirmation. */
  onRemove: () => void;
}

/**
 * What the ⋮⋮ handle of a block opens: what kind of text it is (for a text),
 * and Duplicar, Mover arriba, Mover abajo and Eliminar. The
 * moves are the keyboard's way of doing what dragging the handle does. The
 * content of a Radix `Popover` whose trigger is the handle, not portalled,
 * and it plays on `data-state`.
 */
export function EditorBlockMenu({
  block,
  canMoveUp,
  canMoveDown,
  onConvert,
  onDuplicate,
  onMove,
  onRemove,
}: EditorBlockMenuProps) {
  const convertId = useId();

  return (
    <Popover.Content
      className="editor-block-menu"
      side="bottom"
      align="start"
      sideOffset={4}
      collisionPadding={8}
      aria-label={`Opciones del bloque «${kindInfo(block.kind).label}»`}
    >
      {isTextKind(block.kind) && (
        <>
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
