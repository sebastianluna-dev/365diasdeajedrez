"use client";

import { INITIAL_FEN } from "chessops/fen";
import { useMemo, useRef, useState } from "react";
import { useLingering } from "@/components/chess/game-viewer/use-lingering.hook";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import type { GameLine } from "@/lib/chess/game-moves";
import { sanLineSteps } from "@/lib/chess/replay";
import "./move-line-preview.comp.css";

interface MoveLinePreviewProps {
  /** The line: where it starts and its moves, as written and as played. */
  line: GameLine;
  /** Written after the last move, after a «·»: how the game ended. */
  suffix?: string;
  /** Which side is at the bottom of the preview. */
  orientation?: "white" | "black";
}

/** The board shown: which move it is after, and whether it opens upwards. */
interface Shown {
  index: number;
  above: boolean;
}

/** How tall the preview is with its gap, to tell whether it fits below. */
const PREVIEW_ROOM = 232;

/**
 * A game's moves on one line, as a list of lessons shows them, where pointing
 * at a move shows the position it leads to on a small board — as the engine's
 * lines do on the analysis board (2026-10-23). Reading eight moves in one's
 * head is what makes a line hard to follow from a list.
 *
 * The board hangs from the line at a FIXED place, under its start (above it
 * when there is no room below), not under the pointer: following a line move
 * by move does not move the board from side to side, which is what would make
 * it impossible to follow with the eyes. It does not catch the pointer, so it
 * never covers the next move, and it is `aria-hidden`: the moves are already
 * read as text, the board only pictures them.
 *
 * The positions are replayed on the first move pointed at, not before: a list
 * of lessons sends the moves and nothing else.
 */
export function MoveLinePreview({ line, suffix, orientation = "white" }: MoveLinePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pointed, setPointed] = useState<Shown | null>(null);
  const [replayed, setReplayed] = useState(false);
  const { value: shown, closing } = useLingering(pointed);

  const steps = useMemo(
    () =>
      replayed
        ? sanLineSteps(
            line.initialFen ?? INITIAL_FEN,
            line.plies.map((ply) => ply.san),
          )
        : [],
    [replayed, line],
  );
  const step = shown ? steps[shown.index] : undefined;

  const point = (index: number) => {
    setReplayed(true);
    const bottom = rootRef.current?.getBoundingClientRect().bottom ?? 0;
    setPointed({ index, above: bottom + PREVIEW_ROOM > window.innerHeight });
  };

  return (
    <div ref={rootRef} className="move-line-preview" onMouseLeave={() => setPointed(null)}>
      <span className="move-line-preview__line">
        {line.plies.map((ply, index) => (
          <span key={index}>
            {index > 0 && " "}
            <span
              className={`move-line-preview__move${shown?.index === index && !closing ? " move-line-preview__move_state_pointed" : ""}`}
              onMouseEnter={() => point(index)}
            >
              {ply.label}
            </span>
          </span>
        ))}
        {suffix && ` · ${suffix}`}
      </span>

      {shown && step && (
        <div
          className={`move-line-preview__board move-line-preview__board_side_${shown.above ? "above" : "below"}${closing ? " move-line-preview__board_state_closing" : ""}`}
          aria-hidden="true"
        >
          <StaticDiagram fen={step.fen} orientation={orientation} lastMove={step} look="material" />
        </div>
      )}
    </div>
  );
}
