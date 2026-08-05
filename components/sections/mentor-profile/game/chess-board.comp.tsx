"use client";

import { useChessReplay } from "@/hooks/use-chess-replay";
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
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="m17.93 2h.13c1.6 0 1.93.33 1.93 1.93v16.13c0 1.6-.33 1.93-1.93 1.93h-.13c-1.6 0-1.93-.33-1.93-1.93v-16.13c0-1.6.33-1.93 1.93-1.93zm-13.86.87.07-.07c1.13-1.13 1.6-1.13 2.73 0l6.4 6.37c1.73 1.77 1.73 3.9 0 5.67l-6.4 6.37c-1.13 1.13-1.6 1.13-2.73 0l-.07-.07c-1.13-1.13-1.13-1.6 0-2.73l6.37-6.4-6.37-6.4c-1.13-1.13-1.13-1.6 0-2.73zm0 0" />
              </svg>
            </span>
          </button>
          <button type="button" aria-label="Jugada anterior" onClick={goToPrevious} className="chess-board__control">
            <span className="chess-board__control-icon_flipped">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="m7.73 2.87.07-.07c1.13-1.13 1.6-1.13 2.73 0l6.4 6.37c1.73 1.77 1.73 3.9 0 5.67l-6.4 6.37c-1.13 1.13-1.6 1.13-2.73 0l-.07-.07c-1.13-1.13-1.13-1.6 0-2.73l6.37-6.4-6.37-6.4c-1.13-1.13-1.13-1.6 0-2.73zm0 0" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            aria-label={isAutoPlaying ? "Pausar" : "Reproducir partida"}
            onClick={toggleAutoPlay}
            className={`chess-board__control chess-board__control_variant_play${isAutoPlaying ? " chess-board__control_active" : ""}`}
          >
            {isAutoPlaying ? (
              <svg viewBox="0 0 24 24" width="19" height="22" fill="currentColor" aria-hidden="true">
                <rect x="4" y="2" width="6" height="20" rx="1" />
                <rect x="14" y="2" width="6" height="20" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="19" height="22" fill="currentColor" aria-hidden="true">
                <path d="M3 2l18 11L3 24V2z" />
              </svg>
            )}
          </button>
          <button type="button" aria-label="Jugada siguiente" onClick={goToNext} className="chess-board__control">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
              <path d="m7.73 2.87.07-.07c1.13-1.13 1.6-1.13 2.73 0l6.4 6.37c1.73 1.77 1.73 3.9 0 5.67l-6.4 6.37c-1.13 1.13-1.6 1.13-2.73 0l-.07-.07c-1.13-1.13-1.13-1.6 0-2.73l6.37-6.4-6.37-6.4c-1.13-1.13-1.13-1.6 0-2.73zm0 0" />
            </svg>
          </button>
          <button type="button" aria-label="Ir al final" onClick={goToEnd} className="chess-board__control">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
              <path d="m17.93 2h.13c1.6 0 1.93.33 1.93 1.93v16.13c0 1.6-.33 1.93-1.93 1.93h-.13c-1.6 0-1.93-.33-1.93-1.93v-16.13c0-1.6.33-1.93 1.93-1.93zm-13.86.87.07-.07c1.13-1.13 1.6-1.13 2.73 0l6.4 6.37c1.73 1.77 1.73 3.9 0 5.67l-6.4 6.37c-1.13 1.13-1.6 1.13-2.73 0l-.07-.07c-1.13-1.13-1.13-1.6 0-2.73l6.37-6.4-6.37-6.4c-1.13-1.13-1.13-1.6 0-2.73zm0 0" />
            </svg>
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
