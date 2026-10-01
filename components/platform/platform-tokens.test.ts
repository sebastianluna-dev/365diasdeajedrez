import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The platform's colours live in ONE place, the `:root` block of platform.css,
// each as a pair of light and dark. Three things can go wrong without anybody
// seeing it: a colour written as a single value (the dark theme keeps the light
// one), a token that is used and was never declared (the browser falls back in
// silence), and a text colour put on a fill it does not read on. This reads
// the stylesheets from disk and fails on the three.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const TOKENS_FILE = "app/(platform)/platform.css";

/** Where a `--platform-*` token can be used: any stylesheet or component of the app. */
const SOURCES = ["app", "components"];

/** The stylesheets drawn with the platform's tokens; the same list as the corners' rule. */
const PLATFORM_STYLES = ["app/(platform)", "app/(auth)", "components/platform", "components/auth", "components/chess"];

const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

/** WCAG 2.2, 1.4.3: the least a text has to stand out from what it is written on. */
const TEXT_MINIMUM = 4.5;

const PAIR = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/i;
const ALIAS = /^var\((--platform-[a-z0-9-]+)\)$/;
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * The tokens that are not a pair, and why. Anything else declared in `:root`
 * has to be `light-dark(<light>, <dark>)`: that is what makes the dark theme a
 * matter of one line per colour.
 */
const NOT_A_PAIR: Record<string, string> = {
  "--platform-logo-accent": "an alias of the accent",
  "--platform-variation": "an alias of the subtle text grey",
  "--platform-variation-soft": "an alias of the neutral surface",
  "--platform-flame": "the streak's flame is the same in both themes",
  "--platform-flame-core": "the streak's flame is the same in both themes",
  "--platform-font": "not a colour",
  "--platform-font-display": "not a colour",
  "--platform-font-serif": "not a colour",
  "--platform-zoom": "not a colour",
  "--platform-shadow-card": "a list of shadows, with its pairs inside",
  "--platform-shadow-bar": "a shadow, drawn in the border's colour",
};

/** The surfaces a page or a card is made of: white in the light theme. */
const WHITE_SURFACES = ["surface", "surface-soft"];

/** The grey and tinted fills: the canvas, a table's head, a pill, a row that is hovered or current. */
const FILLS = ["bg", "surface-neutral", "surface-sunken", "accent-soft", "accent-wash", "accent-mist"];

/** The colours text is written in, on any surface or fill. */
const TEXT_ANYWHERE = ["text", "text-title", "text-muted", "accent-ink", "danger", "success-ink", "warning-ink"];

/**
 * What is written on what. The subtle grey is here for the white surfaces
 * only: on a fill it falls under the minimum (see the last test), and the
 * muted one is used instead.
 */
const TEXT_PAIRS: readonly (readonly [text: string, background: string])[] = [
  ...TEXT_ANYWHERE.flatMap((text) => [...WHITE_SURFACES, ...FILLS].map((background) => [text, background] as const)),
  ...WHITE_SURFACES.map((background) => ["text-subtle", background] as const),
  ["on-accent", "accent"],
  ["on-accent", "accent-hover"],
  ["on-accent", "accent-bright"],
  ["on-ink", "ink"],
  ["accent-on-ink", "ink"],
  ["success-ink", "success-soft"],
  ["danger", "danger-soft"],
  ["warning-ink", "warning-soft"],
  // The ink button and the danger button's hover are written in the surface.
  ["surface", "text"],
  ["surface", "danger"],
];

function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function filesOf(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

/** The declarations of the one `:root` block, each value on a single line. */
function readTokens(): Map<string, string> {
  const css = withoutComments(readFileSync(join(ROOT, TOKENS_FILE), "utf8"));
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  return new Map(
    [...block.matchAll(/(--platform-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1] ?? "",
      (match[2] ?? "").replace(/\s+/g, " ").trim(),
    ]),
  );
}

const TOKENS = readTokens();

/** The colour a token paints in a theme, following an alias to the token it names. */
function colourOf(name: string, theme: Theme, depth = 0): string | null {
  const value = TOKENS.get(name);
  if (value === undefined || depth > 5) return null;
  const alias = ALIAS.exec(value);
  if (alias?.[1]) return colourOf(alias[1], theme, depth + 1);
  const pair = PAIR.exec(value);
  if (pair) return (theme === "light" ? pair[1] : pair[2]) ?? null;
  return HEX.test(value) ? value : null;
}

/** Relative luminance of a `#rrggbb`, as WCAG 2 defines it. */
function luminanceOf(hex: string): number {
  const channel = (offset: number): number => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Contrast ratio of two `#rrggbb`, from 1 (the same colour) to 21 (black on white). */
function contrastOf(first: string, second: string): number {
  const [lighter = 0, darker = 0] = [luminanceOf(first), luminanceOf(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The contrast of a text token on a background token in a theme; 0 when either is not a colour. */
function tokenContrast(text: string, background: string, theme: Theme): number {
  const textColour = colourOf(text, theme);
  const backgroundColour = colourOf(background, theme);
  return textColour && backgroundColour ? contrastOf(textColour, backgroundColour) : 0;
}

/** "text on background: light 4.39" for every theme in which the pair is under the minimum. */
function shortfallsOf(text: string, background: string): string[] {
  return THEMES.flatMap((theme) => {
    const contrast = tokenContrast(text, background, theme);
    return contrast < TEXT_MINIMUM
      ? [
          `${text.replace("--platform-", "")} on ${background.replace("--platform-", "")}: ${theme} ${contrast.toFixed(2)}`,
        ]
      : [];
  });
}

type Rule = { selector: string; declarations: string };

/** The rules of a stylesheet with the declarations that are their OWN, nested rules left out. */
function rulesOf(css: string): Rule[] {
  const rules: Rule[] = [];
  const open: Rule[] = [{ selector: "", declarations: "" }];
  let pending = "";
  for (const character of withoutComments(css)) {
    if (character === "{") {
      open.push({ selector: pending.trim().replace(/\s+/g, " "), declarations: "" });
      pending = "";
    } else if (character === "}") {
      const rule = open.pop();
      if (rule) rules.push({ ...rule, declarations: rule.declarations + pending });
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

const OWN_COLOUR = /(?:^|;)\s*color\s*:\s*var\(\s*(--platform-[a-z0-9-]+)\s*[,)]/;
const OWN_BACKGROUND = /(?:^|;)\s*background(?:-color)?\s*:\s*var\(\s*(--platform-[a-z0-9-]+)\s*[,)]/;

/** A control that is switched off is exempt from the minimum (WCAG 1.4.3, inactive components). */
const INACTIVE = /:disabled|\[disabled\]|\[data-disabled\]|\[aria-disabled(?:="true")?\]/;

/** Switched off in every selector of the list; `:not(:disabled)` is the control that is ON. */
function isInactive(selector: string): boolean {
  return selector
    .replace(/:not\([^)]*\)/g, "")
    .split(",")
    .every((one) => INACTIVE.test(one));
}

type Written = { where: string; text: string; background: string };

/** Every rule of the platform that sets, itself, both a text colour and the fill behind it. */
function writtenPairs(): Written[] {
  return PLATFORM_STYLES.flatMap((directory) => filesOf(join(ROOT, directory), [".css"])).flatMap((path) =>
    rulesOf(readFileSync(path, "utf8")).flatMap((rule) => {
      const text = OWN_COLOUR.exec(rule.declarations)?.[1];
      const background = OWN_BACKGROUND.exec(rule.declarations)?.[1];
      if (!text || !background || isInactive(rule.selector)) return [];
      return [{ where: `${relative(ROOT, path)} ${rule.selector}`, text, background }];
    }),
  );
}

describe("the platform's tokens", () => {
  it("are found", () => {
    // A renamed file or a reshaped `:root` would leave the rules below watching nothing.
    expect(TOKENS.size).toBeGreaterThan(40);
  });

  it("are a pair of light and dark, every colour of them", () => {
    const single = [...TOKENS].filter(([name, value]) => !PAIR.test(value) && !(name in NOT_A_PAIR));
    expect(single.map(([name, value]) => `${name}: ${value}`)).toEqual([]);
  });

  it("keep their list of exceptions true", () => {
    // An exception that became a pair, or was deleted, leaves the list.
    const stale = Object.keys(NOT_A_PAIR).filter((name) =>
      PAIR.test(TOKENS.get(name) ?? "light-dark(#000000, #000000)"),
    );
    expect(stale).toEqual([]);
  });

  it("are declared, every one that is used", () => {
    const sources = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory), [".css", ".tsx", ".ts"]));
    expect(sources.length).toBeGreaterThan(300);

    const undeclared = sources.flatMap((path) => {
      const content = readFileSync(path, "utf8");
      const used = new Set(content.match(/--platform-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []);
      return [...used].filter((name) => !TOKENS.has(name)).map((name) => `${relative(ROOT, path)}: ${name}`);
    });
    expect(undeclared).toEqual([]);
  });
});

describe("the platform's contrast", () => {
  it("is measured as WCAG does", () => {
    expect(contrastOf("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastOf("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("reaches 4.5:1 for every text on the surfaces it is written on, in both themes", () => {
    const shortfalls = TEXT_PAIRS.flatMap(([text, background]) =>
      shortfallsOf(`--platform-${text}`, `--platform-${background}`),
    );
    expect(shortfalls).toEqual([]);
  });

  it("reaches 4.5:1 in every rule that sets a text colour and its own fill", () => {
    const written = writtenPairs();
    // Fewer than this means the stylesheets were not found or the reading broke.
    expect(written.length).toBeGreaterThan(100);

    const shortfalls = written.flatMap(({ where, text, background }) =>
      shortfallsOf(text, background).map((shortfall) => `${where} — ${shortfall}`),
    );
    expect(shortfalls).toEqual([]);
  });

  it("is why the subtle grey stays on the white surfaces", () => {
    // The rule this file exists for, seen to fail: on a fill, the subtle grey
    // of the light theme is under the minimum, and the muted one is not.
    for (const fill of ["bg", "surface-neutral", "surface-sunken", "accent-soft"]) {
      expect(tokenContrast("--platform-text-subtle", `--platform-${fill}`, "light"), fill).toBeLessThan(TEXT_MINIMUM);
      expect(tokenContrast("--platform-text-muted", `--platform-${fill}`, "light"), fill).toBeGreaterThanOrEqual(
        TEXT_MINIMUM,
      );
    }
  });
});
