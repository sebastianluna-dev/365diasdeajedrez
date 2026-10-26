// Where the live layer of «El cuaderno del viajero» falls over a crop of its
// desktop art (`public/aventuras/cuaderno-del-viajero/escritorio.svg`) for the
// home page's window, ported from the owner's `AcadAventura2A`: the Club La
// Torre, with the seam walked up to Toñito Garza's stamp. The window is 800 ×
// 640 units; the art is drawn at 0.68 of its size, from (12, 4790) of its own
// units, which is (−484, −3284) in the window's.

/** The art's scale in the window, and the art's point at the window's top left. */
const SCALE = 0.68;
const ORIGIN = { x: 12, y: 4790 };
/** The art's viewBox starts at (−700, −40) and is 2600 × 7040. */
const ART = { x: -700, y: -40, width: 2600, height: 7040 };

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 640;

type Point = [number, number];

function at(x: number, y: number): Point {
  return [(x - ORIGIN.x) * SCALE, (y - ORIGIN.y) * SCALE];
}

const f = (n: number) => n.toFixed(1);

/** A Catmull-Rom curve through the art's waypoints, as cubic Béziers in the window's units. */
function smooth(points: Point[]): string {
  const p = points.map(([x, y]) => at(x, y));
  let d = `M${f(p[0]![0])} ${f(p[0]![1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i]!;
    const b = p[i]!;
    const c = p[i + 1]!;
    const e = p[i + 2] ?? c;
    d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(
      c[1] - (e[1] - b[1]) / 6,
    )} ${f(c[0])} ${f(c[1])}`;
  }
  return d;
}

/** The two strokes of an arrowhead at the end of a curve. */
function head(points: Point[]): string {
  const a = at(...points[points.length - 2]!);
  const b = at(...points[points.length - 1]!);
  const t = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const k = 9;
  return `M${f(b[0] - k * Math.cos(t - 0.5))} ${f(b[1] - k * Math.sin(t - 0.5))} L${f(b[0])} ${f(b[1])} L${f(
    b[0] - k * Math.cos(t + 0.5),
  )} ${f(b[1] - k * Math.sin(t + 0.5))}`;
}

/** A box of `w` × `h` centred on the art's point (x, y). */
function box(x: number, y: number, w: number, h: number) {
  const [cx, cy] = at(x, y);
  return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
}

const WALKED: Point[] = [
  [700, 7010],
  [690, 6880],
  [610, 6800],
  [470, 6770],
  [320, 6690],
  [255, 6550],
  [285, 6400],
  [420, 6315],
  [590, 6300],
  [710, 6260],
  [800, 6195],
  [860, 6050],
  [800, 5935],
  [640, 5880],
  [470, 5850],
  [330, 5765],
  [265, 5625],
  [400, 5560],
  [600, 5560],
  [800, 5560],
];
const AHEAD: Point[] = [
  [800, 5560],
  [960, 5520],
  [1050, 5400],
  [1060, 5150],
  [1045, 4900],
  [1010, 4720],
  [880, 4605],
  [640, 4525],
  [420, 4470],
  [330, 4385],
  [380, 4285],
  [560, 4230],
];
const HINT_ARROW: Point[] = [
  [921, 5423],
  [914, 5476],
  [890, 5506],
];
const NOTE_ARROW: Point[] = [
  [520, 4864],
  [482, 4900],
  [462, 4940],
];

const DONE = 118 * SCALE;
const NEXT = 146 * SCALE;
const KEEP = 104 * SCALE;
const PAGE = 280 * SCALE;
const leal = box(265, 5625, DONE, DONE);
const [tokenX, tokenY] = at(800 + 171, 5560 + 99);

export const MAP = {
  /** The CSS background that shows the crop: its size and position as percentages of the window. */
  background: {
    size: `${((ART.width * SCALE) / MAP_WIDTH) * 100}% auto`,
    position: `${(((ORIGIN.x - ART.x) * SCALE) / (ART.width * SCALE - MAP_WIDTH)) * 100}% ${
      (((ORIGIN.y - ART.y) * SCALE) / (ART.height * SCALE - MAP_HEIGHT)) * 100
    }%`,
  },
  seam: { tape: 30 * SCALE, walked: smooth(WALKED), ahead: smooth(AHEAD) },
  hintArrow: { line: smooth(HINT_ARROW), head: head(HINT_ARROW) },
  noteArrow: { line: smooth(NOTE_ARROW), head: head(NOTE_ARROW) },
  leal: { ...leal, rotate: 2.5 },
  tono: { ...box(800, 5560, NEXT, NEXT), rotate: -3 },
  keepsake: { ...box(176, 5668, KEEP, KEEP * 0.66), rotate: -9 },
  page: { ...box(290, 4900, PAGE, PAGE * 0.74), rotate: -2.5 },
  stars: { x: leal.cx - 34, y: leal.cy + DONE / 2 + 6 },
  token: { x: tokenX, y: tokenY },
  hint: box(971, 5427, 0, 0),
  note: box(600, 4850, 0, 0),
};
