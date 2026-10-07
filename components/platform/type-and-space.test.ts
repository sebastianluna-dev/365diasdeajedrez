import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The platform's font sizes and spaces come from two scales, declared in the
// `:root` of platform.css: ten font sizes and twelve spaces, in real px. A
// stylesheet that writes a px of its own for either brings back the thirty
// sizes and the two dozen gaps the scales replaced; a `zoom` brings back the
// enlargement the steps already carry; and a font named in a stylesheet
// instead of read from a `--platform-font*` token is a font the tokens no
// longer decide. This reads the platform's stylesheets from disk and fails on
// the four.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The stylesheets drawn with the platform's tokens; the same list as the corners' rule. */
const PLATFORM_STYLES = ["app/(platform)", "app/(auth)", "components/platform", "components/auth", "components/chess"];

/** Font sizes off the scale, by file, with the value they keep and why. */
const TYPE_EXCEPTIONS: Record<string, { value: string; reason: string }> = {
  "components/chess/chess-board.comp.css": {
    value: "9px",
    reason: "the board's coordinates, drawn inside a square, where the smallest step (12px) crowds its corner",
  },
  "components/platform/sections/courses/lesson-view/lesson-outline.comp.css": {
    value: "18px",
    reason:
      "the course's and the chapters' names beside a lesson from 1536px: the large-screen step of --platform-type-lg, which the lesson's page does not take (platform-page_scale_base)",
  },
};

/** Fonts named instead of read from a `--platform-font*` token, by file, with the value they keep and why. */
const FONT_EXCEPTIONS: Record<string, { value: string; reason: string }> = {
  "components/chess/elo-table.comp.css": {
    value: "var(--font-gramatika), sans-serif",
    reason: "drawn only on the public site, which does not load platform.css, in the site's headline font",
  },
};

/** A `font-family` that reads one of the platform's font tokens, or inherits. */
const READS_A_FONT_TOKEN = /^(?:var\(--platform-font[a-z-]*\)|inherit)$/;

const COMMENT = /\/\*[\s\S]*?\*\//g;
const DECLARATION = /(?:^|[;{\s])(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+);/g;
const TYPE_PROPERTY = /^(?:font-size|--[a-z-]*font-size)$/;
const SPACE_PROPERTY = /^(?:(?:row-|column-)?gap|padding(?:-[a-z]+)*|margin(?:-[a-z]+)*)$/;
const PX = /-?\d*\.?\d+px/g;

/** A token of the scale, with the fallback it may carry for the public site. */
const SCALE_TOKEN = /var\(--platform-(?:type|space)-[a-z0-9-]+(?:,\s*-?\d+px)?\)/g;

function stylesheetsOf(directory: string): string[] {
  return readdirSync(join(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return stylesheetsOf(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const stylesheets = PLATFORM_STYLES.flatMap(stylesheetsOf);

type Declaration = { path: string; property: string; value: string };

const declarations: Declaration[] = stylesheets.flatMap((path) =>
  [...readFileSync(join(ROOT, path), "utf8").replace(COMMENT, "").matchAll(DECLARATION)].map((match) => ({
    path,
    property: match[1] ?? "",
    value: (match[2] ?? "").replace(/\s+/g, " ").trim(),
  })),
);

/** The parts of a shorthand, split on the spaces that are not inside a function. */
function partsOf(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value.replace(/\s*!important$/, "")) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === " " && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  return current ? [...parts, current] : parts;
}

describe("the platform's type and space", () => {
  it("are read from the stylesheets", () => {
    // A renamed folder, or a reading that broke, would leave the rules below watching nothing.
    expect(stylesheets.length).toBeGreaterThan(100);
    expect(declarations.filter(({ property }) => TYPE_PROPERTY.test(property)).length).toBeGreaterThan(400);
    expect(declarations.filter(({ property }) => SPACE_PROPERTY.test(property)).length).toBeGreaterThan(800);
  });

  it("write every font size as a token of the type scale", () => {
    const offScale = declarations
      .filter(({ property }) => TYPE_PROPERTY.test(property))
      .filter(({ path, value }) => {
        const left = value.replace(SCALE_TOKEN, "").match(PX) ?? [];
        const exception = TYPE_EXCEPTIONS[path];
        return left.length > 0 && !(exception && value === exception.value);
      })
      .map(({ path, property, value }) => `${path}: ${property}: ${value}`);
    expect(offScale).toEqual([]);
  });

  it("keep their list of exceptions true", () => {
    // An exception that is now on the scale, or whose file is gone, leaves the list.
    const stale = Object.entries(TYPE_EXCEPTIONS).filter(
      ([path, { value }]) =>
        !declarations.some(
          (declaration) =>
            declaration.path === path && TYPE_PROPERTY.test(declaration.property) && declaration.value === value,
        ),
    );
    expect(stale.map(([path]) => path)).toEqual([]);
  });

  it("write every space as a token of the space scale, a hairline aside", () => {
    // A part of 1px is a line and not a space; a px inside a function (a
    // calc() of geometry, a fallback) belongs to what it measures.
    const offScale = declarations
      .filter(({ property }) => SPACE_PROPERTY.test(property))
      .flatMap(({ path, property, value }) =>
        partsOf(value)
          .filter((part) => /^-?\d*\.?\d+px$/.test(part) && Math.abs(Number.parseFloat(part)) > 1)
          .map((part) => `${path}: ${property}: ${value} (${part})`),
      );
    expect(offScale).toEqual([]);
  });

  it("name no font of their own: they read a font token, or inherit", () => {
    const named = declarations
      .filter(({ property }) => property === "font-family")
      .filter(({ path, value }) => !READS_A_FONT_TOKEN.test(value) && FONT_EXCEPTIONS[path]?.value !== value)
      .map(({ path, value }) => `${path}: font-family: ${value}`);
    expect(named).toEqual([]);
  });

  it("keep their list of named fonts true", () => {
    // An exception that now reads a token, or whose file is gone, leaves the list.
    const stale = Object.entries(FONT_EXCEPTIONS).filter(
      ([path, { value }]) =>
        !declarations.some(
          (declaration) =>
            declaration.path === path && declaration.property === "font-family" && declaration.value === value,
        ),
    );
    expect(stale.map(([path]) => path)).toEqual([]);
  });

  it("are not enlarged by a zoom", () => {
    // The steps carry the enlargement the body's `zoom: 1.1` gave until 2026-10-02.
    const zoomed = declarations
      .filter(({ property }) => property === "zoom")
      .map(({ path, value }) => `${path}: zoom: ${value}`);
    expect(zoomed).toEqual([]);
  });
});
