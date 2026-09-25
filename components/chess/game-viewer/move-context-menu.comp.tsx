"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClipboardIcon } from "@/components/icons/clipboard-icon.comp";
import { NoteIcon } from "@/components/icons/note-icon.comp";
import { TrashIcon } from "@/components/icons/trash-icon.comp";
import "./move-context-menu.comp.css";

export interface MoveContextMenuTarget {
  path: string;
  x: number;
  y: number;
  /** The move, as read in the list ("1… f5"): heads the menu. */
  label: string;
  /** false when the move is already on the game's main line. */
  canPromote: boolean;
  /** false when it is already the first among its siblings: moving it up would do nothing. */
  canPromoteOneStep: boolean;
}

interface MoveContextMenuProps {
  target: MoveContextMenuTarget;
  onPromoteToMainLine: () => void;
  onPromoteOneStep: () => void;
  onDelete: () => void;
  /**
   * The three optional ones are those that need somewhere to write: whoever
   * has nowhere to put them simply does not pass them and the menu renders without them.
   */
  onComment?: () => void;
  onAnnotate?: () => void;
  onCopyVariation?: () => void | Promise<void>;
  onClose: () => void;
  /** The host has closed it and keeps it mounted while the exit plays. */
  closing?: boolean;
}

/** What the menu shows while the copied notice lasts. */
const COPIED_MS = 900;

/** Minimum margin to the window edge when repositioning the menu. */
const EDGE_GAP = 8;

interface ItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function Item({ icon, label, onClick, disabled, danger }: ItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`move-context-menu__item${danger ? " move-context-menu__item_variant_danger" : ""}`}
    >
      <span className="move-context-menu__icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  );
}

/**
 * Right-click menu on a move.
 *
 * Kept apart from `MoveTree` and `MoveTable` so the student's viewer does
 * not carry any of this: the list only reports that there was a right
 * click, and whoever mounts it decides what can be done.
 */
export function MoveContextMenu({
  target,
  onPromoteToMainLine,
  onPromoteOneStep,
  onDelete,
  onComment,
  onAnnotate,
  onCopyVariation,
  onClose,
  closing = false,
}: MoveContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: target.x, y: target.y });

  // Repositioned AFTER measuring itself: the right click can land a hand's
  // width from the edge, and a menu that runs off the window can be neither read nor clicked.
  // `offsetWidth`/`offsetHeight` and not the bounding rect: the entry animation
  // starts scaled down, and the rect would measure that first frame.
  useLayoutEffect(() => {
    const menu = rootRef.current;
    if (!menu) return;
    const { offsetWidth: width, offsetHeight: height } = menu;
    setPosition({
      x: Math.max(EDGE_GAP, Math.min(target.x, window.innerWidth - width - EDGE_GAP)),
      y: Math.max(EDGE_GAP, Math.min(target.y, window.innerHeight - height - EDGE_GAP)),
    });
  }, [target.x, target.y]);

  // Closes on clicking outside or with Escape, which is what anyone expects
  // from a context menu.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, []);

  const handleCopy = async () => {
    await onCopyVariation?.();
    setCopied(true);
    window.setTimeout(onClose, COPIED_MS);
  };

  return (
    <div
      className={`move-context-menu${closing ? " move-context-menu_state_closing" : ""}`}
      ref={rootRef}
      role="menu"
      aria-label={`Opciones de ${target.label}`}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <p className="move-context-menu__title">{target.label}</p>

      <Item
        icon={<ArrowUpIcon className="move-context-menu__icon-svg" />}
        label="Promocionar variante"
        disabled={!target.canPromoteOneStep}
        onClick={onPromoteOneStep}
      />
      <Item
        icon={<CheckIcon className="move-context-menu__icon-svg" />}
        label="Convertir en línea principal"
        disabled={!target.canPromote}
        onClick={onPromoteToMainLine}
      />

      {onComment && (
        <Item
          icon={<NoteIcon className="move-context-menu__icon-svg" />}
          label="Comentar este movimiento"
          onClick={onComment}
        />
      )}
      {onAnnotate && (
        <Item
          icon={<span className="move-context-menu__glyph">!?</span>}
          label="Anotar con iconos"
          onClick={onAnnotate}
        />
      )}
      {onCopyVariation && (
        <Item
          icon={<ClipboardIcon className="move-context-menu__icon-svg" />}
          label={copied ? "PGN copiado" : "Copiar PGN de la variante"}
          onClick={() => void handleCopy()}
        />
      )}

      <Item
        icon={<TrashIcon className="move-context-menu__icon-svg" />}
        label="Borrar a partir de aquí"
        onClick={onDelete}
        danger
      />
    </div>
  );
}
