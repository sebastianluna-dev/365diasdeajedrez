"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ArrowRightArrowLeftIcon } from "@/components/icons/arrow-right-arrow-left-icon.comp";
import { BackwardStepIcon } from "@/components/icons/backward-step-icon.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ForwardStepIcon } from "@/components/icons/forward-step-icon.comp";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { sanToSpanish } from "@/lib/chess/notation";
import { replayGame } from "@/lib/chess/replay";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { searchPosition } from "@/services/game-explorer/game-explorer.actions";
import type { PositionSearchResult } from "@/services/game-explorer/game-explorer.types";
import type { GameOriginCode } from "@/services/shared/game-origin";
import { ExplorerGames } from "./explorer-games.comp";
import { ExplorerMoveList } from "./explorer-move-list.comp";
import { ExplorerNextMoves } from "./explorer-next-moves.comp";
import { EXPLORER_VIEWS, explorerViewHref } from "./explorer-views.const";
import "./game-explorer.comp.css";

interface GameExplorerProps {
  /** Where the search looks (`?origen=`); none for every game the viewer may see. */
  origin?: GameOriginCode;
}

/** The position on the board by the move that led to it: «Después de 5.Cc3», «Después de 5…a6». */
function positionName(sans: string[], index: number): string {
  if (index === 0) return "Posición inicial";
  const san = sans[index - 1] ?? "";
  return `Después de ${Math.ceil(index / 2)}${index % 2 === 1 ? "." : "…"}${sanToSpanish(san)}`;
}

/** How many of the games searched went through the position, as the toolbar says it. */
function reachedLabel(total: number): string {
  if (total === 0) return "ninguna partida pasó por aquí";
  return total === 1 ? "1 partida pasó por aquí" : `${total} partidas pasaron por aquí`;
}

/**
 * Game explorer by position, in the new design system (2026-10-23, «M4» of
 * the owner's canvas): the workspace's side column holds the line played so
 * far («Jugadas») and where to search («Buscar en», the views by origin, each
 * with how many games of it went through the position), and the panel the
 * position's name in a toolbar, the material board with Material's keys, and
 * beside it the continuations and the games.
 *
 * The line lives as a list of SAN and the positions are derived with
 * `replayGame`, the same replayer the rest of the platform uses: that way the
 * board, the position index and this panel cannot disagree. The view lives in
 * the address (`?origen=`), so changing it renders the page again with
 * another `origin` but keeps this component, and the line with it.
 *
 * The search fires with the position already changed, never while a piece is
 * being dragged: `ChessBoard` only notifies when the move is legal and done.
 */
export function GameExplorer({ origin }: GameExplorerProps) {
  const [sans, setSans] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<PositionSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [hasError, setHasError] = useState(false);
  const headingId = useId();

  // Cache by view and FEN: going back and forth along the line is the
  // explorer's most common gesture and must not cost a query each time. It
  // lives in the component because the project has no client-side data
  // library and a single screen does not justify adding one.
  const cacheRef = useRef(new Map<string, PositionSearchResult>());

  const positions = useMemo(() => replayGame(sans.join(" ")), [sans]);
  const current = positions[Math.min(index, positions.length - 1)] ?? positions[0];

  useEffect(() => {
    const fen = current.fen;
    const key = `${origin ?? ""} ${fen}`;
    const cached = cacheRef.current.get(key);
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

    searchPosition(fen, origin ? { origins: [origin] } : {})
      .then((next) => {
        // A refused search is not a fact about the position: it is not cached,
        // so coming back to it asks again.
        if (!next.throttled) cacheRef.current.set(key, next);
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
  }, [current.fen, origin]);

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

  // The figures of the search, when there are any: a failed or refused one
  // has none, and «0» would be a false fact about the position.
  const figures = result && !result.throttled && !hasError ? result : null;
  const counts = figures?.originCounts;
  const everyGame = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined;
  const views = EXPLORER_VIEWS.map((view) => ({
    label: view.label,
    icon: view.icon,
    href: explorerViewHref(view),
    current: view.origin === origin,
    count: view.origin ? counts?.[view.origin] : everyGame,
  }));

  const toMove = current.fen.split(" ")[1] === "b" ? "juegan negras" : "juegan blancas";
  const atStart = index === 0;
  const atEnd = index === sans.length;
  // Material's wide keys, as the viewer's under its board: the way forward
  // filled, the rest on the container's grey (`_tone_grey`).
  const keyClass = (main = false) =>
    main
      ? `${mdIconButton("filled", "sm", "wide")} game-explorer__key`
      : `${mdIconButton("tonal", "sm", "wide")} game-explorer__key game-explorer__key_tone_grey`;

  return (
    <div className="platform-workspace game-explorer">
      <div className="platform-workspace__side game-explorer__side">
        <ExplorerMoveList sans={sans} index={index} onSelect={setIndex} />
        <PlatformSideNav label="Dónde buscar" groups={[{ title: "Buscar en", links: views }]} />
      </div>

      <section className="platform-workspace__panel game-explorer__panel" aria-labelledby={headingId}>
        <div className="game-explorer__toolbar">
          <h1 id={headingId} className="game-explorer__position">
            {positionName(sans, index)}
          </h1>
          <p className="game-explorer__summary">
            · {toMove}
            {figures && !isSearching && ` · ${reachedLabel(figures.totalGames)}`}
          </p>
          <button
            type="button"
            className={`${mdButton("text", "sm")} game-explorer__reset`}
            onClick={reset}
            disabled={sans.length === 0}
          >
            Reiniciar
          </button>
        </div>

        <div className="game-explorer__body">
          <div className="game-explorer__board">
            <ChessBoard
              position={{ fen: current.fen, lastMove: current.lastMove, check: current.check }}
              flipBoard={flipped}
              interactive
              onMove={playMove}
              look="material"
            />

            <div className="game-explorer__keys">
              <button
                type="button"
                className={keyClass()}
                onClick={goToStart}
                disabled={atStart}
                aria-label="Ir a la posición inicial"
                title="Ir a la posición inicial"
              >
                <BackwardStepIcon variant="sharp-light" className="platform-md-icon" />
              </button>
              <button
                type="button"
                className={keyClass()}
                onClick={goToPrevious}
                disabled={atStart}
                aria-label="Jugada anterior"
                title="Jugada anterior"
              >
                <ChevronLeftIcon variant="sharp-light" className="platform-md-icon" />
              </button>
              <button
                type="button"
                className={keyClass(true)}
                onClick={goToNext}
                disabled={atEnd}
                aria-label="Jugada siguiente"
                title="Jugada siguiente"
              >
                <ChevronRightIcon variant="sharp-light" className="platform-md-icon" />
              </button>
              <button
                type="button"
                className={keyClass()}
                onClick={goToEnd}
                disabled={atEnd}
                aria-label="Ir al final de la línea"
                title="Ir al final de la línea"
              >
                <ForwardStepIcon variant="sharp-light" className="platform-md-icon" />
              </button>
              {/* Apart from the way along the line: it turns the board, it does not move. */}
              <button
                type="button"
                className={`${keyClass()} game-explorer__flip`}
                onClick={() => setFlipped((previous) => !previous)}
                aria-label="Girar el tablero"
                title="Girar el tablero"
              >
                <ArrowRightArrowLeftIcon variant="sharp-light" className="platform-md-icon" />
              </button>
            </div>
          </div>

          {/* The results dim while searching, but the board next to them stays
              playable: waiting for the query to be able to move would be worse
              than seeing a stale figure for an instant. */}
          <div
            className={`game-explorer__results${isSearching ? " game-explorer__results_state_loading" : ""}`}
            aria-busy={isSearching}
          >
            {hasError ? (
              <p className="game-explorer__error" role="status">
                No se pudo consultar esta posición. Mueve otra vez o recarga la página.
              </p>
            ) : result?.throttled ? (
              <p className="game-explorer__error" role="status">
                Demasiadas consultas seguidas. Espera un momento y vuelve a mover.
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
      </section>
    </div>
  );
}
