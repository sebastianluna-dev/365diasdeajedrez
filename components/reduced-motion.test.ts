import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Whoever asks the system for less motion gets it everywhere: an animation
// and a transition that moves something have their way out in the same
// stylesheet, and a scroll glides only where nobody asked it not to. A
// stylesheet that forgets it is not seen by whoever writes it, so this reads
// every one of them and fails on the one that does.

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Both products: the public site animates too. */
const SOURCES = ["app", "components"];

const REDUCE = /prefers-reduced-motion:\s*reduce/;
const NO_PREFERENCE = /prefers-reduced-motion:\s*no-preference/;

/** An animation that runs: `animation` or `animation-name` with anything but `none`. */
const ANIMATES = /^animation(?:-name)?\s*:(?!\s*none\b)/;

/** What switches one off: no animation, or one cut to an instant. */
const STILLS_ANIMATION = /^animation(?:-duration)?\s*:/;

/**
 * A transition that moves or resizes something: it names a transform, a size
 * or a position, or names nothing (which is `all`). A colour that fades is
 * not motion, and is left to the hover rules of globals.css.
 */
const MOVES =
  /^transition(?:-property)?\s*:.*\b(?:all|transform|translate|scale|rotate|width|height|inset|top|right|bottom|left|margin|padding|grid-template-\w+|flex-basis|font-size)\b/;
const SHORTHAND = /^transition\s*:/;

/** The shorthand names a property when a word of it is neither a time nor an easing. */
const NAMES_A_PROPERTY =
  /^transition\s*:(?:.*[\s,])?(?!(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)\b)[a-z][a-z-]*(?![\w(-])/;

const STILLS_TRANSITION = /^transition(?:-duration)?\s*:/;

const SMOOTH_SCROLL = /^scroll-behavior\s*:\s*smooth/;

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

type Declaration = {
  /** "property: value", on one line. */
  text: string;
  /** Where it sits in the stylesheet: of two that weigh the same, the later one wins. */
  at: number;
  /** The block it was written in, to read it together with its neighbours. */
  block: number;
  /** Who it is for: the rule's selectors with every `&` and every parent written out. */
  selectors: string[];
  /** The `@media` and other conditions it is under, and `@keyframes` when it is a step of one. */
  conditions: string[];
};

type Block = { id: number; selectors: string[]; conditions: string[] };

/** A nested selector with its parents written out: `& .a` under `.b` is `.b .a`. */
function nestedUnder(parents: readonly string[], prelude: string): string[] {
  const own = prelude.split(",").map((selector) => selector.trim());
  if (parents.length === 0) return own;
  return parents.flatMap((parent) =>
    own.map((selector) => (selector.includes("&") ? selector.replaceAll("&", parent) : `${parent} ${selector}`)),
  );
}

/** Every declaration of a stylesheet, with who it is for and what it is under. */
function declarationsOf(css: string): Declaration[] {
  const declarations: Declaration[] = [];
  const open: Block[] = [];
  let pending = "";
  let at = 0;
  const close = (): void => {
    const text = pending.trim().replace(/\s+/g, " ");
    const block = open[open.length - 1];
    if (text && block)
      declarations.push({ text, at, block: block.id, selectors: block.selectors, conditions: block.conditions });
    pending = "";
  };
  for (const character of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    at += 1;
    if (character === "{") {
      const prelude = pending.trim().replace(/\s+/g, " ");
      const parent = open[open.length - 1];
      // A condition nested straight into a rule speaks for that rule.
      open.push(
        prelude.startsWith("@")
          ? { id: at, selectors: parent?.selectors ?? [], conditions: [...(parent?.conditions ?? []), prelude] }
          : { id: at, selectors: nestedUnder(parent?.selectors ?? [], prelude), conditions: parent?.conditions ?? [] },
      );
      pending = "";
    } else if (character === "}") {
      close();
      open.pop();
    } else if (character === ";") {
      close();
    } else {
      pending += character;
    }
  }
  return declarations;
}

const isUnder = (declaration: Declaration, condition: RegExp): boolean =>
  declaration.conditions.some((one) => condition.test(one));

const isKeyframe = (declaration: Declaration): boolean =>
  declaration.conditions.some((one) => one.startsWith("@keyframes"));

/**
 * "file selector" for every selector that `starts` something and is not
 * switched off LATER in the same stylesheet under reduced motion: a rule
 * under `@media` weighs what it weighs outside it, so one written before the
 * rule it answers loses to it.
 */
function unstilled(
  path: string,
  starts: (declaration: Declaration, all: readonly Declaration[]) => boolean,
  stills: RegExp,
): string[] {
  const declarations = declarationsOf(readFileSync(path, "utf8")).filter((declaration) => !isKeyframe(declaration));
  const stilledAt = new Map<string, number>();
  for (const declaration of declarations) {
    if (!isUnder(declaration, REDUCE) || !stills.test(declaration.text)) continue;
    for (const selector of declaration.selectors) stilledAt.set(selector, declaration.at);
  }
  return declarations
    .filter((declaration) => !isUnder(declaration, REDUCE) && !isUnder(declaration, NO_PREFERENCE))
    .filter((declaration) => starts(declaration, declarations))
    .flatMap((declaration) =>
      declaration.selectors.filter((selector) => (stilledAt.get(selector) ?? -1) < declaration.at),
    )
    .map((selector) => `${relative(ROOT, path)} ${selector}`);
}

const animates = (declaration: Declaration): boolean => ANIMATES.test(declaration.text);

/**
 * Whether a declaration makes its rule's transition one that moves. The
 * shorthand is read alone unless the same block also sets
 * `transition-property`, which is then what says what the transition is of.
 */
function movesOnTransition(declaration: Declaration, all: readonly Declaration[]): boolean {
  const { text } = declaration;
  if (text.startsWith("transition-property")) return MOVES.test(text);
  if (!SHORTHAND.test(text) || /^transition\s*:\s*none\b/.test(text)) return false;
  const namedApart = all.some(
    (other) => other.block === declaration.block && other.text.startsWith("transition-property"),
  );
  return !namedApart && (MOVES.test(text) || !NAMES_A_PROPERTY.test(text));
}

describe("reduced motion", () => {
  const stylesheets = sourcesWith([".css"]);

  it("finds the stylesheets that animate", () => {
    // A renamed folder would leave the rules below watching nothing.
    const animated = stylesheets.filter((path) =>
      declarationsOf(readFileSync(path, "utf8")).some((declaration) => animates(declaration)),
    );
    expect(animated.length).toBeGreaterThan(10);
  });

  it("stills every animation, later in the stylesheet that starts it", () => {
    expect(stylesheets.flatMap((path) => unstilled(path, animates, STILLS_ANIMATION))).toEqual([]);
  });

  it("stills every transition that moves or resizes something", () => {
    expect(stylesheets.flatMap((path) => unstilled(path, movesOnTransition, STILLS_TRANSITION))).toEqual([]);
  });

  it("scrolls smoothly only for whoever did not ask for less motion", () => {
    const unconditional = stylesheets.flatMap((path) =>
      declarationsOf(readFileSync(path, "utf8"))
        .filter((declaration) => SMOOTH_SCROLL.test(declaration.text) && !isUnder(declaration, NO_PREFERENCE))
        .map((declaration) => `${relative(ROOT, path)} ${declaration.selectors.join(", ")}`),
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
