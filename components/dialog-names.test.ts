import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// A modal `<dialog>` is announced by its role and its name; without one a
// screen reader says only "dialog", and nothing on screen tells whoever wrote
// it. axe does not catch it either: its `aria-dialog-name` rule looks at an
// explicit `role="dialog"`, not at the native element. So this reads every
// `<dialog>` written in JSX and fails on the one that is not named by its
// heading (`aria-labelledby`, from a `useId`) or, with no heading to point
// at, by an `aria-label`.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Both products, and the stories: a story's dialog is read by the same screen readers. */
const SOURCES = ["app", "components"];

const NAMING = new Set(["aria-labelledby", "aria-label"]);

function filesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

type Dialog = { at: string; named: boolean };

/**
 * Every `<dialog …>` of a file, parsed as TSX rather than matched as text:
 * the word also lives in comments and in the stories' descriptions, and an
 * attribute such as `onClose={() => …}` carries a `>` of its own.
 */
function dialogsOf(path: string): Dialog[] {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: Dialog[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === "dialog") {
      const named = node.attributes.properties.some(
        (attribute) =>
          ts.isJsxAttribute(attribute) &&
          NAMING.has(attribute.name.getText()) &&
          // `aria-label=""` names nothing.
          !(attribute.initializer && ts.isStringLiteral(attribute.initializer) && attribute.initializer.text === ""),
      );
      const { line } = source.getLineAndCharacterOfPosition(node.getStart());
      found.push({ at: `${relative(ROOT, path)}:${line + 1}`, named });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const dialogs = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory))).flatMap(dialogsOf);

describe("the platform's dialogs", () => {
  it("are found", () => {
    // A renamed folder, or a parser that stopped seeing JSX, would leave the
    // rule below watching nothing. Two is what the platform writes once every
    // popup is on its two pieces (components/platform/popups.test.ts).
    expect(dialogs.length).toBeGreaterThanOrEqual(2);
  });

  it("each have an accessible name: `aria-labelledby` their heading, or `aria-label`", () => {
    expect(dialogs.filter((dialog) => !dialog.named).map((dialog) => dialog.at)).toEqual([]);
  });
});
