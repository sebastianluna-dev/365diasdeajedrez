import type { ChessDiagramBlock } from "@/payload-types";
import { parseFenPlacement } from "@/lib/parse-fen-placement";
import "./chess-diagram-block.comp.css";

export function ChessDiagramBlockRenderer({ fen, caption, orientation }: ChessDiagramBlock) {
  const squares = parseFenPlacement(fen);
  const ordered = orientation === "black" ? [...squares].reverse() : squares;

  return (
    <figure className="rich-chess-diagram">
      <div className="rich-chess-diagram__grid">
        {ordered.map((glyph, index) => {
          const file = index % 8;
          const rank = Math.floor(index / 8);
          const isLight = (file + rank) % 2 === 0;

          return (
            <div
              key={index}
              className={`rich-chess-diagram__square rich-chess-diagram__square_${isLight ? "light" : "dark"}`}
            >
              {glyph && <div className={`rich-chess-diagram__piece rich-chess-diagram__piece_glyph_${glyph}`} />}
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="rich-chess-diagram__caption">{caption}</figcaption>}
    </figure>
  );
}
