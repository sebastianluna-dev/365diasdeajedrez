import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// A `loading.tsx` must not reach a Client Component, however indirectly.
//
// The platform's pages carry a content security policy with a nonce. Next
// stamps that nonce on the scripts of a page and of a layout, but the scripts
// a LOADING boundary's client code needs are written into the HTML without it,
// and the browser refuses them (seen on 2026-10-05: the study game's loading
// file imported a blank card from a module that also held an edit dialog, and
// every load of the page logged a blocked script). A fallback is markup and
// CSS; whatever it draws lives in files with no `"use client"` behind them.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

function loadingFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return loadingFiles(path);
    return name === "loading.tsx" ? [path] : [];
  });
}

/** The file an import names, for the project's own modules; `null` for a package or a stylesheet. */
function resolveImport(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/")
    ? join(ROOT, specifier.slice(2))
    : specifier.startsWith(".")
      ? join(dirname(from), specifier)
      : null;
  if (!base || /\.(css|json|svg)$/.test(base)) return null;
  for (const candidate of [base, `${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const IMPORT = /^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm;

/** Every project module a file reaches through its imports, itself included. */
function reach(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, "utf8");
    // A type-only import is erased: it brings no code along.
    for (const match of source.matchAll(IMPORT)) {
      if (/^\s*import\s+type\s/.test(match[0])) continue;
      const specifier = match[1] ?? match[2];
      const target = specifier ? resolveImport(file, specifier) : null;
      if (target) queue.push(target);
    }
  }
  return [...seen];
}

const isClient = (file: string) =>
  /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/|\s)*["']use client["']/.test(readFileSync(file, "utf8"));

describe("the loading boundaries", () => {
  const files = loadingFiles(join(ROOT, "app"));

  it("exist: the walk finds the loading files", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("reach no Client Component", () => {
    const offenders = files.flatMap((file) =>
      reach(file)
        .filter(isClient)
        .map((client) => `${relative(ROOT, file)} reaches ${relative(ROOT, client)}`),
    );
    expect(offenders).toEqual([]);
  });
});
