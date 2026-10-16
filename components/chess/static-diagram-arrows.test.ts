import { describe, expect, it } from "vitest";
import { arrowPoints, squareCenter } from "./static-diagram-arrows";

describe("squareCenter", () => {
  it("a1 is the bottom-left square from White and the top-right one from Black", () => {
    expect(squareCenter("a1", "white")).toEqual({ x: 0.5, y: 7.5 });
    expect(squareCenter("a1", "black")).toEqual({ x: 7.5, y: 0.5 });
    expect(squareCenter("h8", "white")).toEqual({ x: 7.5, y: 0.5 });
  });

  it("nothing for a square that does not exist", () => {
    expect(squareCenter("i1", "white")).toBeNull();
    expect(squareCenter("a9", "white")).toBeNull();
    expect(squareCenter("e", "white")).toBeNull();
  });
});

describe("arrowPoints", () => {
  it("draws a shape of seven points from the first square towards the second, its tip short of the centre", () => {
    const points = arrowPoints({ from: "e2", to: "e4" }, "white")!.split(" ");
    expect(points).toHaveLength(7);
    // The tip: on the e-file, 0.18 below the centre of e4 (y = 4.5).
    expect(points[3]).toBe("4.5,4.68");
    // The shaft starts beside the centre of e2 (4.5, 6.5).
    expect(points[0]).toBe("4.59,6.5");
    expect(points[6]).toBe("4.41,6.5");
  });

  it("mirrors with the orientation", () => {
    const fromWhite = arrowPoints({ from: "e2", to: "e4" }, "white")!.split(" ");
    const fromBlack = arrowPoints({ from: "e2", to: "e4" }, "black")!.split(" ");
    expect(fromBlack[3]).toBe("3.5,3.32");
    expect(fromWhite[3]).not.toBe(fromBlack[3]);
  });

  it("is null for the same square twice or a square that does not exist", () => {
    expect(arrowPoints({ from: "e2", to: "e2" }, "white")).toBeNull();
    expect(arrowPoints({ from: "e2", to: "z9" }, "white")).toBeNull();
  });
});
