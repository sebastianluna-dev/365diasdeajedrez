import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import "./site-board.comp.css";

interface SiteBoardProps {
  /** The position, as a FEN (its placement is enough). */
  fen: string;
  /** What the board shows, said to a screen reader: the squares themselves say nothing. */
  label: string;
  /** The move that led here, its two squares lit in amber. */
  lastMove?: { from: string; to: string };
  orientation?: "white" | "black";
}

/**
 * A position drawn on the new look's board — the platform's material board
 * (`StaticDiagram look="material"`: blue squares, the amber of the last move,
 * the «elegida» pieces) — as a picture with its name. It is a Server
 * Component and loads no chessground: the site's boards are shown, not played.
 * It fills the width it is given and stays square.
 */
export function SiteBoard({ fen, label, lastMove, orientation = "white" }: SiteBoardProps) {
  return (
    <div className="site-board" role="img" aria-label={label}>
      <StaticDiagram fen={fen} look="material" lastMove={lastMove} orientation={orientation} />
    </div>
  );
}
