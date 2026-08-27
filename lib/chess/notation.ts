import type { MoveAnnotations, MoveQuality } from "./types";

const PIECE_KIND_BY_LETTER: Record<string, string> = { N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };
const SPANISH_LETTER: Record<string, string> = { N: "C", B: "A", R: "T", Q: "D", K: "R" };

const toSpanish = (san: string) =>
  san.indexOf("O-O") === 0 ? san : (SPANISH_LETTER[san[0]] || "") + (SPANISH_LETTER[san[0]] ? san.slice(1) : san);
const withoutInitial = (san: string) => (PIECE_KIND_BY_LETTER[san[0]] ? san.slice(1) : san);
const pieceGlyphOf = (san: string): string | null => PIECE_KIND_BY_LETTER[san[0]] ?? null;

export interface NotationHalfMove {
  label: string;
  glyph: string | null;
  quality: MoveQuality | null;
  /** Ply index this half-move leads to (1-based; step the board here on click). */
  ply: number;
}

export interface NotationRow {
  number: string;
  white: NotationHalfMove;
  black: NotationHalfMove | null;
}

function halfMove(san: string, ply: number, quality: MoveQuality | null): NotationHalfMove {
  return { label: toSpanish(withoutInitial(san)), glyph: pieceGlyphOf(san), quality, ply };
}

/**
 * Groups a flat SAN list into numbered rows for the move-list panel.
 * `annotations` keys are `${moveNumber}${"w" | "b"}`.
 */
export function buildNotationRows(sans: string[], annotations?: MoveAnnotations): NotationRow[] {
  const rows: NotationRow[] = [];
  for (let n = 0; n < sans.length; n += 2) {
    const moveNumber = n / 2 + 1;
    const hasBlack = n + 1 < sans.length;
    rows.push({
      number: `${moveNumber}.`,
      white: halfMove(sans[n], n + 1, annotations?.[`${moveNumber}w`] ?? null),
      black: hasBlack ? halfMove(sans[n + 1], n + 2, annotations?.[`${moveNumber}b`] ?? null) : null,
    });
  }
  return rows;
}
