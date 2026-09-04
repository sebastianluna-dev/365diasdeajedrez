"use client";

import { type CSSProperties, type MouseEvent, type RefObject, useEffect, useMemo, useRef } from "react";
import { buildNotationBlocks } from "@/lib/chess/notation-blocks";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import "./move-table.comp.css";

interface MoveTableProps {
  tree: PgnTree;
  /** Ruta punteada del nodo activo ("" = posición inicial). */
  currentPath: string;
  onSelect: (path: string) => void;
  /** Clic derecho sobre una jugada: abre su menú donde se puede editar. */
  onContextMenu?: (path: string, event: MouseEvent) => void;
}

const moveNumberOf = (node: PgnTreeNode) => Math.ceil(node.ply / 2);
const isWhite = (node: PgnTreeNode) => node.ply % 2 === 1;

/**
 * Notación en tabla, al estilo Lichess: la línea principal en pares
 * blancas/negras y todo lo demás a lo ancho.
 *
 * El ORDEN de los bloques lo decide `lib/chess/notation-blocks`, que es puro y
 * está probado contra una partida real con variantes de tres niveles. Aquí sólo
 * se pintan.
 */
export function MoveTable({ tree, currentPath, onSelect, onContextMenu }: MoveTableProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const blocks = useMemo(() => buildNotationBlocks(tree), [tree]);

  // La jugada activa, a la vista. `nearest` desplaza lo mínimo y sólo el
  // contenedor con scroll, así que no da tirones a la página entera.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentPath]);

  const bind = (node: PgnTreeNode) => ({
    ref: node.path === currentPath ? (activeRef as RefObject<HTMLButtonElement>) : undefined,
    onClick: () => onSelect(node.path),
    onContextMenu: onContextMenu
      ? (event: MouseEvent) => {
          event.preventDefault();
          onContextMenu(node.path, event);
        }
      : undefined,
  });

  const cell = (node: PgnTreeNode | undefined, side: "white" | "black", ellipsis: boolean) => {
    if (ellipsis) {
      return <span className={`move-table__cell move-table__cell_side_${side} move-table__ellipsis`}>…</span>;
    }
    if (!node) return <span className={`move-table__cell move-table__cell_side_${side}`} />;

    return (
      <button
        type="button"
        {...bind(node)}
        className={`move-table__cell move-table__cell_side_${side} move-table__move${node.path === currentPath ? " move-table__move_state_active" : ""}`}
      >
        {sanToSpanish(node.san)}
        {node.nags.length > 0 && <span className="move-table__nag">{node.nags.map(nagGlyph).join("")}</span>}
      </button>
    );
  };

  return (
    <div className="move-table">
      {tree.initialComment && <p className="move-table__comment">{tree.initialComment}</p>}

      {blocks.map((block) => {
        if (block.kind === "comment") {
          return (
            <p key={block.key} className="move-table__comment">
              {block.text}
            </p>
          );
        }

        if (block.kind === "line") {
          return (
            <p
              key={block.key}
              className="move-table__line"
              style={{ "--move-table-depth": block.depth } as CSSProperties}
            >
              {block.items.map((item, index) =>
                item.type === "comment" ? (
                  <span key={`c-${index}`} className="move-table__inline-comment">
                    {item.text}
                  </span>
                ) : (
                  <button
                    key={item.node.path}
                    type="button"
                    {...bind(item.node)}
                    className={`move-table__inline${item.node.path === currentPath ? " move-table__inline_state_active" : ""}`}
                  >
                    {isWhite(item.node)
                      ? `${moveNumberOf(item.node)}.`
                      : item.withNumber
                        ? `${moveNumberOf(item.node)}…`
                        : ""}
                    {sanToSpanish(item.node.san)}
                    {item.node.nags.map(nagGlyph).join("")}
                  </button>
                ),
              )}
            </p>
          );
        }

        return (
          <div key={block.key} className="move-table__row">
            <span className="move-table__number">{block.number}</span>
            {cell(block.white, "white", block.continuation)}
            {cell(block.black, "black", block.pushedBlack)}
          </div>
        );
      })}
    </div>
  );
}
