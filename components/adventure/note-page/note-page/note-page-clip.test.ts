import { describe, expect, it } from "vitest";
import { pageClip } from "./note-page-clip";

/** The y of each bottom point of a clip, in percent. */
const bottomOf = (clip: string) =>
  [...clip.matchAll(/(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%/g)].slice(2).map((match) => Number(match[2]));

describe("pageClip", () => {
  it("opens a whole sheet to its full height and folds it to the top half", () => {
    expect(new Set(bottomOf(pageClip(true, false)))).toEqual(new Set([100]));
    expect(new Set(bottomOf(pageClip(false, false)))).toEqual(new Set([52]));
  });

  it("tears the bottom of an open sheet that was torn out, between 82 and 95 %", () => {
    const edge = bottomOf(pageClip(true, true));
    expect(edge.length).toBe(45);
    for (const y of edge) {
      expect(y).toBeGreaterThan(82);
      expect(y).toBeLessThan(96);
    }
    expect(new Set(edge).size).toBeGreaterThan(10);
  });

  it("is the same polygon every time", () => {
    expect(pageClip(true, true)).toBe(pageClip(true, true));
    expect(pageClip(true, true)).not.toBe(pageClip(true, false));
  });

  it("folds a torn sheet as straight as any other: the fold has no ragged edge", () => {
    expect(pageClip(false, true)).toBe(pageClip(false, false));
  });
});
