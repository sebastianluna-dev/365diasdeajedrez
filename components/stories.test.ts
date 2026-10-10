import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Storybook is where the platform's shared pieces are seen, in both themes,
// before a screen is built with them, and four things keep it so: every shared
// piece has a story, beside it in its own folder; a story's title is where it
// lives, so the sidebar mirrors `components/`; the component's page in docs/
// points at its story; and every story says in one line what it shows, which is
// what its Docs tab prints. This reads the stories, the components and the docs
// pages from disk and fails on the four. The method is
// docs/content/ui/storybook.mdx, "Adding a component".

const ROOT = fileURLToPath(new URL("../", import.meta.url));

const SHARED = "components/platform/shared";

/** The shared pieces without a story, and why. */
const WITHOUT_STORY: Record<string, string> = {
  "components/platform/shared/image-upload.comp.tsx":
    "its hook imports a server action (createUploadSignature) that reaches Prisma: it waits for the module mocks storybook.mdx plans",
};

/** Folders whose stories are pages and not components: their title names the page, not an export. */
const PAGES: Record<string, string> = {
  "components/platform/foundations": "the foundations, drawn from the stylesheets",
  "components/platform/primitives": "the global classes of platform.css, written as plain markup",
  "components/platform/overview": "every piece of the platform at a glance, as a UI kit's sheet",
  "components/icons": "the icon set, drawn as one gallery",
};

/** The overview sheet, and the products whose stories it shows: the site's are not the platform's pieces. */
const OVERVIEW = "components/platform/overview/overview.stories.tsx";
const ON_THE_SHEET = ["platform/", "chess/", "icons/", "adventure/"];

/** The stories of those products without a tile on the sheet, and why. */
const NOT_ON_THE_SHEET: Record<string, string> = {
  "platform/shared/CurrentPathField": "it draws nothing: a hidden input that sends the current path",
  "platform/shared/SortableDnd":
    "it draws nothing of its own: the wiring of the lists it wraps, whose tiles (GameList, SyllabusList) show it",
};

/** A component file: a piece (`.comp.tsx`) or a section (`.section.tsx`). */
const COMPONENT_FILE = /\.(?:comp|section)\.tsx$/;

function filesOf(directory: string, suffix: string): string[] {
  return readdirSync(join(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path, suffix);
    return entry.name.endsWith(suffix) ? [path] : [];
  });
}

const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const stories = filesOf("components", ".stories.tsx");
const sharedPieces = filesOf(SHARED, ".comp.tsx");

/**
 * The `title` of the file's `meta`: its own top-level key, two spaces in, in
 * the object that closes at the start of a line — not an arg or a sample's.
 */
function titleOf(source: string): string | null {
  const start = source.indexOf("const meta");
  if (start < 0) return null;
  const end = source.indexOf("\n}", start);
  return /^ {2}title:\s*"([^"]+)"/m.exec(source.slice(start, end < 0 ? undefined : end))?.[1] ?? null;
}

/**
 * Where a stories file lives, as its title has to begin: its folder under
 * `components/`, without the component's own folder when the file sits in one
 * named after it (`platform/shared/platform-notice/platform-notice.stories.tsx`
 * is `platform/shared/<export>`), with it when the folder is shared by several
 * components (`…/course-sources/course-source-form.stories.tsx` keeps
 * `course-sources`).
 */
function prefixOf(storiesPath: string): string {
  const folder = relative("components", dirname(storiesPath));
  const name = basename(storiesPath, ".stories.tsx");
  return basename(folder) === name ? dirname(folder) : folder;
}

/** The component file of a folder that exports `name`, if one does. */
function componentExporting(folder: string, name: string): string | null {
  const files = readdirSync(join(ROOT, folder)).filter((file) => COMPONENT_FILE.test(file));
  const owner = files.find((file) =>
    [...read(join(folder, file)).matchAll(/^export (?:async )?(?:function|const) (\w+)/gm)].some(
      (match) => match[1] === name,
    ),
  );
  return owner ? join(folder, owner) : null;
}

type FactsRow = { label: string; text: string };

/**
 * The docs pages of every component file, by path, with their facts table. A
 * page can document several files of one folder: its «File» (or «Files») row
 * names the first by its path, or the folder itself ending in `/`, and the
 * rest by their name.
 */
function docsPages(): Map<string, { page: string; rows: FactsRow[] }[]> {
  const pages = new Map<string, { page: string; rows: FactsRow[] }[]>();
  for (const page of filesOf("docs/content/components", ".mdx")) {
    const lines = read(page).split("\n");
    const start = lines.findIndex((line) => line.startsWith("|"));
    if (start < 0) continue;
    const end = lines.findIndex((line, index) => index > start && !line.startsWith("|"));
    const rows = lines.slice(start, end < 0 ? undefined : end).map((line) => {
      const [, label = "", ...rest] = line.split("|");
      return { label: label.trim(), text: rest.join("|") };
    });
    const fileRow = rows.find(({ label }) => label === "File" || label === "Files")?.text ?? "";
    let folder = "";
    for (const [, token = ""] of fileRow.matchAll(/`([^`]+)`/g)) {
      if (token.endsWith("/")) {
        folder = token.slice(0, -1);
        continue;
      }
      if (!/\.tsx?$/.test(token)) continue;
      if (token.includes("/")) folder = dirname(token);
      const file = token.includes("/") ? token : join(folder, token);
      pages.set(file, [...(pages.get(file) ?? []), { page, rows }]);
    }
  }
  return pages;
}

/** What is wrong with a page's facts table for this stories file, or null when its «Story» row is right. */
function rowProblem({ page, rows }: { page: string; rows: FactsRow[] }, storiesFile: string): string | null {
  const labels = rows.map(({ label }) => label);
  const story = labels.indexOf("Story");
  if (story < 0) return `${page}: no «Story» row`;
  if (labels[story - 1] !== "Stylesheet") return `${page}: «Story» is not right after «Stylesheet»`;
  return rows[story]?.text.includes(storiesFile) ? null : `${page}: «Story» does not name ${storiesFile}`;
}

describe("the stories", () => {
  it("are found, with the shared pieces and the docs pages they are checked against", () => {
    // A renamed folder would leave the rules below watching nothing.
    expect(stories.length).toBeGreaterThan(30);
    expect(sharedPieces.length).toBeGreaterThan(20);
    expect(docsPages().size).toBeGreaterThan(150);
  });

  it("cover every piece of components/platform/shared, each in its own folder beside it", () => {
    const missing = sharedPieces
      .filter((piece) => !(piece in WITHOUT_STORY))
      .flatMap((piece) => {
        const name = basename(piece, ".comp.tsx");
        if (basename(dirname(piece)) !== name) return [`${piece}: not in a folder of its own, ${name}/`];
        return existsSync(join(ROOT, dirname(piece), `${name}.stories.tsx`))
          ? []
          : [`${piece}: no ${name}.stories.tsx beside it`];
      });
    expect(missing).toEqual([]);
  });

  it("keep their lists of exceptions true", () => {
    // A piece that got its story, or a folder of pages left without stories, leaves its list.
    const stale = [
      ...Object.keys(WITHOUT_STORY).filter(
        (piece) =>
          !existsSync(join(ROOT, piece)) || existsSync(join(ROOT, piece.replace(/\.comp\.tsx$/, ".stories.tsx"))),
      ),
      ...Object.keys(PAGES).filter(
        (folder) => !existsSync(join(ROOT, folder)) || !stories.some((path) => dirname(path) === folder),
      ),
    ];
    expect(stale).toEqual([]);
  });

  it("are titled by where they live, with the export of a component of their folder as the leaf", () => {
    const wrong = stories.flatMap((path) => {
      const title = titleOf(read(path));
      const prefix = prefixOf(path);
      const folder = dirname(path);
      if (!title?.startsWith(`${prefix}/`)) return [`${path}: "${title}" does not begin with "${prefix}/"`];
      const leaf = title.slice(prefix.length + 1);
      if (folder in PAGES) return leaf.length > 0 && !leaf.includes("/") ? [] : [`${path}: "${title}" names no page`];
      return componentExporting(folder, leaf) ? [] : [`${path}: no component of ${folder} exports ${leaf}`];
    });
    expect(wrong).toEqual([]);
  });

  it("are named on their component's page, in the «Story» row right after «Stylesheet»", () => {
    const pages = docsPages();
    const wrong = stories.flatMap((path) => {
      const folder = dirname(path);
      if (folder in PAGES) return [];
      const title = titleOf(read(path)) ?? "";
      const component = componentExporting(folder, title.slice(prefixOf(path).length + 1));
      // A title that names no component is the rule above's to report.
      if (!component) return [];
      const found = pages.get(component) ?? [];
      if (found.length === 0) return [`${component}: no page in docs/content/components`];
      const problems = found.map((page) => rowProblem(page, basename(path)));
      return problems.includes(null) ? [] : [problems[0] ?? ""];
    });
    expect(wrong).toEqual([]);
  });

  it("each have a tile on the overview sheet, and every tile links to a story", () => {
    // The sheet is where every piece is seen at once; a story left off it is a
    // piece nobody finds there. A tile's link is the story's Docs page, by id:
    // the title in lowercase with every other character turned into "-".
    const idOf = (title: string) =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const titles = stories
      .filter((path) => path !== OVERVIEW)
      .map((path) => titleOf(read(path)) ?? "")
      .filter((title) => ON_THE_SHEET.some((prefix) => title.startsWith(prefix)));
    const links = new Set([...read(OVERVIEW).matchAll(/\bdocs="([^"]+)"/g)].map((match) => match[1]));
    const ids = new Set(titles.map(idOf));
    const problems = [
      ...titles
        .filter((title) => !(title in NOT_ON_THE_SHEET) && !links.has(idOf(title)))
        .map((title) => `${title}: no tile on the sheet`),
      ...[...links].filter((link) => link && !ids.has(link)).map((link) => `docs="${link}": no story has that id`),
      ...Object.keys(NOT_ON_THE_SHEET)
        .filter((title) => !titles.includes(title) || links.has(idOf(title)))
        .map((title) => `${title}: listed as not on the sheet, but it has no story or it has a tile`),
    ];
    expect(problems).toEqual([]);
  });

  it("say in a JSDoc line what each story shows", () => {
    // Every named export of a stories file is a story, and the `/** … */` above
    // it is what the Docs tab prints under it; a line comment between the two
    // (a lint exception and its reason) does not stop that.
    const bare = stories.flatMap((path) => {
      const lines = read(path).split("\n");
      return lines.flatMap((line, index) => {
        if (!line.startsWith("export ") || /^export (?:default|type|interface) /.test(line)) return [];
        const story = /^export const (\w+)/.exec(line)?.[1];
        if (!story) return [`${path}:${index + 1}: a story is written as \`export const\`, which this rule reads`];
        let above = index - 1;
        while (above >= 0 && (lines[above]?.trim() === "" || lines[above]?.trim().startsWith("//"))) above -= 1;
        if (!lines[above]?.trim().endsWith("*/")) return [`${path}: ${story}`];
        while (above >= 0 && !lines[above]?.trim().startsWith("/*")) above -= 1;
        return lines[above]?.trim().startsWith("/**") ? [] : [`${path}: ${story} (its comment is not a JSDoc)`];
      });
    });
    expect(bare).toEqual([]);
  });
});
