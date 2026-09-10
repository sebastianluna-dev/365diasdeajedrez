"use client";

import type { Key } from "@lichess-org/chessground/types";
import { useState } from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { engineLineTokens, formatEvaluation } from "@/lib/chess/engine-protocol";
import { sanToSpanish } from "@/lib/chess/notation";
import { uciLineSteps } from "@/lib/chess/replay";
import type { EngineState } from "./use-engine";
import "./engine-panel.comp.css";

interface EnginePanelProps {
  fen: string;
  enabled: boolean;
  onToggle: () => void;
  state: EngineState;
  /** The preview is looked at from the same side as the board next to it. */
  flipBoard?: boolean;
  /**
   * Reports whether any line is expanded. The one mounting the panel — the
   * viewer — needs it because the height this takes up is given up by the
   * notation, and that accounting belongs to the card, not the engine.
   */
  onExpandedChange?: (expanded: boolean) => void;
}

/** How many moves of each continuation are replayed. */
const LINE_LENGTH = 16;

interface Preview {
  fen: string;
  lastMove: [Key, Key];
}

/**
 * The engine switch and the continuations it proposes.
 *
 * It only renders: the viewer is the one that owns the engine, because its
 * evaluation is also used by the bar next to the board. Two consumers of the
 * same data called for keeping it in the place that contains them both.
 */
export function EnginePanel({
  fen,
  enabled,
  onToggle,
  state,
  flipBoard = false,
  onExpandedChange,
}: EnginePanelProps) {
  const { lines, info, loading, failed } = state;
  // At most one expanded: collapsed they fit on one row and the three are
  // compared at a glance, which is what they are for. Opening one closes the
  // other — that way what the block grows is always the same, one row, and
  // the notation knows how much it has to give up.
  const [expanded, setExpanded] = useState<number | null>(null);
  // With the engine off nothing is expanded: it is DERIVED, instead of having
  // to remember to reset it when switching off.
  const openLine = enabled ? expanded : null;

  const toggleLine = (multipv: number) => {
    const next = expanded === multipv ? null : multipv;
    setExpanded(next);
    onExpandedChange?.(next !== null);
  };

  // The position being pointed at. Where the mouse was is NOT stored: the
  // preview always appears in the same place, hanging from the engine block,
  // so the view does not jump from side to side while traversing a line.
  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <div className="engine-panel" onMouseLeave={() => setPreview(null)}>
      <div className="engine-panel__head">
        <span className="engine-panel__label">Módulo</span>

        {/* The depth goes here and not on each line: the three are analysed at
            once and to the same depth, so repeating it three times would be noise. */}
        {enabled && info && <span className="engine-panel__depth">prof. {info.depth}</span>}

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={`engine-panel__toggle${enabled ? " engine-panel__toggle_state_on" : ""}`}
          title={enabled ? "Apagar el módulo de análisis" : "Encender el módulo de análisis"}
        >
          <span className="engine-panel__dot" aria-hidden="true" />
          {enabled ? "Encendido" : "Apagado"}
        </button>
      </div>

      {enabled && (
        <div className={`engine-panel__body${openLine !== null ? " engine-panel__body_state_expanded" : ""}`}>
          {failed ? (
            <p className="engine-panel__message">No se pudo cargar el módulo en este navegador.</p>
          ) : lines.length > 0 ? (
            <ol className="engine-panel__lines">
              {lines.map((line, index) => {
                const steps = uciLineSteps(fen, line.pv.slice(0, LINE_LENGTH));
                const tokens = engineLineTokens(
                  fen,
                  steps.map((step) => step.san),
                );
                const isOpen = openLine === line.multipv;

                return (
                  <li
                    key={line.multipv}
                    className={`engine-panel__row${index === 0 ? " engine-panel__row_rank_best" : ""}`}
                  >
                    <span className={`engine-panel__line${isOpen ? " engine-panel__line_state_expanded" : ""}`}>
                      {/* The evaluation opens the line, inside it: it is the
                          first thing read of the suggestion, not a separate figure
                          in its own column. */}
                      <span className="engine-panel__score">{formatEvaluation(line)}</span>

                      {tokens.map((token, position) => (
                        <span key={position} className="engine-panel__token">
                          {token.number && <span className="engine-panel__move-number">{token.number}</span>}
                          {/* Pointing at a move shows where it leads: reading an
                              eight-move line in one's head is exactly what makes
                              the engine's suggestions hard. */}
                          <span
                            className="engine-panel__move"
                            onMouseEnter={() =>
                              setPreview({ fen: steps[position].fen, lastMove: steps[position].lastMove })
                            }
                          >
                            {sanToSpanish(token.san)}
                          </span>
                        </span>
                      ))}
                    </span>

                    <button
                      type="button"
                      aria-expanded={isOpen}
                      title={isOpen ? "Ver menos jugadas" : "Ver más jugadas"}
                      onClick={() => toggleLine(line.multipv)}
                      className={`engine-panel__more${isOpen ? " engine-panel__more_state_expanded" : ""}`}
                    >
                      <ChevronIcon className="engine-panel__more-icon" />
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="engine-panel__message">{loading ? "Cargando el módulo…" : "Pensando…"}</p>
          )}

        </div>
      )}

      {/* Outside the lines block, which clips whatever overflows it: the
          preview hangs below and is painted over the notation. */}
      {preview && (
        <div className="engine-panel__preview" aria-hidden="true">
          <ChessBoard position={{ fen: preview.fen, lastMove: preview.lastMove }} flipBoard={flipBoard} />
        </div>
      )}
    </div>
  );
}
