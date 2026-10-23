"use client";

import { type CSSProperties, type MouseEvent, type RefObject, useEffect, useMemo, useRef } from "react";
import { buildNotationBlocks } from "@/lib/chess/notation-blocks";
import { formatEvaluation } from "@/lib/chess/engine-protocol";
import { sanToSpanish } from "@/lib/chess/notation";
import { nagGlyph, nagLabel, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import { scrollerOf, scrollToMiddle } from "@/components/chess/scroll-within";
import "./move-table.comp.css";

interface MoveTableProps {
  tree: PgnTree;
  /** Dotted path of the active node ("" = initial position). */
  currentPath: string;
  onSelect: (path: string) => void;
  /** Right click on a move: opens its menu where it can be edited. */
  onContextMenu?: (path: string, event: MouseEvent) => void;
  /**
   * The game owner's note for everyone who opens it, heading the notation
   * before the first move — and before the PGN's own opening comment, since it
   * is about the game in this study, not something the game says.
   */
  pinnedComment?: string;
  /** Moves painted in the selection's blue: the line being played against the module. */
  highlightedPaths?: ReadonlySet<string>;
  /**
   * `material`: the new design system's notation (2026-10-23, a study's
   * game): the numbers on the container's grey, the move on the board a pill
   * of the primary, the comments and variations on the panel's tints.
   */
  look?: "material";
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
export function MoveTable({
  tree,
  currentPath,
  onSelect,
  onContextMenu,
  pinnedComment,
  highlightedPaths,
  look,
}: MoveTableProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => buildNotationBlocks(tree), [tree]);

  // The active move is kept at the middle of the list, as Lichess keeps it:
  // going through a game, the moves just played and the ones to come are both
  // in sight, instead of the move riding the bottom edge. Only the list's own
  // scroller moves, never the page. Back at the starting position, which has
  // no move to centre, the list goes back to its top.
  useEffect(() => {
    if (activeRef.current) {
      scrollToMiddle(activeRef.current);
      return;
    }
    const scroller = rootRef.current && scrollerOf(rootRef.current);
    if (scroller) scroller.scrollTop = 0;
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
        className={`move-table__cell move-table__cell_side_${side} move-table__move${node.path === currentPath ? " move-table__move_state_active" : ""}${highlightedPaths?.has(node.path) ? " move-table__move_line_played" : ""}`}
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
    <div className={`move-table${look === "material" ? " move-table_look_material" : ""}`} ref={rootRef}>
      {pinnedComment && <p className="move-table__comment move-table__comment_kind_pinned">{pinnedComment}</p>}
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
                    className={`move-table__inline${item.node.path === currentPath ? " move-table__inline_state_active" : ""}${highlightedPaths?.has(item.node.path) ? " move-table__inline_line_played" : ""}`}
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
