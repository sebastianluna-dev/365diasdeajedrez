import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Whoever asks the system for less motion gets it everywhere: an animation
// has its way out in the same stylesheet, and a scroll glides only where
// nobody asked it not to. A stylesheet that forgets it is not seen by whoever
// writes it, so this reads every one of them and fails on the one that does.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Both products: the public site animates too. */
const SOURCES = ["app", "components"];

const REDUCE = /prefers-reduced-motion:\s*reduce/;
const NO_PREFERENCE = /prefers-reduced-motion:\s*no-preference/;

/** An animation that runs: `animation` or `animation-name` with anything but `none`. */
const ANIMATES = /(?:^|;)\s*animation(?:-name)?\s*:(?!\s*none\b)[^;]+/;

/** What switches one off: no animation, or one cut to an instant. */
const STILLS = /(?:^|;)\s*animation(?:-duration)?\s*:/;

const SMOOTH_SCROLL = /(?:^|;)\s*scroll-behavior\s*:\s*smooth/;

function filesOf(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

function sourcesWith(extensions: readonly string[]): string[] {
  return SOURCES.flatMap((directory) => filesOf(join(ROOT, directory), extensions));
}

type Rule = {
  /**
   * Who the declarations are for, one per entry of a comma-separated list: the
   * rule's own selector, or its parent's when the block is a `@media` nested
   * straight into a rule.
   */
  selectors: string[];
  /** The preludes of everything it is nested in, the nearest last. */
  ancestors: string[];
  /** Its own declarations, nested rules left out. */
  declarations: string;
};

/** The rules of a stylesheet, each with what it is nested in. */
function rulesOf(css: string): Rule[] {
  const rules: Rule[] = [];
  const open: { prelude: string; declarations: string }[] = [];
  let pending = "";
  for (const character of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (character === "{") {
      open.push({ prelude: pending.trim().replace(/\s+/g, " "), declarations: "" });
      pending = "";
    } else if (character === "}") {
      const rule = open.pop();
      if (rule) {
        // A `@media` nested straight into a rule, and a bare `&`, speak for the
        // rule they are nested in.
        const parent = open.findLast((ancestor) => !ancestor.prelude.startsWith("@"))?.prelude ?? "";
        const isCondition = rule.prelude.startsWith("@");
        const own = (isCondition ? parent : rule.prelude).split(",").map((selector) => selector.trim());
        rules.push({
          selectors: own.flatMap((selector) =>
            selector === "&" ? parent.split(",").map((p) => p.trim()) : [selector],
          ),
          ancestors: [...open.map((ancestor) => ancestor.prelude), ...(isCondition ? [rule.prelude] : [])],
          declarations: rule.declarations + pending,
        });
      }
      pending = "";
    } else if (character === ";") {
      const current = open[open.length - 1];
      if (current) current.declarations += `${pending};`;
      pending = "";
    } else {
      pending += character;
    }
  }
  return rules;
}

const isWithin = (rule: Rule, media: RegExp): boolean => rule.ancestors.some((ancestor) => media.test(ancestor));

/** "file selector" for every selector that starts an animation and is never stilled under reduced motion. */
function unstilledAnimations(path: string): string[] {
  const rules = rulesOf(readFileSync(path, "utf8")).filter(
    (rule) => !rule.ancestors.some((a) => a.startsWith("@keyframes")),
  );
  const stilled = new Set(
    rules.filter((rule) => isWithin(rule, REDUCE) && STILLS.test(rule.declarations)).flatMap((rule) => rule.selectors),
  );
  return rules
    .filter((rule) => !isWithin(rule, REDUCE) && !isWithin(rule, NO_PREFERENCE) && ANIMATES.test(rule.declarations))
    .flatMap((rule) => rule.selectors)
    .filter((selector) => !stilled.has(selector))
    .map((selector) => `${relative(ROOT, path)} ${selector}`);
}

describe("reduced motion", () => {
  const stylesheets = sourcesWith([".css"]);

  it("finds the stylesheets that animate", () => {
    // A renamed folder would leave the rules below watching nothing.
    const animated = stylesheets.filter((path) =>
      rulesOf(readFileSync(path, "utf8")).some((rule) => ANIMATES.test(rule.declarations)),
    );
    expect(animated.length).toBeGreaterThan(10);
  });

  it("stills every animation, in the stylesheet that starts it", () => {
    expect(stylesheets.flatMap(unstilledAnimations)).toEqual([]);
  });

  it("scrolls smoothly only for whoever did not ask for less motion", () => {
    const unconditional = stylesheets.flatMap((path) =>
      rulesOf(readFileSync(path, "utf8"))
        .filter((rule) => SMOOTH_SCROLL.test(rule.declarations) && !isWithin(rule, NO_PREFERENCE))
        .map((rule) => `${relative(ROOT, path)} ${rule.selectors.join(", ")}`),
    );
    expect(unconditional).toEqual([]);
  });

  it("asks before scrolling smoothly from code", () => {
    // `behavior: "smooth"` ignores the stylesheet's media query, so the code
    // that passes it has to look at the preference itself.
    const unasked = sourcesWith([".ts", ".tsx"])
      .filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"))
      .filter((path) => {
        const source = readFileSync(path, "utf8");
        // The attribute Next asks for on <html> is not a scroll of ours.
        const ours = source.replaceAll('data-scroll-behavior="smooth"', "");
        return /["']smooth["']/.test(ours) && !ours.includes("prefers-reduced-motion");
      })
      .map((path) => relative(ROOT, path));
    expect(unasked).toEqual([]);
  });
});
