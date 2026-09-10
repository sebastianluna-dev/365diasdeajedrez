import { parseFenPlacement } from "@/lib/parse-fen-placement";
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
}

/**
 * Static diagram of a position (Server Component, no chessground). Used by
 * classes and by the blog's diagram block; for navigable positions use
 * GameViewer.
 */
export function StaticDiagram({ fen, orientation = "white", caption, context = "platform" }: StaticDiagramProps) {
  const squares = parseFenPlacement(fen);
  const ordered = orientation === "black" ? [...squares].reverse() : squares;

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
      </div>
      {caption && <figcaption className="static-diagram__caption">{caption}</figcaption>}
    </figure>
  );
}
