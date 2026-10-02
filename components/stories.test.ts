import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Storybook is where the platform's shared pieces are seen, in both themes,
// before a screen is built with them, and four things keep it so: every shared
// piece has a story; a story's title is where it lives, so the sidebar mirrors
// `components/`; the component's page in docs/ points at its story; and every
// story says in one line what it shows, which is what its Docs tab prints.
// This reads the stories, the components and the docs pages from disk and
// fails on the four. The method is docs/content/ui/storybook.mdx, "Adding a
// component".

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
};

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

/** The `title` of the file's `meta`: the first one after it, not one of the sample data's. */
function titleOf(source: string): string | null {
  const meta = source.indexOf("const meta");
  return meta < 0 ? null : (/title:\s*"([^"]+)"/.exec(source.slice(meta))?.[1] ?? null);
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

/** Every name the components of a folder export. */
function exportsOf(folder: string): Set<string> {
  return new Set(
    readdirSync(join(ROOT, folder))
      .filter((file) => file.endsWith(".comp.tsx"))
      .flatMap((file) =>
        [...read(join(folder, file)).matchAll(/export (?:function|const) (\w+)/g)].map((m) => m[1] ?? ""),
      ),
  );
}

type FactsRow = { label: string; text: string };

/**
 * The docs page of every component file, by path, with its facts table. A page
 * can document several files of one folder: its «File» row names the first by
 * its path and the rest by their name.
 */
function docsPages(): Map<string, { page: string; rows: FactsRow[] }> {
  const pages = new Map<string, { page: string; rows: FactsRow[] }>();
  for (const page of filesOf("docs/content/components", ".mdx")) {
    const lines = read(page).split("\n");
    const start = lines.findIndex((line) => line.startsWith("|"));
    if (start < 0) continue;
    const end = lines.findIndex((line, index) => index > start && !line.startsWith("|"));
    const rows = lines.slice(start, end < 0 ? undefined : end).map((line) => {
      const [, label = "", ...rest] = line.split("|");
      return { label: label.trim(), text: rest.join("|") };
    });
    const files = [...(rows.find(({ label }) => label === "File")?.text.matchAll(/`([^`]+\.tsx?)`/g) ?? [])].map(
      (match) => match[1] ?? "",
    );
    const folder = dirname(files[0] ?? "");
    for (const file of files) pages.set(file.includes("/") ? file : join(folder, file), { page, rows });
  }
  return pages;
}

describe("the stories", () => {
  it("are found, with the shared pieces and the docs pages they are checked against", () => {
    // A renamed folder would leave the rules below watching nothing.
    expect(stories.length).toBeGreaterThan(30);
    expect(sharedPieces.length).toBeGreaterThan(20);
    expect(docsPages().size).toBeGreaterThan(150);
  });

  it("cover every piece of components/platform/shared", () => {
    const missing = sharedPieces.filter(
      (piece) => !(piece in WITHOUT_STORY) && !existsSync(join(ROOT, piece.replace(/\.comp\.tsx$/, ".stories.tsx"))),
    );
    expect(missing).toEqual([]);
  });

  it("keep their lists of exceptions true", () => {
    // A piece that got its story, or a folder that got a component, leaves its list.
    const stale = [
      ...Object.keys(WITHOUT_STORY).filter(
        (piece) =>
          !existsSync(join(ROOT, piece)) || existsSync(join(ROOT, piece.replace(/\.comp\.tsx$/, ".stories.tsx"))),
      ),
      ...Object.keys(PAGES).filter((folder) => !existsSync(join(ROOT, folder)) || exportsOf(folder).size > 0),
    ];
    expect(stale).toEqual([]);
  });

  it("are titled by where they live, with the component's export as the leaf", () => {
    const wrong = stories.flatMap((path) => {
      const title = titleOf(read(path));
      const prefix = prefixOf(path);
      const folder = dirname(path);
      const leaf = title?.slice(prefix.length + 1) ?? "";
      const leafIsRight = folder in PAGES ? leaf.length > 0 && !leaf.includes("/") : exportsOf(folder).has(leaf);
      return title?.startsWith(`${prefix}/`) && leafIsRight
        ? []
        : [`${path}: "${title}", expected "${prefix}/<export>"`];
    });
    expect(wrong).toEqual([]);
  });

  it("are named on their component's page, in the «Story» row right after «Stylesheet»", () => {
    const pages = docsPages();
    const wrong = stories.flatMap((path) => {
      const component = path.replace(/\.stories\.tsx$/, ".comp.tsx");
      if (!existsSync(join(ROOT, component))) return [];
      const found = pages.get(component);
      if (!found) return [`${component}: no page in docs/content/components`];
      const labels = found.rows.map(({ label }) => label);
      const story = labels.indexOf("Story");
      if (story < 0) return [`${found.page}: no «Story» row`];
      if (labels[story - 1] !== "Stylesheet") return [`${found.page}: «Story» is not right after «Stylesheet»`];
      return found.rows[story]?.text.includes(basename(path))
        ? []
        : [`${found.page}: «Story» does not name ${basename(path)}`];
    });
    expect(wrong).toEqual([]);
  });

  it("say in a line what each story shows", () => {
    // Every named export of a stories file is a story, and its JSDoc is what the Docs tab prints under it.
    const bare = stories.flatMap((path) => {
      const lines = read(path).split("\n");
      return lines.flatMap((line, index) => {
        const story = /^export const (\w+)/.exec(line)?.[1];
        if (!story) return [];
        const above = lines
          .slice(0, index)
          .reverse()
          .find((previous) => previous.trim() !== "");
        return above?.trim().endsWith("*/") ? [] : [`${path}: ${story}`];
      });
    });
    expect(bare).toEqual([]);
  });
});
