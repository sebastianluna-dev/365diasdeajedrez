import { ChessPieceUnicode } from "@/enums/chessPieces";

interface FloatBadgeProps {
  text: string;
  piece: ChessPieceUnicode;
}

export function FloatBadge({ text, piece }: FloatBadgeProps) {
  return (
    <div className="bg-white rounded-full inline-flex p-1 items-center">
      <div
        className="bg-linear-to-r from-primary to-secondary p-2 rounded-full h-8 w-8 font-glyph text-dark font-semibold text-3xl flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: piece }}
      />
      <span className="ml-1 text-dark font-semibold pr-2">{text}</span>
    </div>
  );
}
