"use client";

import { type PointerEvent as ReactPointerEvent, useMemo } from "react";
import type { GameReview } from "@/lib/chess/game-review";
import { winPercent } from "@/lib/chess/game-review";
import type { MoveEvaluation } from "@/lib/chess/pgn-tree";
import "./game-review-chart.comp.css";

interface GameReviewChartProps {
  /** One per main-line position; the first is the starting one. */
  evaluations: MoveEvaluation[];
  review: GameReview;
  /** The ply the board is at, for the cursor. 0 is the initial position. */
  currentPly: number;
  /** Takes the board to the ply pointed at on the chart. */
  onSelectPly: (ply: number) => void;
}

/** Drawing measurements. The SVG scales by itself; what is fixed is the ratio. */
const WIDTH = 404;
const HEIGHT = 140;
const MIDDLE = HEIGHT / 2;
/** How far the line rises with a crushing advantage. */
const AMPLITUDE = 62;

/**
 * The advantage over the course of the game.
 *
 * The vertical axis is NOT pawns but win probability: between +7 and +9
 * there is nothing to tell, and between +0.2 and +1 the game is decided. It
 * is the same curve accuracy is computed with, so the chart and the numbers
 * next to it tell the same story.
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

  /** From where the mouse is to the nearest ply. */
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
        // Dragging scrubs through the game, which is what one tries to do the
        // moment one sees a chart like this.
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
        {/* The same stroke, clipped above and below: what sticks out past the
            middle belongs to whoever is winning, and is painted in their colour. */}
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
