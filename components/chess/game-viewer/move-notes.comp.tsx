"use client";

import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { sanToSpanish } from "@/lib/chess/notation";
import { alternativesAt, lineThrough } from "@/lib/chess/notation-line";
import { moveLabel } from "@/lib/chess/notation-prose";
import { nagGlyph, nagLabel, nodeAtPath, type PgnTree, type PgnTreeNode } from "@/lib/chess/pgn-tree";
import { mdButton } from "@/lib/material/material-classes";
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
 * design system, 2026-10-22): the line being followed as a row of pills —
 * the moves played, the one on the board in the primary, the ones to come
 * dimmed —, under it a note with what the author says about the move on the
 * board and the other moves offered at that point, and the way to the next
 * move. A variation is entered from the move it branches at, and from then on
 * it is the line (`lineThrough`).
 */
export function MoveNotes({ tree, currentPath, onSelect, pinnedComment }: MoveNotesProps) {
  const line = lineThrough(tree, currentPath);
  const currentIndex = line.findIndex((node) => node.path === currentPath);
  const current = nodeAtPath(tree, currentPath);
  const next = line[currentIndex + 1];
  const alternatives = alternativesAt(tree, currentPath);
  const comment = current
    ? current.comment
    : [pinnedComment, tree.initialComment].filter(Boolean).join("\n\n") || undefined;

  // A move as a pill; an alternative carries its number, since it stands alone.
  const chip = (node: PgnTreeNode, state: "played" | "current" | "later", numbered = false) => (
    <button
      type="button"
      onClick={() => onSelect(node.path)}
      aria-current={state === "current" ? "step" : undefined}
      className={`move-notes__move move-notes__move_state_${state}`}
    >
      {numbered ? moveLabel(node, true) : sanToSpanish(node.san)}
      {/* The symbols are seen and the words are heard. */}
      {node.nags.length > 0 && (
        <>
          <span aria-hidden="true">{node.nags.map(nagGlyph).join("")}</span>
          <span className="move-notes__sr">, {node.nags.map(nagLabel).join(", ")}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="move-notes">
      <p className="move-notes__line" aria-label="Jugadas">
        {line.map((node, index) => {
          const isWhite = node.ply % 2 === 1;
          const moveNumber = Math.ceil(node.ply / 2);
          const state = index < currentIndex ? "played" : index === currentIndex ? "current" : "later";
          return (
            <span key={node.path} className="move-notes__step">
              {(isWhite || index === 0) && (
                <span className="move-notes__number">{isWhite ? `${moveNumber}.` : `${moveNumber}...`}</span>
              )}
              {chip(node, state)}
            </span>
          );
        })}
      </p>

      {(comment || alternatives.length > 0) && (
        <section className="move-notes__note" aria-label="La jugada">
          <p className="move-notes__note-head">
            <BookOpenIcon className="move-notes__note-icon" />
            {current ? moveLabel(current, true) : "Para empezar"}
          </p>
          {comment && <p className="move-notes__comment">{comment}</p>}
          {alternatives.length > 0 && (
            <p className="move-notes__others">
              <span className="move-notes__others-label">Otras jugadas:</span>
              {alternatives.map((node) => (
                <span key={node.path} className="move-notes__step">
                  {chip(node, "later", true)}
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {next && (
        <p className="move-notes__onwards">
          <button type="button" onClick={() => onSelect(next.path)} className={mdButton("filled", "sm")}>
            <PlayIcon variant="classic-solid" className="platform-md-icon" />
            Siguiente: {moveLabel(next, true)}
          </button>
          <span className="move-notes__hint">o la flecha →</span>
        </p>
      )}
    </div>
  );
}
