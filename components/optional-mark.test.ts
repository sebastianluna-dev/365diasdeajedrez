import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// A field that may be left empty says «Opcional», and the field pieces say it
// themselves, from their control's `required` (`OptionalMark`,
// `isOptionalControl`): nobody writes the word. Before that rule the platform
// said it four ways — a word at the end of the label's row, «(opcional)» inside
// the label, a hint, or nothing — and one field could say it while its
// validation said the opposite. So this reads the copy of every file and
// fails on «opcional» anywhere but the few places that ARE the rule.
//
// The copy, not the comments: the files are parsed as TSX, and only string
// literals, template text and JSX text are read, so a comment that quotes the
// word is left alone. Nor the description a story gives its Docs tab
// (`parameters.docs.description.component`), which is documentation in English
// and may quote it too.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Both products, and the stories: a story shows a form as it should look. */
const SOURCES = ["app", "components"];

const WORD = /opcional/i;

/** The copy allowed to say it, by file, and why. */
const ALLOWED: Record<string, { text: string; why: string }[]> = {
  "components/platform/shared/optional-mark/optional-mark.comp.tsx": [
    { text: "Opcional", why: "the mark itself, the one place the word is written" },
  ],
  "components/platform/shared/optional-fields/optional-fields.comp.tsx": [
    { text: "Todos los campos son opcionales.", why: "the note over a set of fields that are all optional" },
  ],
  "components/platform/shared/optional-fields/optional-fields.stories.tsx": [
    { text: "Todos los campos son opcionales.", why: "its story checks the note is there" },
  ],
  "components/platform/sections/staff/courses/syllabus-list/syllabus-list.comp.tsx": [
    { text: "Opcional", why: "beside «Agregar introducción/cierre»: an optional item of a syllabus, not a field" },
  ],
};

/** The JSX tags that draw a field, counted only to know the parser still sees them. */
const FIELD_TAGS = new Set(["FormField", "FormFieldset", "PlatformFormField", "PlatformFormGroup"]);

function filesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

type Copy = { file: string; line: number; text: string };

/** The text a story writes for its Docs tab: the value of `component:` inside `description:`. */
function isDocsDescription(node: ts.Node): boolean {
  const property = node.parent;
  if (!property || !ts.isPropertyAssignment(property) || property.name.getText() !== "component") return false;
  const owner = property.parent?.parent;
  return Boolean(owner && ts.isPropertyAssignment(owner) && owner.name.getText() === "description");
}

/** Every piece of copy of a file that says the word, and how many field tags it has. */
function read(path: string): { copy: Copy[]; fields: number } {
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, kind);
  const file = relative(ROOT, path);
  const copy: Copy[] = [];
  let fields = 0;
  const visit = (node: ts.Node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && FIELD_TAGS.has(node.tagName.getText())) {
      fields += 1;
    }
    const text =
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
        ? node.text
        : ts.isJsxText(node)
          ? node.text.trim()
          : null;
    if (text && WORD.test(text) && !isDocsDescription(node)) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart());
      copy.push({ file, line: line + 1, text });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { copy, fields };
}

const sources = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory)));
const scanned = sources.map(read);
const copy = scanned.flatMap((result) => result.copy);

describe("«Opcional»", () => {
  it("is looked for in the sources, and they hold the form fields", () => {
    // A renamed folder, or a parser that stopped seeing JSX, would leave the
    // rule below watching nothing.
    expect(sources.length).toBeGreaterThan(500);
    expect(scanned.reduce((total, result) => total + result.fields, 0)).toBeGreaterThan(100);
  });

  it("is written only by the pieces that draw it: no label says «(opcional)»", () => {
    const stray = copy
      .filter(({ file, text }) => !(ALLOWED[file] ?? []).some((allowed) => allowed.text === text))
      .map(({ file, line, text }) => `${file}:${line} ${JSON.stringify(text)}`);
    expect(stray).toEqual([]);
  });

  it("keeps its list of exceptions true", () => {
    // An exception whose copy is gone leaves the list.
    const stale = Object.entries(ALLOWED).flatMap(([file, allowed]) =>
      allowed
        .filter(({ text }) => !copy.some((found) => found.file === file && found.text === text))
        .map(({ text }) => `${file}: ${JSON.stringify(text)}`),
    );
    expect(stale).toEqual([]);
  });
});
