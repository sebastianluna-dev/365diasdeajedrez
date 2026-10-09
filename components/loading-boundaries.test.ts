import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT as ROOT, reach } from "@/lib/testing/module-reach";

// A `loading.tsx` must not reach a Client Component, however indirectly.
//
// The platform's pages carry a content security policy with a nonce. Next
// stamps that nonce on the scripts of a page and of a layout, but the scripts
// a LOADING boundary's client code needs are written into the HTML without it,
// and the browser refuses them (seen on 2026-10-05: the study game's loading
// file imported a blank card from a module that also held an edit dialog, and
// every load of the page logged a blocked script). A fallback is markup and
// CSS; whatever it draws lives in files with no `"use client"` behind them.

function loadingFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return loadingFiles(path);
    return name === "loading.tsx" ? [path] : [];
  });
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
