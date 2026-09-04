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
  /** La jugada, como se lee en la lista («1… f5»): encabeza el menú. */
  label: string;
  /** false cuando la jugada ya está en la línea principal de la partida. */
  canPromote: boolean;
  /** false cuando ya es la primera entre sus hermanas: subirla no haría nada. */
  canPromoteOneStep: boolean;
}

interface MoveContextMenuProps {
  target: MoveContextMenuTarget;
  onPromoteToMainLine: () => void;
  onPromoteOneStep: () => void;
  onDelete: () => void;
  /**
   * Las tres opcionales son las que necesitan sitio donde escribir: quien no
   * tenga dónde ponerlas simplemente no las pasa y el menú se pinta sin ellas.
   */
  onComment?: () => void;
  onAnnotate?: () => void;
  onCopyVariation?: () => void | Promise<void>;
  onClose: () => void;
}

/** Lo que se ve en el menú mientras dura el aviso de copiado. */
const COPIED_MS = 900;

/** Margen mínimo al borde de la ventana al recolocar el menú. */
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
 * Menú del clic derecho sobre una jugada.
 *
 * Va aparte del `MoveTree` y del `MoveTable` para que el visor del alumno no
 * cargue con nada de esto: la lista sólo avisa de que hubo clic derecho, y
 * quien decide qué se puede hacer es quien la monta.
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
}: MoveContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: target.x, y: target.y });

  // Se recoloca DESPUÉS de medirse: el clic derecho puede caer a un palmo del
  // borde y un menú que se sale de la ventana no se puede ni leer ni pulsar.
  useLayoutEffect(() => {
    const menu = rootRef.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      x: Math.max(EDGE_GAP, Math.min(target.x, window.innerWidth - width - EDGE_GAP)),
      y: Math.max(EDGE_GAP, Math.min(target.y, window.innerHeight - height - EDGE_GAP)),
    });
  }, [target.x, target.y]);

  // Se cierra al pulsar fuera o con Escape, que es lo que espera cualquiera de
  // un menú contextual.
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
      className="move-context-menu"
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
