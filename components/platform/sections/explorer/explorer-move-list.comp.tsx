"use client";

import { useId } from "react";
import { buildNotationRows, type NotationHalfMove } from "@/lib/chess/notation";
import "./explorer-move-list.comp.css";

interface ExplorerMoveListProps {
  sans: string[];
  /** Current ply: 0 is the initial position. */
  index: number;
  onSelect: (ply: number) => void;
}

/**
 * The moves of the line being explored, at the top of the explorer's side
 * column (the new design system, 2026-10-23): a white box with the line as
 * move pills, numbered, the one on the board filled in the primary. Uses
 * `buildNotationRows`, the same row builder as the game viewer, so the
 * notation comes out in Spanish and numbered the same as in the rest of the
 * platform.
 */
export function ExplorerMoveList({ sans, index, onSelect }: ExplorerMoveListProps) {
  const rows = buildNotationRows(sans);
  const titleId = useId();

  const renderHalfMove = (halfMove: NotationHalfMove | null) => {
    if (!halfMove) return null;
    const isCurrent = halfMove.ply === index;
    return (
      <button
        type="button"
        className={`explorer-move-list__move${isCurrent ? " explorer-move-list__move_state_current" : ""}`}
        onClick={() => onSelect(halfMove.ply)}
        aria-current={isCurrent ? "true" : undefined}
      >
        {/* The glyph is a picture: its text, the piece's initial, is what a
            screen reader says ("Cf3"), and the stylesheet keeps it unpainted. */}
        {halfMove.glyph && (
          <span className={`explorer-move-list__glyph explorer-move-list__glyph_kind_${halfMove.glyph}`}>
            {halfMove.piece}
          </span>
        )}
        {halfMove.label}
      </button>
    );
  };

  return (
    <section className="explorer-move-list" aria-labelledby={titleId}>
      <h2 id={titleId} className="explorer-move-list__title">
        Jugadas
      </h2>

      <div className="explorer-move-list__box">
        {rows.length === 0 ? (
          <p className="explorer-move-list__hint">
            Mueve una pieza en el tablero para empezar a explorar. La búsqueda es por posición: también encuentra las
            partidas que llegaron por otro orden de jugadas.
          </p>
        ) : (
          <ol className="explorer-move-list__moves">
            {rows.map((row) => (
              // A move whole, its number and both halves, so a line never
              // breaks between them.
              <li key={row.number} className="explorer-move-list__row">
                <span className="explorer-move-list__number">{row.number}</span>
                {renderHalfMove(row.white)}
                {renderHalfMove(row.black)}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
