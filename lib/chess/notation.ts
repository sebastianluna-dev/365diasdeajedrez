import type { MoveAnnotations, MoveQuality } from "./types";

const PIECE_KIND_BY_LETTER: Record<string, string> = { N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };
const SPANISH_LETTER: Record<string, string> = { N: "C", B: "A", R: "T", Q: "D", K: "R" };

const toSpanish = (san: string) =>
  san.indexOf("O-O") === 0
    ? san
    : (SPANISH_LETTER[san.charAt(0)] || "") + (SPANISH_LETTER[san.charAt(0)] ? san.slice(1) : san);

/**
 * Translates the piece initial of a SAN into Spanish (N→C, B→A, R→T, Q→D,
 * K→R), leaving the rest intact. Castling is not translated. It also translates
 * the promotion piece (`=Q` → `=D`).
 */
export function sanToSpanish(san: string): string {
  const translated = toSpanish(san);
  return translated.replace(/=([NBRQK])/, (_, piece: string) => `=${SPANISH_LETTER[piece] ?? piece}`);
}
/**
 * The move with its number, as it is named when talking about it: "12. Cf3",
 * "12… Axf3". The ply is 1-based, so odd ones are White's.
 */
export function numberedMoveLabel(ply: number, san: string): string {
  return `${Math.ceil(ply / 2)}${ply % 2 === 1 ? "." : "…"} ${sanToSpanish(san)}`;
}

const withoutInitial = (san: string) => (PIECE_KIND_BY_LETTER[san.charAt(0)] ? san.slice(1) : san);
const pieceGlyphOf = (san: string): string | null => PIECE_KIND_BY_LETTER[san.charAt(0)] ?? null;

export interface NotationHalfMove {
  label: string;
  glyph: string | null;
  quality: MoveQuality | null;
  /** Ply index this half-move leads to (1-based; step the board here on click). */
  ply: number;
}

export interface NotationRow {
  /** "12." or, when the row starts with Black's move, "12…". */
  number: string;
  /** Null only in the first row of a line that starts with Black to move. */
  white: NotationHalfMove | null;
  black: NotationHalfMove | null;
}

/**
 * Half-moves already played in the position a FEN describes: what the
 * numbering has to start counting from. The standard start gives 0.
 */
export function startPlyOfFen(fen: string): number {
  const [, turn, , , , fullmove] = fen.split(" ");
  const number = Number.parseInt(fullmove ?? "1", 10);
  return (Number.isFinite(number) && number > 0 ? number - 1 : 0) * 2 + (turn === "b" ? 1 : 0);
}

function halfMove(san: string, ply: number, quality: MoveQuality | null): NotationHalfMove {
  return { label: toSpanish(withoutInitial(san)), glyph: pieceGlyphOf(san), quality, ply };
}

/**
 * Groups a flat SAN list into numbered rows for the move-list panel.
 * `annotations` keys are `${moveNumber}${"w" | "b"}`, with the number as shown.
 *
 * `startPly` is how many half-moves the starting position already carries
 * (`startPlyOfFen`): a line that begins at move 44 with Black to move gets a
 * first row "44…" with no white half-move. The `ply` of each half-move is still
 * its index within the list (1-based), which is what steps the board.
 */
export function buildNotationRows(sans: string[], annotations?: MoveAnnotations, startPly = 0): NotationRow[] {
  const rows: NotationRow[] = [];
  let index = 0;
  while (index < sans.length) {
    const played = startPly + index;
    const moveNumber = Math.floor(played / 2) + 1;
    const blackFirst = played % 2 === 1;
    const blackIndex = blackFirst ? index : index + 1;
    rows.push({
      number: `${moveNumber}${blackFirst ? "…" : "."}`,
      white: blackFirst ? null : halfMove(sans[index] ?? "", index + 1, annotations?.[`${moveNumber}w`] ?? null),
      black:
        blackIndex < sans.length
          ? halfMove(sans[blackIndex] ?? "", blackIndex + 1, annotations?.[`${moveNumber}b`] ?? null)
          : null,
    });
    index = blackIndex + 1;
  }
  return rows;
}
