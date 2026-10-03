"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { buildProseBlocks, type ProseItem } from "@/lib/chess/notation-prose";
import { nagGlyph, nagLabel, type PgnTree } from "@/lib/chess/pgn-tree";
import "./move-tree.comp.css";

/** Air left above the move once it is at the top of its panel. */
const TOP_MARGIN = 10;

/**
 * The panel the moves scroll inside. It is looked for instead of being named
 * because who provides it changes: the viewer's panel, the analysis board's
 * box, whatever mounts the tree next.
 */
function scrollerOf(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") return node;
  }
  return null;
}

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

  // The active move goes to the TOP of the panel: what is read after a move is
  // what comes after it, and kept merely "in view" the move being followed
  // crept down the panel until everything worth reading was below the fold.
  //
  // Done by hand and not with `scrollIntoView`, which scrolls EVERY scrollable
  // ancestor — including the ones with `overflow: hidden`, which can still be
  // scrolled by script — and on a page that is the whole window that meant the
  // board and the panel being pushed up out of it. Here only the panel moves.
  useEffect(() => {
    const move = activeRef.current;
    const scroller = move && scrollerOf(move);
    if (!move || !scroller) return;

    // The rects are in the page's px, with the zoom in them, while `scrollTop`
    // is read in the scroller's own: the difference has to cross over.
    const zoom = scroller.currentCSSZoom || 1;
    const distance = (move.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / zoom;
    scroller.scrollTop += distance - TOP_MARGIN;
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
        {/* The symbols are seen and the words are heard: a screen reader
            skips "!" and "?", and has no name for "⩲". */}
        {item.nags.length > 0 && (
          <>
            <span aria-hidden="true">{item.nags.map(nagGlyph).join("")}</span>
            <span className="move-tree__sr">, {item.nags.map(nagLabel).join(", ")}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="move-tree">
      {tree.initialComment && <p className="move-tree__comment">{tree.initialComment}</p>}

      {blocks.map((block) => {
        if (block.kind === "comment") {
          return (
            <p key={block.key} className="move-tree__comment">
              {block.text}
            </p>
          );
        }

        if (block.kind === "variation") {
          // The parentheses of a nested variation: no indentation, because a
          // line that is pushed further in with every level ends up read as a
          // margin note rather than as chess.
          return (
            <p key={block.key} className="move-tree__variation">
              {block.opens && <span className="move-tree__bracket">(</span>}
              {block.items.map(renderItem)}
              {block.closes ? <span className="move-tree__bracket">{")".repeat(block.closes)}</span> : null}
            </p>
          );
        }

        return (
          <p key={block.key} className="move-tree__line">
            {block.items.map(renderItem)}
          </p>
        );
      })}
    </div>
  );
}
