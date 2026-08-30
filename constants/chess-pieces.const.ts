// Entidades HTML de las piezas de ajedrez en Unicode. El proyecto no usa enums
// de TS: un objeto `as const` + tipo derivado da el mismo tipado sin runtime extra.

export const CHESS_PIECE_UNICODE = {
  WHITE_KING: "&#x2654;",
  WHITE_QUEEN: "&#x2655;",
  WHITE_ROOK: "&#x2656;",
  WHITE_BISHOP: "&#x2657;",
  WHITE_KNIGHT: "&#x2658;",
  WHITE_PAWN: "&#x2659;",
  BLACK_KING: "&#x265A;",
  BLACK_QUEEN: "&#x265B;",
  BLACK_ROOK: "&#x265C;",
  BLACK_BISHOP: "&#x265D;",
  BLACK_KNIGHT: "&#x265E;",
  BLACK_PAWN: "&#x265F;",
  BLACK_PAWN_EMOJI: "&#x265F;&#xFE0F;",
} as const;

export type ChessPieceUnicode = (typeof CHESS_PIECE_UNICODE)[keyof typeof CHESS_PIECE_UNICODE];
