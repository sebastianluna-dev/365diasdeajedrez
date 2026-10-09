import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Which of the project's own modules a file reaches through its imports, for
// the tests that guard what a module may pull in: a `loading.tsx` must reach
// no Client Component (components/loading-boundaries.test.ts), and «Jugar»
// must reach no writer of the activity log (services/play/no-activity.test.ts).
//
// A static reading of the source, not a bundler: `import … from`, `export …
// from` and bare `import "…"`, resolved for `@/` and relative paths; packages
// and stylesheets are not followed. A type-only import is erased and brings no
// code along.

export const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The file an import names, for the project's own modules; `null` for a package or a stylesheet. */
export function resolveImport(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/")
    ? join(PROJECT_ROOT, specifier.slice(2))
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
export function reach(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(IMPORT)) {
      if (/^\s*(?:import|export)\s+type\s/.test(match[0])) continue;
      const specifier = match[1] ?? match[2];
      const target = specifier ? resolveImport(file, specifier) : null;
      if (target) queue.push(target);
    }
  }
  return [...seen];
}
