"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { replayGame } from "@/lib/chess/replay";
import { searchPosition } from "@/services/game-explorer/game-explorer.actions";
import type { PositionSearchResult } from "@/services/game-explorer/game-explorer.types";
import { ExplorerGames } from "./explorer-games.comp";
import { ExplorerMoveList } from "./explorer-move-list.comp";
import { ExplorerNextMoves } from "./explorer-next-moves.comp";
import "./game-explorer.comp.css";

/**
 * Explorador de partidas por posición.
 *
 * La línea vive como una lista de SAN y las posiciones se derivan con
 * `replayGame`, el mismo reproductor que usa el resto de la plataforma: así el
 * tablero, el índice de posiciones y este panel no pueden discrepar.
 *
 * La búsqueda se dispara con la posición ya cambiada, nunca durante el arrastre
 * de una pieza: `ChessBoard` sólo avisa cuando la jugada es legal y está hecha.
 */
export function GameExplorer() {
  const [sans, setSans] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<PositionSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Caché por FEN: ir y volver por la línea es el gesto más común del
  // explorador y no debe costar una consulta cada vez. Vive en el componente
  // porque el proyecto no tiene librería de datos en cliente y una sola
  // pantalla no justifica añadir una.
  const cacheRef = useRef(new Map<string, PositionSearchResult>());

  const positions = useMemo(() => replayGame(sans.join(" ")), [sans]);
  const current = positions[Math.min(index, positions.length - 1)];

  useEffect(() => {
    const fen = current.fen;
    const cached = cacheRef.current.get(fen);
    if (cached) {
      setResult(cached);
      setIsSearching(false);
      setHasError(false);
      return;
    }

    // `cancelled` descarta la respuesta de una posición que ya no es la actual:
    // quien navega rápido no puede acabar viendo los datos de otra jugada.
    let cancelled = false;
    setIsSearching(true);
    setHasError(false);

    searchPosition(fen)
      .then((next) => {
        cacheRef.current.set(fen, next);
        if (cancelled) return;
        setResult(next);
        setIsSearching(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHasError(true);
        setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [current.fen]);

  /** Jugar desde una posición anterior abandona la continuación que había. */
  const playMove = useCallback(
    (san: string) => {
      setSans((previous) => [...previous.slice(0, index), san]);
      setIndex((previous) => previous + 1);
    },
    [index],
  );

  const goToStart = useCallback(() => setIndex(0), []);
  const goToPrevious = useCallback(() => setIndex((previous) => Math.max(0, previous - 1)), []);
  const goToNext = useCallback(() => setIndex((previous) => Math.min(sans.length, previous + 1)), [sans.length]);
  const goToEnd = useCallback(() => setIndex(sans.length), [sans.length]);

  const reset = useCallback(() => {
    setSans([]);
    setIndex(0);
  }, []);

  return (
    <div className="game-explorer">
      <div className="game-explorer__board">
        <ChessBoard
          position={{ fen: current.fen, lastMove: current.lastMove, check: current.check }}
          flipBoard={flipped}
          interactive
          onMove={playMove}
        />

        <div className="game-explorer__controls">
          <button
            type="button"
            className="game-explorer__control"
            onClick={goToStart}
            disabled={index === 0}
            aria-label="Ir a la posición inicial"
          >
            ⏮
          </button>
          <button
            type="button"
            className="game-explorer__control"
            onClick={goToPrevious}
            disabled={index === 0}
            aria-label="Jugada anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="game-explorer__control"
            onClick={goToNext}
            disabled={index === sans.length}
            aria-label="Jugada siguiente"
          >
            ›
          </button>
          <button
            type="button"
            className="game-explorer__control"
            onClick={goToEnd}
            disabled={index === sans.length}
            aria-label="Ir al final de la línea"
          >
            ⏭
          </button>
          <button
            type="button"
            className="game-explorer__control"
            onClick={() => setFlipped((previous) => !previous)}
            aria-label="Girar el tablero"
          >
            <FlipIcon />
          </button>
          <button
            type="button"
            className="game-explorer__control game-explorer__control_wide"
            onClick={reset}
            disabled={sans.length === 0}
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* El panel se atenúa mientras busca, pero el tablero de al lado sigue
          jugable: esperar a la consulta para poder mover sería peor que ver un
          dato viejo un instante. */}
      <div className={`game-explorer__panel${isSearching ? " game-explorer__panel_loading" : ""}`}>
        <ExplorerMoveList sans={sans} index={index} onSelect={setIndex} />

        {hasError ? (
          <p className="game-explorer__error" role="status">
            No se pudo consultar esta posición. Mueve otra vez o recarga la página.
          </p>
        ) : (
          <>
            <ExplorerNextMoves moves={result?.nextMoves ?? []} onPlay={playMove} isSearching={isSearching} />
            <ExplorerGames
              games={result?.games ?? []}
              totalGames={result?.totalGames ?? 0}
              isSearching={isSearching}
            />
          </>
        )}
      </div>
    </div>
  );
}
