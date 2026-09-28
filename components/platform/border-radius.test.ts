import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The platform rounds a corner in one of two ways: 8px, or all the way. A
// card, a button, a field, a tag, a dialog: there is no third radius, so no
// stylesheet has to decide one. This reads every stylesheet of the platform
// and fails on the first value that is neither.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Where the platform's stylesheets live: its pages, its components and the access pages. */
const PLATFORM_STYLES = ["app/(platform)", "app/(auth)", "components/platform", "components/auth"];

/**
 * What a corner can be: 8px; all the way (`1000px`, or `50%` for a circle);
 * and `0` or `inherit`, which draw no radius of their own — a side left
 * square, a corner taken from the parent.
 */
const ALLOWED = new Set(["8px", "1000px", "50%", "0", "inherit"]);

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

  it("are 8px or all the way, and nothing else", () => {
    expect(offendersOf(PLATFORM_STYLES)).toEqual([]);
  });
});
