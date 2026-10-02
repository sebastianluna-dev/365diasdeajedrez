import { TOKENS_FILE, withoutComments } from "@/lib/platform-tokens";

// The platform's stylesheets as text, for the foundations pages to draw from.
// Vite hands a file's source to an import with `?raw`, and editing any of them
// reloads this module, so a page follows the stylesheet without a story being
// touched. The folders are the ones the convention tests read
// (border-radius.test.ts, platform-tokens.test.ts); this folder's own
// stylesheet draws the pages and is left out of what they count.
const SOURCES = import.meta.glob(
  [
    "/app/\\(platform\\)/**/*.css",
    "/app/\\(auth\\)/**/*.css",
    "/components/platform/**/*.css",
    "/components/auth/**/*.css",
    "/components/chess/**/*.css",
    "!/components/platform/foundations/**",
  ],
  { query: "?raw", import: "default", eager: true },
);

export interface Stylesheet {
  /** From the repository's root, as the convention tests print it. */
  path: string;
  source: string;
}

export const PLATFORM_STYLESHEETS: readonly Stylesheet[] = Object.entries(SOURCES)
  .map(([path, source]) => ({ path: path.replace(/^\//, ""), source: String(source) }))
  .sort((first, second) => first.path.localeCompare(second.path));

/** The stylesheet whose `:root` declares every token. */
export const PLATFORM_CSS = PLATFORM_STYLESHEETS.find(({ path }) => path === TOKENS_FILE)?.source ?? "";

export interface Usage {
  value: string;
  count: number;
}

/**
 * How many times each value of a property is written across the platform's
 * stylesheets, the most written first. `property` is a pattern for the
 * property's name (`font-size`, `border(?:-[a-z]+)*-radius`); with `byPart`,
 * a value of several parts (`8px 8px 0 0`) counts once per part.
 */
export function usagesOf(property: string, byPart = false): Usage[] {
  const declaration = new RegExp(`(?:^|[;{\\s])(?:${property})\\s*:\\s*([^;{}]+)`, "g");
  const counts = new Map<string, number>();
  for (const { source } of PLATFORM_STYLESHEETS) {
    for (const match of withoutComments(source).matchAll(declaration)) {
      const value = (match[1] ?? "").replace(/\s+/g, " ").trim();
      for (const part of byPart ? value.split(" ") : [value]) counts.set(part, (counts.get(part) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) => second.count - first.count || first.value.localeCompare(second.value));
}
