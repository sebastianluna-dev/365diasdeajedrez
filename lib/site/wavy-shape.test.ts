import { describe, expect, it } from "vitest";
import { squareClipShape, wavyClipShape, wavyPath } from "./wavy-shape";

const COOKIE = { cx: 264, cy: 264, radius: 248, amplitude: 16, lobes: 9 };

const commandsOf = (shape: string) => shape.split(",").length;

describe("the wavy shapes", () => {
  it("draw every outline with the same 181 points, so the cookie can morph into the board", () => {
    expect(commandsOf(wavyClipShape(COOKIE, 528))).toBe(commandsOf(squareClipShape(528)));
    expect(wavyPath(COOKIE).match(/[ML]/g)).toHaveLength(181);
  });

  it("measure the clip in percentages of its box", () => {
    const square = squareClipShape(528);
    expect(square.startsWith("shape(from 100.00% 50.00%, line to")).toBe(true);
    expect(square).not.toMatch(/px/);
    expect(square.endsWith(", close)")).toBe(true);
  });

  it("stay inside the box when the lobes swell to their widest", () => {
    const values = [...wavyClipShape(COOKIE, 528).matchAll(/(-?\d+\.\d+)%/g)].map(([, value]) => Number(value));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThanOrEqual(100);
  });
});
