import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The platform reflows at five widths, Tailwind's: 640, 768, 1024, 1280 and
// 1536px. Its stylesheets had drifted into nineteen (520, 620, 720, 900,
// 1080…), each chosen for one screen, so two screens side by side changed
// shape at different widths. A width query is written in the range syntax
// (`width < 1024px` below a breakpoint, `width >= 1536px` from one); a height
// is not a breakpoint and is free. This reads the platform's stylesheets and
// fails on any other width.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The stylesheets drawn with the platform's tokens; the same list as the corners' rule. */
const PLATFORM_STYLES = [
  "app/(platform)",
  "app/(auth)",
  "components/platform",
  "components/auth",
  "components/chess",
  "components/adventure",
];

/** Tailwind's breakpoints: sm, md, lg, xl, 2xl. */
const BREAKPOINTS = new Set([640, 768, 1024, 1280, 1536]);

const COMMENT = /\/\*[\s\S]*?\*\//g;
const MEDIA = /@media\s*([^{]+)\{/g;

function stylesheetsOf(directory: string): string[] {
  return readdirSync(join(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return stylesheetsOf(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const queries = PLATFORM_STYLES.flatMap(stylesheetsOf).flatMap((path) =>
  [...readFileSync(join(ROOT, path), "utf8").replace(COMMENT, "").matchAll(MEDIA)].map((match) => ({
    path,
    query: (match[1] ?? "").replace(/\s+/g, " ").trim(),
  })),
);

describe("the platform's breakpoints", () => {
  it("are read from the stylesheets", () => {
    // A renamed folder would leave the rule below watching nothing.
    expect(queries.filter(({ query }) => /width/.test(query)).length).toBeGreaterThan(50);
  });

  it("are Tailwind's five, written in the range syntax", () => {
    const wrong = queries.flatMap(({ path, query }) => {
      const widths = [...query.matchAll(/\((?:(?:max|min)-width\s*:|width\s*[<>]=?)\s*(\d+)px\)/g)];
      return widths
        .filter((match) => !BREAKPOINTS.has(Number(match[1])) || !/^\(width [<>]=? /.test(match[0]))
        .map((match) => `${path}: @media ${query} (${match[0]})`);
    });
    expect(wrong).toEqual([]);
  });
});
