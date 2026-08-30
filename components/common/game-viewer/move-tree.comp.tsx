import type { ReactNode } from "react";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import "./move-tree.comp.css";

interface MoveTreeProps {
  tree: PgnTree;
  /** Ruta punteada del nodo activo ("" = posición inicial). */
  currentPath: string;
  onSelect: (path: string) => void;
}

function moveLabel(node: PgnTreeNode, needsNumber: boolean): string {
  const isWhiteMove = node.ply % 2 === 1;
  const moveNumber = Math.ceil(node.ply / 2);
  const prefix = isWhiteMove ? `${moveNumber}. ` : needsNumber ? `${moveNumber}... ` : "";
  return `${prefix}${sanToSpanish(node.san)}${node.nags.map(nagGlyph).join("")}`;
}

function renderLine(
  nodes: PgnTreeNode[],
  currentPath: string,
  onSelect: (path: string) => void,
  lineStart: boolean,
): ReactNode[] {
  const out: ReactNode[] = [];
  let current = nodes;
  let needsNumber = lineStart;

  while (current.length > 0) {
    const [main, ...variations] = current;

    out.push(
      <button
        key={main.path}
        type="button"
        onClick={() => onSelect(main.path)}
        className={`move-tree__move${main.path === currentPath ? " move-tree__move_active" : ""}`}
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
          ({renderLine([variation], currentPath, onSelect, true)})
        </span>,
      );
    }

    needsNumber = Boolean(main.comment) || variations.length > 0;
    current = main.children;
  }

  return out;
}

export function MoveTree({ tree, currentPath, onSelect }: MoveTreeProps) {
  return (
    <div className="move-tree">
      {tree.initialComment && <span className="move-tree__comment">{tree.initialComment}</span>}
      {renderLine(tree.children, currentPath, onSelect, true)}
    </div>
  );
}
