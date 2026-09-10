"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { replayGame } from "@/lib/chess/replay";
import { searchPosition } from "@/services/game-explorer/game-explorer.actions";
import type { PositionSearchResult } from "@/services/game-explorer/game-explorer.types";
import { ExplorerGames } from "./explorer-games.comp";
import { ExplorerMoveList } from "./explorer-move-list.comp";
import { ExplorerNextMoves } from "./explorer-next-moves.comp";
import "./game-explorer.comp.css";

/**
 * Game explorer by position.
 *
 * The line lives as a list of SAN and the positions are derived with
 * `replayGame`, the same replayer the rest of the platform uses: that way the
 * board, the position index and this panel cannot disagree.
 *
 * The search fires with the position already changed, never while a piece is
 * being dragged: `ChessBoard` only notifies when the move is legal and done.
 */
export function GameExplorer() {
  const [sans, setSans] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<PositionSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Cache by FEN: going back and forth along the line is the explorer's most
  // common gesture and must not cost a query each time. It lives in the
  // component because the project has no client-side data library and a
  // single screen does not justify adding one.
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

    // `cancelled` discards the response of a position that is no longer the
    // current one: whoever navigates fast cannot end up seeing another move's data.
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

  /** Playing from an earlier position abandons the continuation that was there. */
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

      {/* The panel dims while searching, but the board next to it stays
          playable: waiting for the query to be able to move would be worse than
          seeing a stale figure for an instant. */}
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
