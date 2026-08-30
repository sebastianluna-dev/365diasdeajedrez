import { parseFenPlacement } from "@/lib/parse-fen-placement";
import "./static-diagram.comp.css";

interface StaticDiagramProps {
  fen: string;
  orientation?: "white" | "black";
  caption?: string;
}

/**
 * Diagrama estático de una posición (Server Component, sin chessground).
 * Mismo patrón que el bloque de diagrama del blog; para posiciones navegables
 * usar GameViewer.
 */
export function StaticDiagram({ fen, orientation = "white", caption }: StaticDiagramProps) {
  const squares = parseFenPlacement(fen);
  const ordered = orientation === "black" ? [...squares].reverse() : squares;

  return (
    <figure className="static-diagram">
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
