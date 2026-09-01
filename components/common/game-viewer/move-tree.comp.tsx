"use client";

import { type MouseEvent, type ReactNode, type RefObject, useEffect, useRef } from "react";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import "./move-tree.comp.css";

interface MoveTreeProps {
  tree: PgnTree;
  /** Ruta punteada del nodo activo ("" = posición inicial). */
  currentPath: string;
  onSelect: (path: string) => void;
  /**
   * Clic derecho sobre una jugada. Opcional a propósito: el visor del alumno no
   * la pasa y se comporta exactamente como antes; sólo el editor la usa, para
   * abrir su menú de promover y borrar.
   */
  onContextMenu?: (path: string, event: MouseEvent) => void;
}

function moveLabel(node: PgnTreeNode, needsNumber: boolean): string {
  const isWhiteMove = node.ply % 2 === 1;
  const moveNumber = Math.ceil(node.ply / 2);
  const prefix = isWhiteMove ? `${moveNumber}. ` : needsNumber ? `${moveNumber}... ` : "";
  return `${prefix}${sanToSpanish(node.san)}${node.nags.map(nagGlyph).join("")}`;
}

interface RenderContext {
  currentPath: string;
  onSelect: (path: string) => void;
  onContextMenu?: (path: string, event: MouseEvent) => void;
  activeRef: RefObject<HTMLButtonElement | null>;
}

function renderLine(nodes: PgnTreeNode[], context: RenderContext, lineStart: boolean): ReactNode[] {
  const out: ReactNode[] = [];
  let current = nodes;
  let needsNumber = lineStart;

  while (current.length > 0) {
    const [main, ...variations] = current;
    const isActive = main.path === context.currentPath;

    out.push(
      <button
        key={main.path}
        type="button"
        ref={isActive ? context.activeRef : undefined}
        onClick={() => context.onSelect(main.path)}
        onContextMenu={
          context.onContextMenu
            ? (event) => {
                event.preventDefault();
                context.onContextMenu?.(main.path, event);
              }
            : undefined
        }
        className={`move-tree__move${isActive ? " move-tree__move_active" : ""}`}
      >
        {moveLabel(main, needsNumber)}
      </button>,
    );

    if (main.comment) {
      out.push(
        <span key={`${main.path}-comment`} className="move-tree__comment">
          {main.comment}
        </span>,
      );
    }

    for (const variation of variations) {
      out.push(
        <span key={`${variation.path}-variation`} className="move-tree__variation">
          ({renderLine([variation], context, true)})
        </span>,
      );
    }

    needsNumber = Boolean(main.comment) || variations.length > 0;
    current = main.children;
  }

  return out;
}

export function MoveTree({ tree, currentPath, onSelect, onContextMenu }: MoveTreeProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // La jugada activa, a la vista. `nearest` desplaza lo mínimo y sólo el
  // contenedor con scroll, así que no da tirones a la página entera.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentPath]);

  return (
    <div className="move-tree">
      {tree.initialComment && <span className="move-tree__comment">{tree.initialComment}</span>}
      {renderLine(tree.children, { currentPath, onSelect, onContextMenu, activeRef }, true)}
    </div>
  );
}
