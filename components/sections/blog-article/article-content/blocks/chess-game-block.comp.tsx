import type { ChessGameBlock } from "@/payload-types";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { parsePgnMoves } from "@/lib/parse-pgn-moves";
import "./chess-game-block.comp.css";

export function ChessGameBlockRenderer({ pgn, title, players, event, date }: ChessGameBlock) {
  const moves = parsePgnMoves(pgn);
  const subtitle = [players, event, date ? new Date(date).getFullYear() : null].filter(Boolean).join(" · ");

  return (
    <div className="rich-chess-game">
      {(title || subtitle) && (
        <div className="rich-chess-game__meta">
          {title && <p className="rich-chess-game__title">{title}</p>}
          {subtitle && <p className="rich-chess-game__subtitle">{subtitle}</p>}
        </div>
      )}
      <ChessBoard moves={moves} flipBoard={false} />
    </div>
  );
}
