"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { buildProseBlocks, type ProseItem } from "@/lib/chess/notation-prose";
import type { PgnTree } from "@/lib/chess/pgn-tree";
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

export function MoveTree({ tree, currentPath, onSelect, onContextMenu }: MoveTreeProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // The active move, in view. `nearest` scrolls the minimum and only the
  // scrolling container, so it does not yank the whole page.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentPath]);

  // Where the line is cut is decided by `notation-prose`, which knows nothing
  // of React: here only the drawing is left.
  const blocks = buildProseBlocks(tree.children);

  const renderItem = (item: ProseItem): ReactNode => {
    if (item.kind === "aside") {
      return (
        <span key={item.key} className="move-tree__aside">
          {item.text}
        </span>
      );
    }

    if (item.kind === "variation") {
      return (
        <span key={item.key} className="move-tree__variation">
          ({item.items.map(renderItem)})
        </span>
      );
    }

    const isActive = item.path === currentPath;
    return (
      <button
        key={item.key}
        type="button"
        ref={isActive ? activeRef : undefined}
        onClick={() => onSelect(item.path)}
        onContextMenu={
          onContextMenu
            ? (event) => {
                event.preventDefault();
                onContextMenu(item.path, event);
              }
            : undefined
        }
        className={`move-tree__move${isActive ? " move-tree__move_active" : ""}`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <div className="move-tree">
      {tree.initialComment && <p className="move-tree__comment">{tree.initialComment}</p>}

      {blocks.map((block) =>
        block.kind === "comment" ? (
          <p key={block.key} className="move-tree__comment">
            {block.text}
          </p>
        ) : (
          <p key={block.key} className="move-tree__line">
            {block.items.map(renderItem)}
          </p>
        ),
      )}
    </div>
  );
}
