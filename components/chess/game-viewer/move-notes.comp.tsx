"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useLingering } from "./use-lingering.hook";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { sanToSpanish } from "@/lib/chess/notation";
import { alternativesAt, mainLineAnchor, mainLineOf } from "@/lib/chess/notation-line";
import { buildVariationBlocks, moveLabel, type ProseItem } from "@/lib/chess/notation-prose";
import { nagGlyph, nagLabel, nodeAtPath, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import "./move-notes.comp.css";

interface MoveNotesProps {
  tree: PgnTree;
  /** Dotted path of the move on the board ("" = initial position). */
  currentPath: string;
  onSelect: (path: string) => void;
  /** The game owner's note, said before the first move with the PGN's own opening comment. */
  pinnedComment?: string;
}

/**
 * A lesson read one move at a time (the viewer's `moveList="notes"`, the new
 * design system, 2026-10-22): the MAIN line as a row of pills that never
 * changes — the moves played, the one on the board in the primary, the ones
 * to come dimmed —, and under it a note with what the author says about that
 * move and each variation offered there, whole: its moves as pills and its
 * comments. A move of a variation on the board (2026-10-23) leaves the main
 * line lit on the move the variation branches from (`mainLineAnchor`) and is
 * lit itself in that move's note. The way on is the board's: its keys and
 * the arrow keys.
 */
export function MoveNotes({ tree, currentPath, onSelect, pinnedComment }: MoveNotesProps) {
  const anchor = mainLineAnchor(currentPath);
  const mainLine = useMemo(() => mainLineOf(tree), [tree]);
  const anchorIndex = mainLine.findIndex((node) => node.path === anchor);

  const noteRef = useRef<HTMLElement>(null);
  // The note's height as it was last settled, to grow or shrink from.
  const settledHeight = useRef<number | null>(null);

  // From one move with a note to another the card stays and only changes
  // size: its height is pinned at what it was, then let go to what the new
  // text needs, and the CSS transition carries it there; the text inside
  // fades in on its own (keyed by the move). Done by hand because `height:
  // auto` is not animatable everywhere yet.
  useLayoutEffect(() => {
    const note = noteRef.current;
    if (!note) {
      settledHeight.current = null;
      return;
    }
    // Mid-transition the pinned px is where the card is now; settled, it is
    // the height last measured.
    const moving = note.style.height.endsWith("px");
    const from = moving ? note.getBoundingClientRect().height : settledHeight.current;
    note.style.height = "auto";
    const to = note.getBoundingClientRect().height;
    settledHeight.current = to;
    if (from === null || Math.abs(from - to) < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    note.style.height = `${from}px`;
    void note.offsetHeight; // the pinned height is laid out before it moves
    note.style.height = `${to}px`;
    const settle = (event: TransitionEvent) => {
      if (event.target !== note || event.propertyName !== "height") return;
      note.style.height = "auto";
      note.removeEventListener("transitionend", settle);
    };
    note.addEventListener("transitionend", settle);
    return () => note.removeEventListener("transitionend", settle);
  }, [anchor]);

  // What the note says about the main line's move, or null when it says
  // nothing: its comment and every variation offered there, whole. Memoised
  // by that move: `useLingering` keeps the last one on screen while the card
  // leaves, and tells one note from the next by identity.
  const note = useMemo(() => {
    const node = nodeAtPath(tree, anchor);
    const comment = node
      ? node.comment
      : [pinnedComment, tree.initialComment].filter(Boolean).join("\n\n") || undefined;
    const variations = alternativesAt(tree, anchor).map((start) => ({
      key: start.path,
      blocks: buildVariationBlocks(start),
    }));
    if (!comment && variations.length === 0) return null;
    return { path: anchor, heading: node ? moveLabel(node, true) : "Para empezar", comment, variations };
  }, [tree, anchor, pinnedComment]);
  const shownNote = useLingering(note);

  // A move as a pill: its label and its NAGs, seen as symbols and heard as words.
  const pill = (path: string, label: string, nags: number[], state: "played" | "current" | "later") => (
    <button
      type="button"
      onClick={() => onSelect(path)}
      aria-current={state === "current" ? "step" : undefined}
      className={`move-notes__move move-notes__move_state_${state}`}
    >
      {label}
      {nags.length > 0 && (
        <>
          <span aria-hidden="true">{nags.map(nagGlyph).join("")}</span>
          <span className="move-notes__sr">, {nags.map(nagLabel).join(", ")}</span>
        </>
      )}
    </button>
  );

  // A variation's move or comment, as its paragraph prints it.
  const variationItem = (item: ProseItem) =>
    item.kind === "move" ? (
      <span key={item.key} className="move-notes__step">
        {pill(item.path, item.label, item.nags, item.path === currentPath ? "current" : "later")}
      </span>
    ) : (
      <span key={item.key} className="move-notes__aside">
        {item.text}
      </span>
    );

  return (
    <div className="move-notes">
      <p className="move-notes__line" aria-label="Jugadas">
        {mainLine.map((node: PgnTreeNode, index) => {
          const isWhite = node.ply % 2 === 1;
          const moveNumber = Math.ceil(node.ply / 2);
          const state = index < anchorIndex ? "played" : index === anchorIndex ? "current" : "later";
          return (
            <span key={node.path} className="move-notes__step">
              {(isWhite || index === 0) && (
                <span className="move-notes__number">{isWhite ? `${moveNumber}.` : `${moveNumber}...`}</span>
              )}
              {pill(node.path, sanToSpanish(node.san), node.nags, state)}
            </span>
          );
        })}
      </p>

      {shownNote.value && (
        // On a move with nothing said the last note stays a moment, leaving
        // (`_state_closing`), and then goes.
        <section
          ref={noteRef}
          className={`move-notes__note${shownNote.closing ? " move-notes__note_state_closing" : ""}`}
          aria-label="La jugada"
        >
          {/* Keyed by the main line's move: the card stays, its text fades to the new one. */}
          <div key={shownNote.value.path} className="move-notes__note-body">
            <p className="move-notes__note-head">
              <BookOpenIcon className="move-notes__note-icon" />
              {shownNote.value.heading}
            </p>
            {shownNote.value.comment && <p className="move-notes__comment">{shownNote.value.comment}</p>}
            {shownNote.value.variations.length > 0 && (
              <div className="move-notes__others">
                <p className="move-notes__others-label">
                  {shownNote.value.variations.length === 1 ? "Otra línea" : "Otras líneas"}
                </p>
                {shownNote.value.variations.map((variation) => (
                  <div key={variation.key} className="move-notes__variation">
                    {variation.blocks.map((block) =>
                      block.kind === "comment" ? null : (
                        <p key={block.key} className="move-notes__variation-line">
                          {block.kind === "variation" && block.opens && <span className="move-notes__bracket">(</span>}
                          {block.items.map(variationItem)}
                          {block.kind === "variation" && block.closes ? (
                            <span className="move-notes__bracket">{")".repeat(block.closes)}</span>
                          ) : null}
                        </p>
                      ),
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
