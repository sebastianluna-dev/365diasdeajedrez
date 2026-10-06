import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Every popup of the platform is one of two pieces: `PlatformPopup`, the
// shell whose only fixed part is the strip with the name and the cross, and
// `PlatformConfirmPopup`, the heavier one that asks before something is
// destroyed, opened on top of whatever popup is open. A `<dialog>` written
// anywhere else is a third kind of popup, with a head, a cross and a width of
// its own, which is what the two pieces replaced (2026-10-06). This reads
// every `<dialog>` written in JSX and fails on the one outside the pieces.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Both products, and the stories: a story's popup is the same popup. */
const SOURCES = ["app", "components"];

/** The files that may write a `<dialog>`: the pieces. */
const PIECES = new Set([
  "components/platform/shared/platform-popup/platform-popup.comp.tsx",
  "components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp.tsx",
]);

/**
 * The popups that still write their own `<dialog>`, and what they wait for.
 * An entry leaves the list the day its file stops writing one; a file that is
 * not here and writes one fails.
 */
const PENDING: Record<string, string> = {
  "components/platform/sections/studies/studies-list/delete-study.comp.tsx": "step 3 of the popups series",
  "components/platform/sections/studies/study-detail/edit-study.comp.tsx": "step 3 of the popups series",
  "components/platform/sections/studies/study-detail/new-game.comp.tsx": "step 6 of the popups series",
  "components/platform/shared/edit-game/edit-game.comp.tsx": "step 6 of the popups series",
  "components/platform/shared/game-settings/game-settings.comp.tsx": "step 4 of the popups series",
};

function filesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

/** Whether a file writes a `<dialog …>`, parsed as TSX: the word also lives in comments and in strings. */
function writesDialog(path: string): boolean {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  const visit = (node: ts.Node) => {
    if (found) return;
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === "dialog") {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const writers = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory)))
  .filter(writesDialog)
  .map((path) => relative(ROOT, path));

describe("the platform's popups", () => {
  it("are found", () => {
    // Every piece writes one; fewer means the parser stopped seeing JSX.
    expect(writers.filter((file) => PIECES.has(file))).toHaveLength(PIECES.size);
  });

  it("are PlatformPopup or PlatformConfirmPopup: no other file writes a <dialog>", () => {
    expect(writers.filter((file) => !PIECES.has(file) && !(file in PENDING))).toEqual([]);
  });

  it("keep their list of pending ones true", () => {
    // An entry leaves the list the day its file is on the pieces.
    expect(Object.keys(PENDING).filter((file) => !writers.includes(file))).toEqual([]);
  });
});
