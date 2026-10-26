// The wavy shapes of the site's new look (Material 3 Expressive's «cookie»
// and «clover»): a circle whose radius swells and shrinks `lobes` times
// around it. The canvas computes them in each mock-up's `renderVals`; the site
// computes the same points here, once, on the server.
//
// Every outline is drawn with the same 181 points (one every 2°), so the hero
// can morph the cookie into the square board: the browser interpolates two
// `shape()`s only when they have the same commands.

/** One point every 2°, the first repeated at 360° to close the outline. */
const STEP_DEGREES = 2;

interface Wave {
  /** The centre, in the outline's own units. */
  cx: number;
  cy: number;
  /** The mean radius. */
  radius: number;
  /** How far each lobe swells beyond it (and dips under it). */
  amplitude: number;
  /** How many lobes go round. */
  lobes: number;
  /** The turn of the lobes, in radians: a fraction of one lobe spins the shape. */
  turn?: number;
}

function points(wave: Wave): [number, number][] {
  const out: [number, number][] = [];
  for (let degrees = 0; degrees <= 360; degrees += STEP_DEGREES) {
    const t = (degrees * Math.PI) / 180;
    const r = wave.radius + wave.amplitude * Math.cos(wave.lobes * (t + (wave.turn ?? 0)));
    out.push([wave.cx + r * Math.cos(t), wave.cy + r * Math.sin(t)]);
  }
  return out;
}

/** The outline as an SVG path (`d`), in the units of the SVG's `viewBox`. */
export function wavyPath(wave: Wave): string {
  const d = points(wave)
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  return `${d} Z`;
}

/**
 * The outline as a CSS `shape()` for `clip-path`, in percentages of the box
 * it clips, for a box `size` units wide and tall: unlike `path()`, which is
 * in pixels, it follows the box as the page narrows.
 */
export function wavyClipShape(wave: Wave, size: number): string {
  return shapeOf(points(wave), size);
}

/**
 * The whole square, `size` units wide, drawn with the same 181 points as a
 * wavy outline centred in it: each point is where its ray meets the square's
 * edge, so the cookie opens into the board along the same rays.
 */
export function squareClipShape(size: number): string {
  const half = size / 2;
  const out: [number, number][] = [];
  for (let degrees = 0; degrees <= 360; degrees += STEP_DEGREES) {
    const t = (degrees * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const k = half / Math.max(Math.abs(c), Math.abs(s));
    out.push([half + k * c, half + k * s]);
  }
  return shapeOf(out, size);
}

function shapeOf(outline: [number, number][], size: number): string {
  const percent = (value: number) => `${((value / size) * 100).toFixed(2)}%`;
  const [first, ...rest] = outline;
  if (!first) return "none";
  const lines = rest.map(([x, y]) => `line to ${percent(x)} ${percent(y)}`).join(", ");
  return `shape(from ${percent(first[0])} ${percent(first[1])}, ${lines}, close)`;
}
