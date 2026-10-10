import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADVENTURES } from "@/lib/adventure/adventures";
import { ADVENTURE_KEEPSAKES, ADVENTURE_PORTRAITS } from "./adventure-art.const";

// The art `npm run adventure:art` exports has to be all there for every
// adventure: the five SVGs of its scenery, a portrait for each rival and a
// keepsake drawing for each order. A rival added without a re-export fails
// here and not as an empty stamp on the map.

describe.each(ADVENTURES)("the art of «$title»", (adventure) => {
  it("has the scenery of the three layouts and the two miniatures, with the viewBox of the bleed", () => {
    for (const file of ["escritorio", "tableta", "movil", "miniatura-alta", "miniatura-ancha"]) {
      const path = `public/aventuras/${adventure.slug}/${file}.svg`;
      expect(existsSync(path), path).toBe(true);
      expect(readFileSync(path, "utf8")).toMatch(/^<svg [^>]*viewBox="[-\d. ]+"/);
    }
  });

  it("has a portrait for every rival and a keepsake drawing for every order", () => {
    for (const encounter of adventure.encounters) {
      expect(ADVENTURE_PORTRAITS[adventure.slug]?.[encounter.slug], encounter.slug).toBeTypeOf("function");
      expect(
        ADVENTURE_KEEPSAKES[adventure.slug]?.[encounter.order]?.viewBox,
        `keepsake ${encounter.order}`,
      ).toBeTruthy();
    }
  });

  it("keeps no layout's scenery without a bleed wider than its art", async () => {
    const { ADVENTURE_ART } = await import("@/lib/adventure/adventures");
    const art = ADVENTURE_ART[adventure.slug]!;
    for (const [file, layout] of [
      ["escritorio", art.desktop],
      ["tableta", art.tablet],
      ["movil", art.mobile],
    ] as const) {
      const [x, y, width, height] = /viewBox="([^"]+)"/
        .exec(readFileSync(`public/aventuras/${adventure.slug}/${file}.svg`, "utf8"))![1]!
        .split(" ")
        .map(Number);
      // The art's own box sits inside the image: the bleed is to the left, to the right and above.
      expect(x, file).toBeLessThan(0);
      expect(x! + width!, file).toBeGreaterThan(layout.width);
      expect(y! + height!, file).toBe(layout.height);
    }
  });
});
