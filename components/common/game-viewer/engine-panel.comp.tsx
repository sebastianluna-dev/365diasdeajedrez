"use client";

import { formatEngineLine, formatEvaluation } from "@/lib/chess/engine-protocol";
import { sanToSpanish } from "@/lib/chess/notation";
import { uciLineToSan } from "@/lib/chess/replay";
import type { EngineState } from "./use-engine";
import "./engine-panel.comp.css";

interface EnginePanelProps {
  fen: string;
  enabled: boolean;
  onToggle: () => void;
  state: EngineState;
}

/** Cuántas jugadas de cada continuación se enseñan. */
const LINE_LENGTH = 8;

/**
 * El interruptor del módulo y las continuaciones que propone.
 *
 * Sólo pinta: quien tiene el motor es el visor, porque su evaluación la usa
 * también la barra de al lado del tablero. Dos consumidores del mismo dato
 * pedían tenerlo en el sitio que los contiene a los dos.
 */
export function EnginePanel({ fen, enabled, onToggle, state }: EnginePanelProps) {
  const { lines, info, loading, failed } = state;

  return (
    <div className="engine-panel">
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
        <div className="engine-panel__body">
          {failed ? (
            <p className="engine-panel__message">No se pudo cargar el módulo en este navegador.</p>
          ) : lines.length > 0 ? (
            <ol className="engine-panel__lines">
              {lines.map((line, index) => {
                const sans = uciLineToSan(fen, line.pv.slice(0, LINE_LENGTH)).map(sanToSpanish);
                return (
                  <li
                    key={line.multipv}
                    className={`engine-panel__row${index === 0 ? " engine-panel__row_rank_best" : ""}`}
                  >
                    <span className="engine-panel__score">{formatEvaluation(line)}</span>
                    <span className="engine-panel__line">{formatEngineLine(fen, sans)}</span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="engine-panel__message">{loading ? "Cargando el módulo…" : "Pensando…"}</p>
          )}
        </div>
      )}
    </div>
  );
}
