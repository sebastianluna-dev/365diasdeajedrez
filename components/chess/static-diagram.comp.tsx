import { parseFenPlacement } from "@/lib/parse-fen-placement";
import { arrowPoints, type StaticDiagramArrow } from "./static-diagram-arrows";
import "./static-diagram.comp.css";

interface StaticDiagramProps {
  fen: string;
  orientation?: "white" | "black";
  caption?: string;
  /**
   * Where it is rendered: in the platform (default, with its tokens) or inside
   * a blog article, which has another background and another text scale.
   */
  context?: "platform" | "article";
  /**
   * Arrows over the position, each a move with its tone: the one a student
   * played (`danger`) and the one the solution expected (`success`), which is
   * how a teacher reads a mistake (D24). Only the platform passes them: the
   * site has no success token and its blog block never sets the prop.
   */
  arrows?: StaticDiagramArrow[];
}

/**
 * Static diagram of a position (Server Component, no chessground). Used by
 * classes and by the blog's diagram block; for navigable positions use
 * GameViewer.
 */
export function StaticDiagram({
  fen,
  orientation = "white",
  caption,
  context = "platform",
  arrows,
}: StaticDiagramProps) {
  const squares = parseFenPlacement(fen);
  const ordered = orientation === "black" ? [...squares].reverse() : squares;
  const drawn = (arrows ?? []).flatMap((arrow, index) => {
    const points = arrowPoints(arrow, orientation);
    return points ? [{ key: `${index}:${arrow.from}${arrow.to}`, tone: arrow.tone, points }] : [];
  });

  return (
    <figure className={`static-diagram${context === "article" ? " static-diagram_context_article" : ""}`}>
      <div className="static-diagram__grid">
        {ordered.map((glyph, index) => {
          const file = index % 8;
          const rank = Math.floor(index / 8);
          const isLight = (file + rank) % 2 === 0;

          return (
            <div key={index} className={`static-diagram__square static-diagram__square_${isLight ? "light" : "dark"}`}>
              {glyph && <div className={`static-diagram__piece static-diagram__piece_glyph_${glyph}`} />}
            </div>
          );
        })}
        {drawn.length > 0 && (
          // What the arrows say is written beside the diagram by whoever passes them; here they are only drawn.
          <svg className="static-diagram__arrows" viewBox="0 0 8 8" aria-hidden="true">
            {drawn.map((arrow) => (
              <polygon
                key={arrow.key}
                className={`static-diagram__arrow static-diagram__arrow_tone_${arrow.tone}`}
                points={arrow.points}
              />
            ))}
          </svg>
        )}
      </div>
      {caption && <figcaption className="static-diagram__caption">{caption}</figcaption>}
    </figure>
  );
}
