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
  /** La vista previa se mira desde el mismo lado que el tablero de al lado. */
  flipBoard?: boolean;
  /**
   * Avisa de si hay alguna línea desplegada. Lo necesita quien monta el panel
   * —el visor— porque el alto que ocupa esto se lo cede la notación, y esa
   * cuenta la lleva la tarjeta, no el módulo.
   */
  onExpandedChange?: (expanded: boolean) => void;
}

/** Cuántas jugadas de cada continuación se reproducen. */
const LINE_LENGTH = 16;

interface Preview {
  fen: string;
  lastMove: [Key, Key];
}

/**
 * El interruptor del módulo y las continuaciones que propone.
 *
 * Sólo pinta: quien tiene el motor es el visor, porque su evaluación la usa
 * también la barra de al lado del tablero. Dos consumidores del mismo dato
 * pedían tenerlo en el sitio que los contiene a los dos.
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
  // Una desplegada como mucho: plegadas caben en un renglón y las tres se
  // comparan de un vistazo, que es para lo que están. Abrir una cierra la otra
  // —así lo que crece el bloque es siempre lo mismo, un renglón, y la notación
  // sabe cuánto tiene que ceder—.
  const [expanded, setExpanded] = useState<number | null>(null);
  // Con el módulo apagado no hay nada desplegado: se DEDUCE, en vez de tener
  // que acordarse de ponerlo a cero al apagarlo.
  const openLine = enabled ? expanded : null;

  const toggleLine = (multipv: number) => {
    const next = expanded === multipv ? null : multipv;
    setExpanded(next);
    onExpandedChange?.(next !== null);
  };

  // La posición que se está señalando. NO se guarda dónde estaba el ratón: la
  // vista previa sale siempre en el mismo sitio, colgada del bloque del módulo,
  // así que la vista no salta de un lado a otro al recorrer una línea.
  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <div className="engine-panel" onMouseLeave={() => setPreview(null)}>
      <div className="engine-panel__head">
        <span className="engine-panel__label">Módulo</span>

        {/* La profundidad va aquí y no en cada línea: las tres se analizan a la
            vez y a la misma hondura, así que repetirla tres veces sería ruido. */}
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
                      {/* La evaluación abre la línea, dentro de ella: es lo
                          primero que se lee de la sugerencia, no un dato aparte
                          en su propia columna. */}
                      <span className="engine-panel__score">{formatEvaluation(line)}</span>

                      {tokens.map((token, position) => (
                        <span key={position} className="engine-panel__token">
                          {token.number && <span className="engine-panel__move-number">{token.number}</span>}
                          {/* Señalar una jugada enseña a dónde lleva: leer una
                              línea de ocho jugadas de cabeza es justo lo que
                              cuesta de las sugerencias del módulo. */}
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

      {/* Fuera del bloque de las líneas, que recorta lo que se le salga: la
          vista previa cuelga por debajo y se pinta sobre la notación. */}
      {preview && (
        <div className="engine-panel__preview" aria-hidden="true">
          <ChessBoard position={{ fen: preview.fen, lastMove: preview.lastMove }} flipBoard={flipBoard} />
        </div>
      )}
    </div>
  );
}
