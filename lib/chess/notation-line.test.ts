import { describe, expect, it } from "vitest";
import { alternativesAt, lineThrough } from "./notation-line";
import { parsePgnTree } from "./pgn-tree";

const tree = parsePgnTree("1. e4 e5 (1... c5 2. Nf3 (2. c3) d6) 2. Nf3 Nc6 *")!;
const sans = (path: string) => lineThrough(tree, path).map((node) => node.san);
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

describe("lineThrough", () => {
  it("is the main line from the initial position", () => {
    expect(sans("")).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("follows the main line on from a move of it", () => {
    expect(sans(pathOf("e4", "e5"))).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("is the variation, from the start, once a move of it is on the board", () => {
    expect(sans(pathOf("e4", "c5"))).toEqual(["e4", "c5", "Nf3", "d6"]);
    expect(sans(pathOf("e4", "c5", "c3"))).toEqual(["e4", "c5", "c3"]);
  });

  it("is empty on a broken path", () => {
    expect(lineThrough(tree, "9.9")).toEqual([]);
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
