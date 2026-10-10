import { describe, expect, it } from "vitest";
import { ADVENTURE_ART } from "./adventures";
import {
  arrowPath,
  pathData,
  pathSegments,
  pointAtLength,
  sampleSegments,
  seamOf,
  zoneAt,
  type Point,
} from "./map-geometry";

// The seam is the one place the live layer does arithmetic: where the
// stitches stop, where the needle rests, which marks are printed. These tests
// keep it faithful to the path of each layout.

const ART = ADVENTURE_ART["cuaderno-del-viajero"]!;
const LAYOUTS = { desktop: ART.desktop, tablet: ART.tablet, mobile: ART.mobile } as const;

describe("the path", () => {
  const points: Point[] = [
    [0, 0],
    [100, 0],
    [100, 100],
  ];

  it("has a segment for each gap between waypoints and passes through every waypoint", () => {
    const segments = pathSegments(points);
    expect(segments).toHaveLength(2);
    expect(segments[0]!.from).toEqual([0, 0]);
    expect(segments[0]!.to).toEqual([100, 0]);
    expect(segments[1]!.to).toEqual([100, 100]);
    expect(pathData(segments)).toMatch(/^M0 0C[\d. -]+C[\d. -]+$/);
    expect(pathData([])).toBe("");
  });

  it("is sampled with a growing arc length and found again by it", () => {
    const samples = sampleSegments(pathSegments(points), 20);
    const lengths = samples.map((sample) => sample.length);
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    const total = lengths[lengths.length - 1]!;
    expect(total).toBeGreaterThan(200);
    expect(pointAtLength(samples, 0)).toMatchObject({ x: 0, y: 0 });
    const end = pointAtLength(samples, total);
    expect(end.x).toBeCloseTo(100, 5);
    expect(end.y).toBeCloseTo(100, 5);
  });
});

describe.each(Object.entries(LAYOUTS))("the seam of the %s layout", (_name, layout) => {
  it("sews up to the available stamp and leaves the rest in pencil", () => {
    const seam = seamOf(layout, 5);
    const stop = layout.path.find((p) => p[2] === 5)!;
    expect(seam.walked.startsWith(`M${layout.path[0]![0]} ${layout.path[0]![1]}`)).toBe(true);
    // The walked stretch ends on the stamp, and the pencil starts there.
    expect(seam.walked.endsWith(`${stop[0]} ${stop[1]}`)).toBe(true);
    expect(seam.ahead.startsWith(`M${stop[0]} ${stop[1]}`)).toBe(true);
    expect(seam.all.length).toBeGreaterThan(seam.walked.length);
  });

  it("has nothing walked at the start of the path's first stamp and everything when complete", () => {
    const first = layout.path.find((p) => p[2] === 1)!;
    expect(seamOf(layout, 1).walked.endsWith(`${first[0]} ${first[1]}`)).toBe(true);
    const complete = seamOf(layout, null);
    expect(complete.ahead).toBe("");
    expect(complete.walked).toBe(complete.all);
    expect(complete.marks.every((mark) => mark.isWalked)).toBe(true);
  });

  it("prints marks only clear of the stamps, walked ones before the available stamp", () => {
    const seam = seamOf(layout, 6);
    const stops = layout.path.filter((p) => p[2] !== undefined);
    expect(seam.marks.length).toBeGreaterThan(10);
    for (const mark of seam.marks) {
      for (const stop of stops)
        expect(Math.hypot(stop[0] - mark.x, stop[1] - mark.y)).toBeGreaterThanOrEqual(layout.seam.clearance);
    }
    const walked = seam.marks.filter((mark) => mark.isWalked);
    // The path climbs: what is walked lies below (a larger y than) what is ahead.
    expect(Math.min(...walked.map((mark) => mark.y))).toBeGreaterThan(Math.min(...seam.marks.map((mark) => mark.y)));
  });

  it("rests the needle ahead of the available stamp, on the page", () => {
    const stop = layout.path.find((p) => p[2] === 5)!;
    const { needle } = seamOf(layout, 5);
    expect(needle.y).toBeLessThan(stop[1]);
    expect(needle.x).toBeGreaterThan(0);
    expect(needle.x).toBeLessThan(layout.width);
    expect(needle.thread.startsWith("M")).toBe(true);
  });
});

describe("the zones", () => {
  it("find the band a y falls in, and the last one past the end", () => {
    expect(zoneAt(ART.desktop, 6500).zone).toBe("plaza");
    expect(zoneAt(ART.desktop, 100).zone).toBe("palacio");
    expect(zoneAt(ART.desktop, 99999).zone).toBe("plaza");
  });
});

describe("arrowPath", () => {
  it("is the curve and the two strokes of the head, which end on the last point", () => {
    const d = arrowPath(
      [
        [0, 0],
        [50, 0],
        [100, 0],
      ],
      10,
    );
    expect(d.startsWith("M0 0C")).toBe(true);
    // The head: from a point behind the tip, to the tip, to a point behind the tip on the other side.
    expect(d).toMatch(/M91\.2 -4\.8L100 0L91\.2 4\.8$/);
  });
});
