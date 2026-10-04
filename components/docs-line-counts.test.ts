import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// A component's page in the docs says how long its stylesheet is — «Block
// `.move-table` (196 lines)» — and that figure drifts the moment the sheet
// changes and the page does not: on 2026-10-03 some seventy pages were off,
// a few by tens. This reads every component page, finds which stylesheet each
// count is about and fails when the count is not the file's number of lines.

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PAGES = join(ROOT, "docs/content/components");

/** A count in the prose: «(196 lines)», «(24 lines here; …)», «(1 line)». */
const COUNT = /\((\d+) lines?\b/g;

function pagesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pagesOf(path);
    return entry.name.endsWith(".mdx") ? [path] : [];
  });
}

/** Every tracked stylesheet, by its file name: a name two folders share keeps both paths. */
const stylesheetsByName = new Map<string, string[]>();
for (const path of execFileSync("git", ["ls-files", "*.css"], { cwd: ROOT, encoding: "utf8" }).split("\n")) {
  if (!path) continue;
  stylesheetsByName.set(basename(path), [...(stylesheetsByName.get(basename(path)) ?? []), path]);
}

/** A file's number of lines, as `wc -l` counts it when the file ends with a newline. */
function linesOf(path: string): number {
  const text = readFileSync(join(ROOT, path), "utf8");
  const newlines = text.split("\n").length - 1;
  return text.endsWith("\n") ? newlines : newlines + 1;
}

/** The second cell of a facts-table row: `| Stylesheet | … |`. */
function rowOf(page: string, name: string): string | undefined {
  const row = page.split("\n").find((line) => new RegExp(`^\\|\\s*${name}\\s*\\|`).test(line));
  return row?.split("|")[2];
}

interface Count {
  at: string;
  count: number;
  /** The stylesheet the count is about, or why it could not be told. */
  stylesheet: { path: string } | { problem: string };
}

/**
 * The counts of a page and the stylesheet each one is about: the `file.css` or
 * the `.block` named last before it on its line — a block found in the
 * «Stylesheet» row's «`file.css` → block `.x`» — or, with neither, the row's
 * only stylesheet. Tables and code are left alone.
 */
function countsOf(path: string): Count[] {
  const page = readFileSync(path, "utf8");
  const at = relative(ROOT, path);
  const row = rowOf(page, "Stylesheet") ?? "";
  const rowFiles = [...row.matchAll(/`([^`]+\.css)`/g)].map(([, file]) => basename(file ?? ""));
  const fileOfBlock = new Map<string, string>();
  for (const segment of row.split(";")) {
    const file = /`([^`]+\.css)`/.exec(segment)?.[1];
    if (!file) continue;
    for (const [, block] of segment.matchAll(/`(\.[a-z0-9_-]+)`/g)) fileOfBlock.set(block ?? "", basename(file));
  }
  const pageFolder = dirname(/`([^`]+\.tsx?)`/.exec(rowOf(page, "File") ?? "")?.[1] ?? "");

  const resolve = (name: string): Count["stylesheet"] => {
    const paths = stylesheetsByName.get(name) ?? [];
    if (paths.length === 1) return { path: paths[0] ?? "" };
    const here = paths.filter((candidate) => dirname(candidate) === pageFolder);
    if (here.length === 1) return { path: here[0] ?? "" };
    return { problem: paths.length === 0 ? `no tracked ${name}` : `${name} is in ${paths.length} folders` };
  };

  const counts: Count[] = [];
  let inCode = false;
  page.split("\n").forEach((line, index) => {
    if (line.trimStart().startsWith("```")) inCode = !inCode;
    if (inCode || line.trimStart().startsWith("|")) return;
    for (const match of line.matchAll(COUNT)) {
      const before = [...line.slice(0, match.index).matchAll(/`([^`]+)`/g)].map(([, token]) => token ?? "");
      const named = before.findLast((token) => token.endsWith(".css") || /^\.[a-z0-9_-]+$/.test(token));
      let name: string | undefined;
      if (named?.endsWith(".css")) name = basename(named);
      else if (named && fileOfBlock.has(named)) name = fileOfBlock.get(named);
      else if (new Set(rowFiles).size === 1) name = rowFiles[0];
      counts.push({
        at: `${at}:${index + 1}`,
        count: Number(match[1]),
        stylesheet: name ? resolve(name) : { problem: "cannot tell which stylesheet the count is about" },
      });
    }
  });
  return counts;
}

const counts = pagesOf(PAGES).flatMap(countsOf);

describe("the components' pages", () => {
  it("are found, with their counts", () => {
    // A moved folder or a reworded sentence would leave the rules below
    // watching nothing.
    expect(counts.length).toBeGreaterThan(100);
  });

  it("say which stylesheet each count is about", () => {
    const unknown = counts.flatMap(({ at, stylesheet }) =>
      "problem" in stylesheet ? [`${at}: ${stylesheet.problem}`] : [],
    );
    expect(unknown).toEqual([]);
  });

  it("count the lines their stylesheet has", () => {
    const wrong = counts.flatMap(({ at, count, stylesheet }) => {
      if ("problem" in stylesheet) return [];
      const lines = linesOf(stylesheet.path);
      return lines === count ? [] : [`${at}: says ${count}, ${stylesheet.path} has ${lines}`];
    });
    expect(wrong).toEqual([]);
  });
});
