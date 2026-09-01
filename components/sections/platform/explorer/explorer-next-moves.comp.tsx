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
 * Qué se jugó desde esta posición y con qué frecuencia, de la más jugada a la
 * menos. Cada fila es jugable: es la forma natural de recorrer el árbol de las
 * partidas que hay en la base.
 *
 * Los porcentajes son sobre el total de continuaciones, así que suman 100.
 */
export function ExplorerNextMoves({ moves, onPlay, isSearching }: ExplorerNextMovesProps) {
  return (
    <section className="explorer-next-moves">
      <h2 className="explorer-next-moves__title">Continuaciones</h2>

      {moves.length === 0 ? (
        <p className="explorer-next-moves__empty">
          {isSearching ? "Buscando…" : "Ninguna partida siguió desde aquí."}
        </p>
      ) : (
        <ul className="explorer-next-moves__list">
          {moves.map((move) => (
            <li key={move.uci} className="explorer-next-moves__item">
              <button type="button" className="explorer-next-moves__button" onClick={() => onPlay(move.san)}>
                {/* La barra va detrás del texto, como fondo proporcional: se lee
                    la frecuencia de un vistazo sin depender del número. */}
                <span className="explorer-next-moves__bar" style={{ width: `${move.percentage}%` }} aria-hidden="true" />
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
