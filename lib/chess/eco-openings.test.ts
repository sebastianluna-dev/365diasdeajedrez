import { describe, expect, it } from "vitest";
import { ECO_OPENING_RUNS, openingOfEco } from "./eco-openings";

/** The 500 codes, A00 to E99, in order. */
const ALL_CODES = [..."ABCDE"].flatMap((letter) =>
  Array.from({ length: 100 }, (_, number) => `${letter}${String(number).padStart(2, "0")}`),
);

describe("openingOfEco", () => {
  it("names the opening of the codes a player knows", () => {
    expect(openingOfEco("D94")).toBe("Defensa Grünfeld");
    expect(openingOfEco("B90")).toBe("Defensa Siciliana");
    expect(openingOfEco("C65")).toBe("Apertura Española");
    expect(openingOfEco("C41")).toBe("Defensa Philidor");
    expect(openingOfEco("E97")).toBe("Defensa India de Rey");
    expect(openingOfEco("A00")).toBe("Apertura irregular");
  });

  it("tells apart the openings that share a family's neighbourhood", () => {
    expect(openingOfEco("D31")).toBe("Gambito de Dama rehusado");
    expect(openingOfEco("D32")).toBe("Defensa Tarrasch");
    expect(openingOfEco("D43")).toBe("Defensa Semieslava");
    expect(openingOfEco("C51")).toBe("Gambito Evans");
    expect(openingOfEco("C53")).toBe("Apertura Italiana");
    expect(openingOfEco("D79")).toBe("Defensa Neogrünfeld");
    expect(openingOfEco("D80")).toBe("Defensa Grünfeld");
  });

  it("reads a code whatever its case and the spaces around it", () => {
    expect(openingOfEco(" d94 ")).toBe("Defensa Grünfeld");
  });

  it("says nothing for what is not one of the 500 codes", () => {
    expect(openingOfEco("")).toBeUndefined();
    expect(openingOfEco("?")).toBeUndefined();
    expect(openingOfEco("F00")).toBeUndefined();
    expect(openingOfEco("B9")).toBeUndefined();
    expect(openingOfEco("B900")).toBeUndefined();
  });

  it("gives every code exactly one opening", () => {
    const misses = ALL_CODES.filter(
      (code) => ECO_OPENING_RUNS.filter(([from, to]) => from <= code && code <= to).length !== 1,
    );
    expect(misses).toEqual([]);
  });

  it("keeps its runs in order, each from a code to a later or the same one", () => {
    const bounds = ECO_OPENING_RUNS.flatMap(([from, to]) => [from, to]);
    expect(bounds).toEqual([...bounds].sort());
    expect(bounds.every((code) => ALL_CODES.includes(code))).toBe(true);
  });
});
