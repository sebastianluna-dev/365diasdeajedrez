"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chessground } from "@lichess-org/chessground";
import type { Api } from "@lichess-org/chessground/api";
import type { Config } from "@lichess-org/chessground/config";
import type { Key } from "@lichess-org/chessground/types";
import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";
import { legalDests } from "@/lib/chess/legal-moves";
import { buildNotationRows } from "@/lib/chess/notation";
import { replayGame, sanForMove, turnColor } from "@/lib/chess/replay";
import type { MoveAnnotations } from "@/lib/chess/types";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { SkipIcon } from "@/components/icons/skip-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { chessMoveQualityIconFor } from "@/components/common/chess-move-quality-icon.comp";
import "./chess-board.comp.css";

const AUTOPLAY_MS = 900;

interface ChessBoardProps {
  /** Full PGN or bare SAN movetext. */
  pgn: string;
  flipBoard?: boolean;
  annotations?: MoveAnnotations;
  /** Allow the viewer to drag/click legal moves (chessops-validated). */
  interactive?: boolean;
  /** Called after a legal interactive move, with its SAN and the FEN it was played from. */
  onMove?: (san: string, fromFen: string) => void;
}

export function ChessBoard({ pgn, flipBoard = false, annotations, interactive = false, onMove }: ChessBoardProps) {
  const positions = useMemo(() => replayGame(pgn), [pgn]);
  const total = positions.length - 1;
  const rows = useMemo(
    () => buildNotationRows(positions.slice(1).map((position) => position.san), annotations),
    [positions, annotations],
  );

  const [ply, setPlyState] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [flipToggled, setFlipToggled] = useState(false);
  const orientation: "white" | "black" = (flipBoard ? !flipToggled : flipToggled) ? "black" : "white";

  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeCellRef = useRef<HTMLButtonElement>(null);
  const isInViewportRef = useRef(false);
  const hasBeenClickedRef = useRef(false);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const [notationHeight, setNotationHeight] = useState<number | undefined>(undefined);

  const setPly = useCallback((n: number) => setPlyState(Math.max(0, Math.min(total, n))), [total]);

  const stopAutoPlay = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = null;
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (autoTimer.current) {
      stopAutoPlay();
      return;
    }
    setPlyState((current) => (current >= total ? 0 : current));
    setIsAutoPlaying(true);
    autoTimer.current = setInterval(() => {
      setPlyState((current) => {
        if (current >= total) {
          stopAutoPlay();
          return current;
        }
        return current + 1;
      });
    }, AUTOPLAY_MS);
  }, [stopAutoPlay, total]);

  const goToStart = useCallback(() => setPly(0), [setPly]);
  const goToEnd = useCallback(() => setPly(total), [setPly, total]);
  const goToPrevious = useCallback(() => setPly(ply - 1), [ply, setPly]);
  const goToNext = useCallback(() => setPly(ply + 1), [ply, setPly]);
  const toggleFlip = useCallback(() => setFlipToggled((current) => !current), []);

  useEffect(() => stopAutoPlay, [pgn, stopAutoPlay]);

  // Instantiate chessground once per mode.
  useEffect(() => {
    if (!boardRef.current) return;
    const api = Chessground(boardRef.current, {
      coordinates: true,
      animation: { enabled: true, duration: 200 },
      viewOnly: !interactive,
      draggable: { enabled: interactive },
      selectable: { enabled: interactive },
      drawable: { enabled: false },
    });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, [interactive]);

  // Push the current position into chessground.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const { fen, lastMove, check } = positions[ply];
    const color = turnColor(fen);
    const config: Config = {
      fen,
      lastMove,
      orientation,
      turnColor: color,
      check: check ? color : false,
    };
    if (interactive) {
      config.movable = {
        free: false,
        color,
        dests: legalDests(fen),
        showDests: true,
        events: {
          after: (orig, dest) => {
            const san = sanForMove(fen, orig as Key, dest as Key);
            if (san) onMoveRef.current?.(san, fen);
            apiRef.current?.set({ fen });
          },
        },
      };
    }
    api.set(config);
  }, [ply, positions, orientation, interactive]);

  // Keep chessground sized to its container.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => {
      apiRef.current?.redrawAll();
      setNotationHeight(window.innerWidth > 720 ? frame.getBoundingClientRect().height : undefined);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Track viewport visibility so keyboard nav only steals arrows for a board in view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting;
      },
      { threshold: 1 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInViewportRef.current && !hasBeenClickedRef.current) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  useEffect(() => {
    activeCellRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [ply]);

  return (
    <div className="chess-board" ref={rootRef} onClick={() => (hasBeenClickedRef.current = true)}>
      <div className="chess-board__columns">
        <div className="chess-board__frame" ref={frameRef}>
          <div className="chess-board__surface" ref={boardRef} />
        </div>

        <div className="chess-board__notation" style={notationHeight ? { height: notationHeight } : undefined}>
          <div className="chess-board__notation-rows">
            {rows.map((row, index) => {
              const WhiteQualityIcon = row.white.quality ? chessMoveQualityIconFor(row.white.quality) : null;
              const BlackQualityIcon = row.black?.quality ? chessMoveQualityIconFor(row.black.quality) : null;
              return (
                <div
                  key={row.number}
                  className={`chess-board__notation-row${index % 2 === 0 ? " chess-board__notation-row_striped" : ""}`}
                >
                  <span className="chess-board__notation-number">{row.number}</span>
                  <button
                    type="button"
                    ref={ply === row.white.ply ? activeCellRef : undefined}
                    onClick={() => setPly(row.white.ply)}
                    className={`chess-board__notation-cell${ply === row.white.ply ? " chess-board__notation-cell_active" : ""}`}
                  >
                    {WhiteQualityIcon && (
                      <span className="chess-board__notation-quality">
                        <WhiteQualityIcon />
                      </span>
                    )}
                    {row.white.glyph && (
                      <span className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.white.glyph}`} />
                    )}
                    {row.white.label}
                  </button>
                  {row.black ? (
                    <button
                      type="button"
                      ref={ply === row.black.ply ? activeCellRef : undefined}
                      onClick={() => setPly(row.black!.ply)}
                      className={`chess-board__notation-cell${ply === row.black.ply ? " chess-board__notation-cell_active" : ""}`}
                    >
                      {BlackQualityIcon && (
                        <span className="chess-board__notation-quality">
                          <BlackQualityIcon />
                        </span>
                      )}
                      {row.black.glyph && (
                        <span className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.black.glyph}`} />
                      )}
                      {row.black.label}
                    </button>
                  ) : (
                    <span className="chess-board__notation-cell chess-board__notation-cell_empty">·</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chess-board__toolbar">
        <div className="chess-board__toolbar-group">
          <button type="button" aria-label="Voltear tablero" onClick={toggleFlip} className="chess-board__tool">
            <FlipIcon />
          </button>
          <button
            type="button"
            aria-label={isAutoPlaying ? "Pausar" : "Reproducir partida"}
            onClick={toggleAutoPlay}
            className={`chess-board__tool chess-board__tool_variant_play${isAutoPlaying ? " chess-board__tool_active" : ""}`}
          >
            {isAutoPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" aria-label="Ir al inicio" onClick={goToStart} className="chess-board__tool">
            <span className="chess-board__tool-icon_flipped">
              <SkipIcon />
            </span>
          </button>
          <button type="button" aria-label="Jugada anterior" onClick={goToPrevious} className="chess-board__tool">
            <span className="chess-board__tool-icon_flipped">
              <ChevronIcon />
            </span>
          </button>
          <button type="button" aria-label="Jugada siguiente" onClick={goToNext} className="chess-board__tool">
            <ChevronIcon />
          </button>
          <button type="button" aria-label="Ir al final" onClick={goToEnd} className="chess-board__tool">
            <SkipIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
