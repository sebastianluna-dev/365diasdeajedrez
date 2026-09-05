"use client";

import { type PointerEvent as ReactPointerEvent, useMemo } from "react";
import type { GameReview } from "@/lib/chess/game-review";
import { winPercent } from "@/lib/chess/game-review";
import type { MoveEvaluation } from "@/lib/chess/pgn-tree";
import "./game-review-chart.comp.css";

interface GameReviewChartProps {
  /** Una por posición de la línea principal; la primera es la de partida. */
  evaluations: MoveEvaluation[];
  review: GameReview;
  /** El ply en el que está el tablero, para el cursor. 0 es la posición inicial. */
  currentPly: number;
  /** Llevar el tablero al ply que se señale sobre la gráfica. */
  onSelectPly: (ply: number) => void;
}

/** Medidas del dibujo. El SVG escala solo; lo que se fija es la proporción. */
const WIDTH = 404;
const HEIGHT = 140;
const MIDDLE = HEIGHT / 2;
/** Cuánto sube la línea con una ventaja aplastante. */
const AMPLITUDE = 62;

/**
 * La ventaja a lo largo de la partida.
 *
 * El eje vertical NO son peones sino probabilidad de ganar: entre +7 y +9 no
 * hay nada que contar, y entre +0,2 y +1 se decide la partida. Es la misma
 * curva con la que se calcula la precisión, así que la gráfica y los números de
 * al lado cuentan lo mismo.
 */
export function GameReviewChart({ evaluations, review, currentPly, onSelectPly }: GameReviewChartProps) {
  const { line, area, points } = useMemo(() => {
    const step = evaluations.length > 1 ? WIDTH / (evaluations.length - 1) : 0;
    const coordinates = evaluations.map((evaluation, index) => {
      const advantage = (winPercent(evaluation.score) - 50) / 50;
      return { x: index * step, y: MIDDLE - advantage * AMPLITUDE };
    });

    const path = coordinates.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join("L");
    return {
      line: `M${path}`,
      area: `M0,${MIDDLE}L${path}L${WIDTH},${MIDDLE}Z`,
      points: coordinates,
    };
  }, [evaluations]);

  const cursorX = points[Math.min(currentPly, points.length - 1)]?.x ?? 0;

  /** De dónde está el ratón al ply más cercano. */
  const selectAt = (event: ReactPointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const ply = Math.round(ratio * (evaluations.length - 1));
    onSelectPly(Math.max(0, Math.min(evaluations.length - 1, ply)));
  };

  const phaseWidth = (ply: number) => `${((ply / Math.max(1, evaluations.length - 1)) * 100).toFixed(2)}%`;

  return (
    <div className="game-review-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfica de ventaja a lo largo de la partida"
        className="game-review-chart__plot"
        onPointerDown={selectAt}
        // Arrastrar recorre la partida, que es lo que uno intenta hacer nada
        // más ver una gráfica así.
        onPointerMove={(event) => event.buttons > 0 && selectAt(event)}
      >
        <defs>
          <clipPath id="game-review-top">
            <rect x="0" y="0" width={WIDTH} height={MIDDLE} />
          </clipPath>
          <clipPath id="game-review-bottom">
            <rect x="0" y={MIDDLE} width={WIDTH} height={MIDDLE} />
          </clipPath>
        </defs>

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="game-review-chart__ground" />
        {/* El mismo trazo, recortado arriba y abajo: lo que sobresale de la
            mitad es de quien va ganando, y se pinta de su color. */}
        <path d={area} clipPath="url(#game-review-top)" className="game-review-chart__area_side_white" />
        <path d={area} clipPath="url(#game-review-bottom)" className="game-review-chart__area_side_black" />
        <line x1="0" y1={MIDDLE} x2={WIDTH} y2={MIDDLE} className="game-review-chart__axis" />
        <path d={line} fill="none" className="game-review-chart__line" />
        <line x1={cursorX} y1="0" x2={cursorX} y2={HEIGHT} className="game-review-chart__cursor" />
      </svg>

      <div className="game-review-chart__phases">
        <span className="game-review-chart__phase" style={{ width: phaseWidth(review.phases.middlegame) }}>
          Apertura
        </span>
        <span
          className="game-review-chart__phase"
          style={{ width: phaseWidth(review.phases.endgame - review.phases.middlegame) }}
        >
          Medio juego
        </span>
        <span className="game-review-chart__phase game-review-chart__phase_last">Final</span>
      </div>
    </div>
  );
}
