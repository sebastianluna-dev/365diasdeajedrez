import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { platformRoutes } from "./platform-routes";

// A route pattern handed to `revalidatePath(pattern, "page")` is the page's
// FILE path under app/, route groups included (`/(platform)/…/(lesson)/…`):
// Next's own docs spell it `/(main)/blog/[slug]`. Without the groups the call
// matched nothing and a lesson's page kept its stale practice card (found
// 2026-10-16). Each pattern here must be a real page file, and must be the
// URL the builders write once the groups are taken out.

const APP = join(import.meta.dirname, "..", "app");

/** The URL a pattern serves: its route groups removed. */
const urlOf = (pattern: string) => pattern.replace(/\/\([^)]+\)/g, "");

const PATTERNS: [name: string, pattern: string, url: string][] = [
  ["lessonPattern", platformRoutes.lessonPattern, platformRoutes.lessonDetail("[courseRef]", 0, "[lessonId]")],
  [
    "lessonPracticePattern",
    platformRoutes.lessonPracticePattern,
    platformRoutes.lessonPractice("[courseRef]", 0, "[lessonId]", 0),
  ],
];

describe("the route patterns handed to revalidatePath", () => {
  it.each(PATTERNS)("%s is the path of a page file under app/", (_name, pattern) => {
    expect(pattern.startsWith("/(")).toBe(true);
    expect(existsSync(join(APP, pattern, "page.tsx")), `${pattern}/page.tsx`).toBe(true);
  });

  it.each(PATTERNS)("%s serves the URL its builder writes", (_name, pattern, url) => {
    expect(urlOf(pattern)).toBe(url.replace("/0/", "/[chapterOrder]/").replace(/\/0$/, "/[n]"));
  });
});
