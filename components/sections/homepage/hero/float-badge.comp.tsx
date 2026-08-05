import { ChessPieceUnicode } from "@/enums/chess-pieces.enum";
import "./float-badge.comp.css";

interface FloatBadgeProps {
  text: string;
  piece: ChessPieceUnicode;
  className?: string;
}

export function FloatBadge({ text, piece, className }: FloatBadgeProps) {
  return (
    <div className={`float-badge ${className ?? ""}`}>
      <div className="float-badge__icon" dangerouslySetInnerHTML={{ __html: piece }} />
      <span className="float-badge__text">{text}</span>
    </div>
  );
}
