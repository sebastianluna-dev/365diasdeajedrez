"use client";

import { sanToSpanish } from "@/lib/chess/notation";
import type { ExplorerNextMove } from "@/services/game-explorer/game-explorer.types";
import "./explorer-next-moves.comp.css";

interface ExplorerNextMovesProps {
  moves: ExplorerNextMove[];
  onPlay: (san: string) => void;
  isSearching: boolean;
}

/**
 * What was played from this position and how often, from most played to
 * least. Each row is playable: it is the natural way to walk the tree of the
 * games in the database.
 *
 * The percentages are over the total of continuations, so they add up to 100.
 */
export function ExplorerNextMoves({ moves, onPlay, isSearching }: ExplorerNextMovesProps) {
  return (
    <section className="explorer-next-moves">
      <h2 className="explorer-next-moves__title">Continuaciones</h2>

      {moves.length === 0 ? (
        <p className="explorer-next-moves__empty">{isSearching ? "Buscando…" : "Ninguna partida siguió desde aquí."}</p>
      ) : (
        <ul className="explorer-next-moves__list">
          {moves.map((move) => (
            <li key={move.uci} className="explorer-next-moves__item">
              <button type="button" className="explorer-next-moves__button" onClick={() => onPlay(move.san)}>
                {/* The bar goes behind the text, as a proportional background: the
                    frequency is read at a glance without depending on the number. */}
                <span
                  className="explorer-next-moves__bar"
                  style={{ width: `${move.percentage}%` }}
                  aria-hidden="true"
                />
                <span className="explorer-next-moves__san">{sanToSpanish(move.san)}</span>
                <span className="explorer-next-moves__count">
                  {move.count} {move.count === 1 ? "partida" : "partidas"}
                </span>
                <span className="explorer-next-moves__percentage">{move.percentage}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
