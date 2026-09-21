"use client";

import { type MouseEvent, type ReactNode, type RefObject, useEffect, useRef } from "react";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import "./move-tree.comp.css";

interface MoveTreeProps {
  tree: PgnTree;
  /** Dotted path of the active node ("" = initial position). */
  currentPath: string;
  onSelect: (path: string) => void;
  /**
   * Right click on a move. Optional on purpose: whoever only reads the game
   * does not pass it and the list behaves exactly as before; whoever can edit
   * it uses it to open the move's menu.
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
    if (!main) break;
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

  // The active move, in view. `nearest` scrolls the minimum and only the
  // scrolling container, so it does not yank the whole page.
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
