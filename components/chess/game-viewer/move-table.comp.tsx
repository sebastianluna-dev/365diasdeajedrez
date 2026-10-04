"use client";

import { type CSSProperties, type MouseEvent, type RefObject, useEffect, useMemo, useRef } from "react";
import { buildNotationBlocks } from "@/lib/chess/notation-blocks";
import { formatEvaluation } from "@/lib/chess/engine-protocol";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, nagLabel, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import { scrollWithin } from "@/components/chess/scroll-within";
import "./move-table.comp.css";

interface MoveTableProps {
  tree: PgnTree;
  /** Dotted path of the active node ("" = initial position). */
  currentPath: string;
  onSelect: (path: string) => void;
  /** Right click on a move: opens its menu where it can be edited. */
  onContextMenu?: (path: string, event: MouseEvent) => void;
}

const moveNumberOf = (node: PgnTreeNode) => Math.ceil(node.ply / 2);
const isWhite = (node: PgnTreeNode) => node.ply % 2 === 1;

/**
 * A move's NAGs in words, for the screen reader: their symbols are hidden
 * from it, since it skips "!" and "?" and has no name for "⩲".
 */
const nagsSaid = (node: PgnTreeNode) =>
  node.nags.length > 0 && <span className="move-table__sr">, {node.nags.map(nagLabel).join(", ")}</span>;

/**
 * Tabular notation, Lichess style: the main line in white/black pairs and
 * everything else full width.
 *
 * The ORDER of the blocks is decided by `lib/chess/notation-blocks`, which is
 * pure and tested against a real game with three levels of variations. Here
 * they are only rendered.
 */
export function MoveTable({ tree, currentPath, onSelect, onContextMenu }: MoveTableProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const blocks = useMemo(() => buildNotationBlocks(tree), [tree]);

  // The active move, in view: by the least it takes, and only in the list's
  // own scroller, so neither the page nor anything around it is moved.
  useEffect(() => {
    if (activeRef.current) scrollWithin(activeRef.current);
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
        {node.nags.length > 0 && (
          <span className="move-table__nag" aria-hidden="true">
            {node.nags.map(nagGlyph).join("")}
          </span>
        )}
        {nagsSaid(node)}
        {/* The evaluation of the position the move leaves, if the game has
            already been analysed. It comes from the PGN's `[%eval]`, so it shows
            up by itself when the game is reopened and there is no need to analyse again. */}
        {node.evaluation && <span className="move-table__eval">{formatEvaluation(node.evaluation)}</span>}
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
                    {item.node.nags.length > 0 && (
                      <span aria-hidden="true">{item.node.nags.map(nagGlyph).join("")}</span>
                    )}
                    {nagsSaid(item.node)}
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
