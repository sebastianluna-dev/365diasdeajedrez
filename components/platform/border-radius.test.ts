import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The platform rounds a corner in one of a few fixed ways: 8px, 4px on a
// control too small for 8, all the way, and — for the new design system,
// Material 3 (2026-10-22) — 12px for a card, 16px for a panel or an extended
// button and 24px for a block that stands out inside a panel. None of them
// decides a radius of its own, so a stylesheet never has to. This reads every
// stylesheet of the platform and fails on the first value out of the list.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Where the platform's stylesheets live: its pages, its components and the
 * access pages. The chess pieces are everybody's, but they are drawn with the
 * platform's tokens and are what a lesson is made of, so they follow its rule.
 */
const PLATFORM_STYLES = ["app/(platform)", "app/(auth)", "components/platform", "components/auth", "components/chess"];

/**
 * Material 3's three larger corners (2026-10-22), each for one kind of thing
 * on the pages moved to the new design system: 12px a card (`MyCourseCard`),
 * 16px the white panel of `.platform-workspace`, an extended button and a
 * picture inside a block, 24px a block that stands out inside the panel
 * («Sigue donde ibas», the streak's band).
 */
const MATERIAL_3 = ["12px", "16px", "24px"];

/**
 * What a corner can be: 8px; 4px, and ONLY on a control of about 20px or
 * less, where 8 is all but a circle — a checkbox at 8px reads as a radio, as
 * something one of which is chosen; all the way (`1000px`, or `50%` for a
 * circle); and `0` or `inherit`, which draw no radius of their own — a side
 * left square, a corner taken from the parent.
 *
 * The 4 is for the box and not for the card that happens to look better with
 * it: a stylesheet that reaches for it on anything of a normal size is
 * deciding a radius, which is what this rule is here to prevent.
 */
const ALLOWED = new Set(["8px", "4px", "1000px", "50%", "0", "inherit", ...MATERIAL_3]);

const DECLARATION = /border(?:-[a-z]+)*-radius:\s*([^;]+);/g;

function stylesheetsOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return stylesheetsOf(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

/** Every radius out of the rule, as "file: value". */
function offendersOf(directories: readonly string[]): string[] {
  return directories
    .flatMap((directory) => stylesheetsOf(join(ROOT, directory)))
    .flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(DECLARATION)]
        .map((match) => match[1]?.trim() ?? "")
        .filter((value) => value.split(/\s+/).some((corner) => !ALLOWED.has(corner)))
        .map((value) => `${relative(ROOT, path)}: ${value}`),
    );
}

describe("the platform's corners", () => {
  it("finds the platform's stylesheets", () => {
    // A renamed folder would leave the rule below watching nothing.
    expect(PLATFORM_STYLES.flatMap((directory) => stylesheetsOf(join(ROOT, directory))).length).toBeGreaterThan(50);
  });

  it("are 8px, 4px on a tiny control, all the way or one of Material 3's three — and nothing else", () => {
    expect(offendersOf(PLATFORM_STYLES)).toEqual([]);
  });
});
