"use client";

import { useChessReplay } from "@/hooks/use-chess-replay.hook";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { SkipIcon } from "@/components/icons/skip-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import "./chess-board.comp.css";

interface ChessBoardProps {
  moves: string[];
  flipBoard: boolean;
}

export function ChessBoard({ moves, flipBoard }: ChessBoardProps) {
  const { squares, pieces, rows, isAutoPlaying, goToStart, goToEnd, goToPrevious, goToNext, toggleAutoPlay } =
    useChessReplay(moves, flipBoard);

  return (
    <div className="chess-board">
      <div className="chess-board__board-column">
        <div className="chess-board__frame">
          <div className="chess-board__grid">
            {squares.map((square) => (
              <div
                key={square.index}
                className={`chess-board__square chess-board__square_${square.light ? "light" : "dark"}${
                  square.highlighted ? " chess-board__square_highlighted" : ""
                }`}
              />
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

        <div className="chess-board__controls">
          <button type="button" aria-label="Ir al inicio" onClick={goToStart} className="chess-board__control">
            <span className="chess-board__control-icon_flipped">
              <SkipIcon />
            </span>
          </button>
          <button type="button" aria-label="Jugada anterior" onClick={goToPrevious} className="chess-board__control">
            <span className="chess-board__control-icon_flipped">
              <ChevronIcon />
            </span>
          </button>
          <button
            type="button"
            aria-label={isAutoPlaying ? "Pausar" : "Reproducir partida"}
            onClick={toggleAutoPlay}
            className={`chess-board__control chess-board__control_variant_play${isAutoPlaying ? " chess-board__control_active" : ""}`}
          >
            {isAutoPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" aria-label="Jugada siguiente" onClick={goToNext} className="chess-board__control">
            <ChevronIcon />
          </button>
          <button type="button" aria-label="Ir al final" onClick={goToEnd} className="chess-board__control">
            <SkipIcon />
          </button>
        </div>
      </div>

      <div className="chess-board__notation">
        <div className="chess-board__notation-head">
          <span className="chess-board__notation-label">Notación</span>
        </div>
        <div className="chess-board__notation-rows">
          {rows.map((row, index) => (
            <div
              key={row.number}
              className={`chess-board__notation-row${index % 2 === 0 ? " chess-board__notation-row_striped" : ""}`}
            >
              <span className="chess-board__notation-number">{row.number}</span>
              <button
                type="button"
                onClick={row.white.onSelect}
                className={`chess-board__notation-cell${row.white.active ? " chess-board__notation-cell_active" : ""}`}
              >
                {row.white.glyph && (
                  <span className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.white.glyph}`} />
                )}
                {row.white.label}
              </button>
              {row.black ? (
                <button
                  type="button"
                  onClick={row.black.onSelect}
                  className={`chess-board__notation-cell${row.black.active ? " chess-board__notation-cell_active" : ""}`}
                >
                  {row.black.glyph && (
                    <span className={`chess-board__notation-glyph chess-board__notation-glyph_kind_${row.black.glyph}`} />
                  )}
                  {row.black.label}
                </button>
              ) : (
                <span className="chess-board__notation-cell chess-board__notation-cell_empty">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
