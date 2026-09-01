"use client";

import { buildNotationRows, type NotationHalfMove } from "@/lib/chess/notation";
import "./explorer-move-list.comp.css";

interface ExplorerMoveListProps {
  sans: string[];
  /** Ply actual: 0 es la posición inicial. */
  index: number;
  onSelect: (ply: number) => void;
}

/**
 * Las jugadas de la línea que se está explorando. Usa `buildNotationRows`, el
 * mismo constructor de filas que el visor de partidas, así que la notación sale
 * en español y numerada igual que en el resto de la plataforma.
 */
export function ExplorerMoveList({ sans, index, onSelect }: ExplorerMoveListProps) {
  const rows = buildNotationRows(sans);

  const renderHalfMove = (halfMove: NotationHalfMove | null) => {
    if (!halfMove) return <span className="explorer-move-list__empty" />;
    const isCurrent = halfMove.ply === index;
    return (
      <button
        type="button"
        className={`explorer-move-list__move${isCurrent ? " explorer-move-list__move_current" : ""}`}
        onClick={() => onSelect(halfMove.ply)}
        aria-current={isCurrent ? "true" : undefined}
      >
        {halfMove.glyph && (
          <span
            className={`explorer-move-list__glyph explorer-move-list__glyph_kind_${halfMove.glyph}`}
            aria-hidden="true"
          />
        )}
        {halfMove.label}
      </button>
    );
  };

  return (
    <section className="explorer-move-list">
      <h2 className="explorer-move-list__title">Jugadas</h2>

      {rows.length === 0 ? (
        <p className="explorer-move-list__hint">
          Mueve una pieza en el tablero para empezar a explorar.
        </p>
      ) : (
        <ol className="explorer-move-list__rows">
          {rows.map((row) => (
            <li key={row.number} className="explorer-move-list__row">
              <span className="explorer-move-list__number">{row.number}</span>
              {renderHalfMove(row.white)}
              {renderHalfMove(row.black)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
