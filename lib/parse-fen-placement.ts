const PIECE_NAMES: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function pieceGlyph(char: string): string {
  const color = char === char.toUpperCase() ? "w" : "b";
  return `${color}-${PIECE_NAMES[char.toLowerCase()]}`;
}

// Returns 64 squares ordered a8..h8, a7..h7, ... a1..h1 (standard FEN reading order).
export function parseFenPlacement(fen: string): (string | null)[] {
  const placement = fen.trim().split(" ")[0] ?? "";
  const squares: (string | null)[] = [];

  for (const row of placement.split("/")) {
    for (const char of row) {
      if (/\d/.test(char)) {
        squares.push(...Array(Number(char)).fill(null));
      } else {
        squares.push(pieceGlyph(char));
      }
    }
  }

  return squares;
}
