import type { AdventureLayout } from "@/lib/adventure/adventure.types";

// The geometry of the map's live layer, ported from the mockup (`camino`,
// `marcas`, `colocarAguja`): the path is a Catmull-Rom spline through the
// layout's waypoints, kept as segments so it can be split at a waypoint and
// keep its tangent — the seam is sewn up to the stamp that is available and
// the rest is drawn in pencil. Everything is pure and in the art's own units;
// the components only turn it into attributes.

export type Point = readonly [x: number, y: number];

/** One cubic Bézier of the path, from waypoint `from` to waypoint `to`. */
export interface PathSegment {
  from: Point;
  c1: Point;
  c2: Point;
  to: Point;
}

/** A sampled point of the path: where it is, how far along, in which segment. */
export interface PathSample {
  x: number;
  y: number;
  /** Arc length from the start of the path. */
  length: number;
  segment: number;
}

const round = (value: number) => Math.round(value * 10) / 10;
const pair = (point: Point) => `${round(point[0])} ${round(point[1])}`;

/** The Catmull-Rom spline through `points`, one cubic Bézier per gap. */
export function pathSegments(points: readonly Point[], tension = 1): PathSegment[] {
  const last = points.length - 1;
  const at = (index: number): Point => points[Math.max(0, Math.min(last, index))]!;
  const k = tension / 6;
  return points.slice(0, -1).map((_, index) => {
    const before = at(index - 1);
    const from = at(index);
    const to = at(index + 1);
    const after = at(index + 2);
    return {
      from,
      c1: [from[0] + (to[0] - before[0]) * k, from[1] + (to[1] - before[1]) * k],
      c2: [to[0] - (after[0] - from[0]) * k, to[1] - (after[1] - from[1]) * k],
      to,
    };
  });
}

/** The SVG path data of some segments (empty for none). */
export function pathData(segments: readonly PathSegment[]): string {
  const first = segments[0];
  if (!first) return "";
  return `M${pair(first.from)}${segments.map((s) => `C${pair(s.c1)} ${pair(s.c2)} ${pair(s.to)}`).join("")}`;
}

function bezierAt(segment: PathSegment, t: number): Point {
  const m = 1 - t;
  const weights = [m * m * m, 3 * m * m * t, 3 * m * t * t, t * t * t];
  const controls = [segment.from, segment.c1, segment.c2, segment.to];
  return [
    controls.reduce((sum, c, i) => sum + weights[i]! * c[0], 0),
    controls.reduce((sum, c, i) => sum + weights[i]! * c[1], 0),
  ];
}

/** The path sampled `steps` times per segment, with the arc length reached at each sample. */
export function sampleSegments(segments: readonly PathSegment[], steps = 40): PathSample[] {
  const samples: PathSample[] = [];
  let length = 0;
  let previous: Point | null = null;
  segments.forEach((segment, index) => {
    for (let step = index === 0 ? 0 : 1; step <= steps; step += 1) {
      const point = bezierAt(segment, step / steps);
      if (previous) length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
      samples.push({ x: point[0], y: point[1], length, segment: index });
      previous = point;
    }
  });
  return samples;
}

/** The point at an arc length of the sampled path, and the direction of the path there in degrees. */
export function pointAtLength(samples: readonly PathSample[], length: number): { x: number; y: number; angle: number } {
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (samples[middle]!.length < length) low = middle;
    else high = middle;
  }
  const a = samples[low]!;
  const b = samples[high]!;
  const t = b.length > a.length ? (length - a.length) / (b.length - a.length) : 0;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
}

/** The small marks printed along the tape: arrows, a star, a pawn and a knight, in the mockup's order. */
const MARK_KINDS = ["arrow", "arrow", "pawn", "arrow", "arrow", "star", "arrow", "arrow", "knight"] as const;
export type MarkKind = (typeof MARK_KINDS)[number];

export interface PathMark {
  x: number;
  y: number;
  /** Direction of the path there, in degrees. */
  angle: number;
  kind: MarkKind;
  /** On the stretch already walked: it is printed in brick, the rest in grey. */
  isWalked: boolean;
}

export interface Needle {
  /** Where its point rests, how it is turned in degrees, and its eye (where the thread comes out). */
  x: number;
  y: number;
  rotation: number;
  scale: number;
  /** The thread from the stamp it left to the needle's eye. */
  thread: string;
}

/** What the live layer draws of the path, for a layout and the stamp that is available. */
export interface Seam {
  /** The whole path. */
  all: string;
  /** From the start to the available stamp: sewn. */
  walked: string;
  /** From the available stamp on: in pencil. */
  ahead: string;
  marks: PathMark[];
  needle: Needle;
}

/**
 * The seam of a layout when `currentOrder` is the available encounter (null
 * when the adventure is complete: everything is walked and the needle rests at
 * the end). An order that is not on the path leaves nothing walked.
 */
export function seamOf(layout: AdventureLayout, currentOrder: number | null): Seam {
  const points: Point[] = layout.path.map((stop) => [stop[0], stop[1]]);
  const segments = pathSegments(points);
  const samples = sampleSegments(segments);
  const total = samples[samples.length - 1]!.length;
  const stopIndex = currentOrder === null ? -1 : layout.path.findIndex((stop) => stop[2] === currentOrder);
  const walkedSegments = currentOrder === null ? segments.length : Math.max(stopIndex, 0);
  const lengthAt = (index: number) => samples.find((sample) => sample.segment === index)?.length ?? total;
  const walkedLength = walkedSegments >= segments.length ? total : lengthAt(walkedSegments);

  const stitch = layout.seam.stitch;
  const stops = layout.path.filter((stop) => stop[2] !== undefined);
  const marks: PathMark[] = [];
  let count = 0;
  for (let length = stitch * 2.5; length < total - stitch; length += stitch * 4) {
    count += 1;
    const spot = pointAtLength(samples, length);
    if (stops.some((stop) => Math.hypot(stop[0] - spot.x, stop[1] - spot.y) < layout.seam.clearance)) continue;
    marks.push({
      x: round(spot.x),
      y: round(spot.y),
      angle: round(spot.angle),
      kind: MARK_KINDS[count % MARK_KINDS.length]!,
      isWalked: length <= walkedLength,
    });
  }

  const tip = pointAtLength(samples, Math.min(total - 10, walkedLength + layout.needle.step));
  const rotation = tip.angle + 180 + layout.needle.tilt;
  const radians = (rotation * Math.PI) / 180;
  const eye: Point = [
    tip.x + Math.cos(radians) * 90 * layout.needle.scale,
    tip.y + Math.sin(radians) * 90 * layout.needle.scale,
  ];
  const from = pointAtLength(samples, walkedLength);
  const needle: Needle = {
    x: round(tip.x),
    y: round(tip.y),
    rotation: round(rotation),
    scale: layout.needle.scale,
    thread: `M${pair([from.x, from.y])}Q${pair([(from.x + eye[0]) / 2 + 20, (from.y + eye[1]) / 2 + 24])} ${pair(eye)}`,
  };

  return {
    all: pathData(segments),
    walked: pathData(segments.slice(0, walkedSegments)),
    ahead: pathData(segments.slice(walkedSegments)),
    marks,
    needle,
  };
}

/** The zone of the layout a y of the art falls in: the last one for anything past the end. */
export function zoneAt(layout: AdventureLayout, y: number): AdventureLayout["zones"][number] {
  return layout.zones.find((band) => y >= band.from && y < band.to) ?? layout.zones[layout.zones.length - 1]!;
}

/**
 * A hand-drawn arrow through `points`: the smooth curve and, at its end, the
 * two strokes of the head (`head` long, opened 0.5 rad each side), as one path.
 */
export function arrowPath(points: readonly Point[], head = 10): string {
  const curve = pathData(pathSegments(points));
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  if (!a || !b) return curve;
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const wing = (spread: number): Point => [
    b[0] - Math.cos(angle + spread) * head,
    b[1] - Math.sin(angle + spread) * head,
  ];
  return `${curve}M${pair(wing(0.5))}L${pair(b)}L${pair(wing(-0.5))}`;
}
