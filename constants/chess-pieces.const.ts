// HTML entities of the chess pieces in Unicode. The project does not use TS
// enums: an `as const` object + derived type gives the same typing with no extra runtime.

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
