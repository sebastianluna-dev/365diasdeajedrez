import { describe, expect, it } from "vitest";
import { alternativesAt, mainLineAnchor, mainLineOf } from "./notation-line";
import { parsePgnTree } from "./pgn-tree";

const tree = parsePgnTree("1. e4 e5 (1... c5 2. Nf3 (2. c3) d6) 2. Nf3 Nc6 *")!;
const pathOf = (...sanLine: string[]) => {
  let children = tree.children;
  let path = "";
  for (const san of sanLine) {
    const node = children.find((child) => child.san === san)!;
    path = node.path;
    children = node.children;
  }
  return path;
};

describe("mainLineOf", () => {
  it("is each move's main continuation, from the start", () => {
    expect(mainLineOf(tree).map((node) => node.san)).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("is empty for a game with no moves", () => {
    expect(mainLineOf(parsePgnTree("*")!)).toEqual([]);
  });
});

describe("mainLineAnchor", () => {
  it("is the path itself on the main line", () => {
    expect(mainLineAnchor(pathOf("e4", "e5"))).toBe(pathOf("e4", "e5"));
    expect(mainLineAnchor("")).toBe("");
  });

  it("is the main-line move a variation branches from", () => {
    expect(mainLineAnchor(pathOf("e4", "c5"))).toBe(pathOf("e4"));
    expect(mainLineAnchor(pathOf("e4", "c5", "Nf3", "d6"))).toBe(pathOf("e4"));
    expect(mainLineAnchor(pathOf("e4", "c5", "c3"))).toBe(pathOf("e4"));
  });

  it("is the start for an alternative to the first move", () => {
    expect(mainLineAnchor("1")).toBe("");
  });
});

describe("alternativesAt", () => {
  it("lists the moves offered instead of the next one", () => {
    expect(alternativesAt(tree, pathOf("e4")).map((node) => node.san)).toEqual(["c5"]);
    expect(alternativesAt(tree, pathOf("e4", "c5")).map((node) => node.san)).toEqual(["c3"]);
  });

  it("is empty where the author offers none", () => {
    expect(alternativesAt(tree, "")).toEqual([]);
    expect(alternativesAt(tree, pathOf("e4", "e5"))).toEqual([]);
  });
});
