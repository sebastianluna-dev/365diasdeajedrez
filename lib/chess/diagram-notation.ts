import { parseFen } from "chessops/fen";

// A diagram as a sliver of PGN (2026-10-19): the position in its [FEN] tag,
// and the caption, the circles ([%csl]) and the arrows ([%cal]) in the one
// comment of a game with no moves. Any PGN reader draws it the same way
// (lichess, ChessBase), and it is stored as the one string it is.
//
//   [SetUp "1"]
//   [FEN "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1"]
//
//   {El rey sale por c7. [%csl Rd8] [%cal Gb8c7,Gc4b4]} *
//
// The side at the bottom is the side to move, as diagrams are read («juegan
// las negras» is drawn from Black's side); an [Orientation] tag turns it
// round when the teacher wants the other one.

export type DiagramColor = "green" | "red" | "blue" | "yellow";

export interface DiagramCircle {
  square: string;
  color: DiagramColor;
}

export interface DiagramArrow {
  from: string;
  to: string;
  color: DiagramColor;
}

export interface Diagram {
  /** A whole FEN: the placement and the side to move matter; the rest is filler. */
  fen: string;
  orientation: "white" | "black";
  caption: string;
  circles: DiagramCircle[];
  arrows: DiagramArrow[];
}

const LETTER_BY_COLOR: Record<DiagramColor, string> = { green: "G", red: "R", blue: "B", yellow: "Y" };
const COLOR_BY_LETTER: Record<string, DiagramColor> = { G: "green", R: "red", B: "blue", Y: "yellow" };
const SQUARE = /^[a-h][1-8]$/;

/** The side to move of a FEN: its second field. */
function turnOf(fen: string): "white" | "black" {
  return fen.trim().split(/\s+/)[1] === "b" ? "black" : "white";
}

/** A caption a PGN comment can hold: no braces, no command of its own, one line. */
function cleanCaption(caption: string): string {
  return caption
    .replace(/[{}]/g, "")
    .replace(/\[%[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The diagram as the PGN that stores it. */
export function writeDiagramPgn(diagram: Diagram): string {
  const tags = [`[SetUp "1"]`, `[FEN "${diagram.fen.trim()}"]`];
  if (diagram.orientation !== turnOf(diagram.fen)) tags.push(`[Orientation "${diagram.orientation}"]`);
  const circles = diagram.circles.map((circle) => `${LETTER_BY_COLOR[circle.color]}${circle.square}`);
  const arrows = diagram.arrows.map((arrow) => `${LETTER_BY_COLOR[arrow.color]}${arrow.from}${arrow.to}`);
  const comment = [
    cleanCaption(diagram.caption),
    circles.length > 0 ? `[%csl ${circles.join(",")}]` : "",
    arrows.length > 0 ? `[%cal ${arrows.join(",")}]` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `${tags.join("\n")}\n\n${comment ? `{${comment}} ` : ""}*`;
}

/** The entries of every `[%<command> …]` in a comment, split on their commas. */
function commandEntries(comment: string, command: string): string[] {
  return [...comment.matchAll(new RegExp(`\\[%${command} ([^\\]]*)\\]`, "g"))].flatMap((match) =>
    (match[1] ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

/**
 * The diagram a PGN stores, or null when it holds no valid position. A shape
 * with an unknown colour or a square off the board is dropped, not the whole
 * diagram: what a hand-written PGN gets wrong costs only that mark.
 */
export function readDiagramPgn(pgn: string): Diagram | null {
  const fen = /\[FEN "([^"]+)"\]/.exec(pgn)?.[1]?.trim();
  if (!fen || parseFen(fen).isErr) return null;
  const orientationTag = /\[Orientation "(white|black)"\]/i.exec(pgn)?.[1]?.toLowerCase();
  const comment = /\{([^}]*)\}/.exec(pgn)?.[1] ?? "";

  const circles = commandEntries(comment, "csl").flatMap((entry): DiagramCircle[] => {
    const color = COLOR_BY_LETTER[entry.charAt(0)];
    const square = entry.slice(1, 3);
    return color && entry.length === 3 && SQUARE.test(square) ? [{ square, color }] : [];
  });
  const arrows = commandEntries(comment, "cal").flatMap((entry): DiagramArrow[] => {
    const color = COLOR_BY_LETTER[entry.charAt(0)];
    const from = entry.slice(1, 3);
    const to = entry.slice(3, 5);
    return color && entry.length === 5 && SQUARE.test(from) && SQUARE.test(to) && from !== to
      ? [{ from, to, color }]
      : [];
  });

  return {
    fen,
    orientation: orientationTag === "white" || orientationTag === "black" ? orientationTag : turnOf(fen),
    caption: cleanCaption(comment),
    circles,
    arrows,
  };
}
