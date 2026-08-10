"use client";

import { useEffect, useRef, useState } from "react";
import { useChessReplay, type MoveAnnotations } from "@/hooks/use-chess-replay.hook";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { SkipIcon } from "@/components/icons/skip-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { ShareIcon } from "@/components/icons/share-icon.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { chessMoveQualityIconFor } from "@/components/common/chess-move-quality-icon.comp";
import "./chess-board.comp.css";

export interface ChessBoardMeta {
  white: string;
  black: string;
  result: string;
  event: string;
  round: string;
  eco: string;
}

interface ChessBoardProps {
  moves: string[];
  flipBoard: boolean;
  meta?: ChessBoardMeta;
  annotations?: MoveAnnotations;
}

export function ChessBoard({ moves, flipBoard, meta, annotations }: ChessBoardProps) {
  const {
    ply,
    squares,
    pieces,
    rows,
    isAutoPlaying,
    goToStart,
    goToEnd,
    goToPrevious,
    goToNext,
    toggleAutoPlay,
    toggleFlip,
  } = useChessReplay(moves, flipBoard, annotations);

  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const activeCellRef = useRef<HTMLButtonElement>(null);
  const [notationHeight, setNotationHeight] = useState<number | undefined>(undefined);
  const isInViewportRef = useRef(false);
  const hasBeenClickedRef = useRef(false);

  useEffect(() => {
    const frameEl = frameRef.current;
    if (!frameEl) return;

    const update = () => {
      setNotationHeight(window.innerWidth > 720 ? frameEl.getBoundingClientRect().height : undefined);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(frameEl);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting;
      },
      { threshold: 1 },
    );
    observer.observe(boardEl);
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
    <div className="chess-board" ref={boardRef} onClick={() => (hasBeenClickedRef.current = true)}>
      {meta && (
        <div className="chess-board__meta">
          <div className="chess-board__meta-players">
            {meta.white}
            <span className="chess-board__meta-vs"> contra </span>
            {meta.black}
          </div>
          <div className="chess-board__meta-line">
            {meta.result} · {meta.event} · Ronda: {meta.round} · ECO: {meta.eco}
          </div>
        </div>
      )}

      <div className="chess-board__columns">
        <div className="chess-board__frame" ref={frameRef}>
          <div className="chess-board__grid">
            {squares.map((square) => (
              <div
                key={square.index}
                className={`chess-board__square chess-board__square_${square.light ? "light" : "dark"}${
                  square.highlighted ? " chess-board__square_highlighted" : ""
                }`}
              >
                {square.rank && (
                  <span
                    className={`chess-board__coord chess-board__coord_rank chess-board__coord_on-${square.light ? "light" : "dark"}`}
                  >
                    {square.rank}
                  </span>
                )}
                {square.file && (
                  <span
                    className={`chess-board__coord chess-board__coord_file chess-board__coord_on-${square.light ? "light" : "dark"}`}
                  >
                    {square.file}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="chess-board__pieces">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className={`chess-board__piece chess-board__piece_col_${piece.col} chess-board__piece_row_${piece.row}${
                  piece.visible ? "" : " chess-board__piece_hidden"
                }${piece.glyph ? ` chess-board__piece_glyph_${piece.glyph}` : ""}`}
              />
            ))}
          </div>
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
                    ref={row.white.active ? activeCellRef : undefined}
                    onClick={row.white.onSelect}
                    className={`chess-board__notation-cell${row.white.active ? " chess-board__notation-cell_active" : ""}`}
                  >
                    {WhiteQualityIcon && (
                      <span className="chess-board__notation-quality">
                        <WhiteQualityIcon />
                      </span>
                    )}
                    {row.white.glyph && (
                      <span
                        className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.white.glyph}`}
                      />
                    )}
                    {row.white.label}
                  </button>
                  {row.black ? (
                    <button
                      type="button"
                      ref={row.black.active ? activeCellRef : undefined}
                      onClick={row.black.onSelect}
                      className={`chess-board__notation-cell${row.black.active ? " chess-board__notation-cell_active" : ""}`}
                    >
                      {BlackQualityIcon && (
                        <span className="chess-board__notation-quality">
                          <BlackQualityIcon />
                        </span>
                      )}
                      {row.black.glyph && (
                        <span
                          className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.black.glyph}`}
                        />
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
          <button type="button" aria-label="Compartir" className="chess-board__tool">
            <ShareIcon />
          </button>
        </div>

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
