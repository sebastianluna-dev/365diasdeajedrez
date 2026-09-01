"use client";

import { useEffect, useRef } from "react";
import "./move-context-menu.comp.css";

export interface MoveContextMenuTarget {
  path: string;
  x: number;
  y: number;
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
  onClose: () => void;
}

/**
 * Menú del clic derecho sobre una jugada.
 *
 * Va aparte del `MoveTree` para que el visor del alumno no cargue con nada de
 * esto: el árbol sólo avisa de que hubo clic derecho, y quien decide qué se
 * puede hacer es el editor.
 */
export function MoveContextMenu({
  target,
  onPromoteToMainLine,
  onPromoteOneStep,
  onDelete,
  onClose,
}: MoveContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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
    rootRef.current?.querySelector("button")?.focus();
  }, []);

  return (
    <div
      className="move-context-menu"
      ref={rootRef}
      role="menu"
      style={{ top: `${target.y}px`, left: `${target.x}px` }}
    >
      <button
        type="button"
        role="menuitem"
        className="move-context-menu__item"
        disabled={!target.canPromote}
        onClick={onPromoteToMainLine}
      >
        Convertir en línea principal
      </button>
      <button
        type="button"
        role="menuitem"
        className="move-context-menu__item"
        disabled={!target.canPromoteOneStep}
        onClick={onPromoteOneStep}
      >
        Subir una posición
      </button>
      <button
        type="button"
        role="menuitem"
        className="move-context-menu__item move-context-menu__item_variant_danger"
        onClick={onDelete}
      >
        Borrar desde aquí
      </button>
    </div>
  );
}
