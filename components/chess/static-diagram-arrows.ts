// The arrows a static diagram draws over its grid: a move as a filled shape
// in the grid's own coordinates (one unit per square), so the SVG scales with
// the board and needs no marker. Pure, so the shape is tested without a DOM.

export interface StaticDiagramArrow {
  /** The squares, "e2" → "e4". */
  from: string;
  to: string;
  /** What the arrow says: the move played (danger) or the one expected (success). */
  tone: "danger" | "success";
}

/** The centre of a square in grid units, from the side at the bottom. */
export function squareCenter(square: string, orientation: "white" | "black"): { x: number; y: number } | null {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  if (square.length !== 2 || file < 0 || file > 7 || !Number.isInteger(rank) || rank < 0 || rank > 7) return null;
  return orientation === "white" ? { x: file + 0.5, y: 7 - rank + 0.5 } : { x: 7 - file + 0.5, y: rank + 0.5 };
}

const SHAFT_HALF = 0.09;
const HEAD_LENGTH = 0.42;
const HEAD_HALF = 0.26;
/** The tip stops short of the centre, so the piece on the square stays readable. */
const TIP_MARGIN = 0.18;

/**
 * The polygon of an arrow from one square to another, as the `points` of an
 * SVG `<polygon>` over a `0 0 8 8` viewBox, or null when a square does not
 * exist or the two are the same.
 */
export function arrowPoints(
  arrow: Pick<StaticDiagramArrow, "from" | "to">,
  orientation: "white" | "black",
): string | null {
  const start = squareCenter(arrow.from, orientation);
  const end = squareCenter(arrow.to, orientation);
  if (!start || !end || (start.x === end.x && start.y === end.y)) return null;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  // The perpendicular, to give the shaft and the head their width.
  const px = -uy;
  const py = ux;
  const tipX = end.x - ux * TIP_MARGIN;
  const tipY = end.y - uy * TIP_MARGIN;
  const baseX = tipX - ux * HEAD_LENGTH;
  const baseY = tipY - uy * HEAD_LENGTH;
  const point = (x: number, y: number) => `${round(x)},${round(y)}`;
  return [
    point(start.x + px * SHAFT_HALF, start.y + py * SHAFT_HALF),
    point(baseX + px * SHAFT_HALF, baseY + py * SHAFT_HALF),
    point(baseX + px * HEAD_HALF, baseY + py * HEAD_HALF),
    point(tipX, tipY),
    point(baseX - px * HEAD_HALF, baseY - py * HEAD_HALF),
    point(baseX - px * SHAFT_HALF, baseY - py * SHAFT_HALF),
    point(start.x - px * SHAFT_HALF, start.y - py * SHAFT_HALF),
  ].join(" ");
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
