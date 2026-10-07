import { describe, expect, it } from "vitest";
import { foldForSearch } from "./fold-for-search";

describe("foldForSearch", () => {
  it("drops case and accents, so what is typed finds what is shown", () => {
    expect(foldForSearch("  Garri Kaspárov ")).toBe("garri kasparov");
    expect(foldForSearch("ÑANDÚ")).toBe("nandu");
  });

  it("leaves the rest as it is", () => {
    expect(foldForSearch("1.e4 c5 – Najdorf")).toBe("1.e4 c5 – najdorf");
  });
});
