import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  COLOUR_GROUPS,
  PAIR,
  TEXT_MINIMUM,
  TEXT_PAIRS,
  THEMES,
  TOKENS_FILE,
  colourOf,
  readTokens,
  tokenContrast,
  withoutComments,
} from "@/lib/platform-tokens";

// The platform's colours live in ONE place, the `:root` block of platform.css,
// each as a pair of light and dark. Three things can go wrong without anybody
// seeing it: a colour written as a single value (the dark theme keeps the light
// one), a token that is used and was never declared (the browser falls back in
// silence), and a text colour put on a fill it does not read on. This reads
// the stylesheets from disk and fails on the three. What the tokens are, how
// a pair is read and what is written on what live in lib/platform-tokens.ts,
// which Storybook's foundations pages draw from as well.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Where a `--platform-*` token can be used: any stylesheet or component of the app. */
const SOURCES = ["app", "components"];

/** The stylesheets drawn with the platform's tokens; the same list as the corners' rule. */
const PLATFORM_STYLES = ["app/(platform)", "app/(auth)", "components/platform", "components/auth", "components/chess"];

/**
 * The tokens that are not a pair, and why. Anything else declared in `:root`
 * has to be `light-dark(<light>, <dark>)`: that is what makes the dark theme a
 * matter of one line per colour.
 */
/** A length, which a token of the type or space scale is. */
const LENGTH = /^\d+px$/;

const NOT_A_PAIR: Record<string, string> = {
  "--platform-logo-accent": "an alias of the accent",
  "--platform-variation": "an alias of the subtle text grey",
  "--platform-variation-soft": "an alias of the neutral surface",
  "--platform-flame": "the streak's flame is the same in both themes",
  "--platform-flame-core": "the streak's flame is the same in both themes",
  "--platform-font": "not a colour",
  "--platform-font-display": "not a colour",
  "--platform-font-serif": "not a colour",
  "--platform-shadow-card": "a list of shadows, with its pairs inside",
  "--platform-shadow-bar": "a shadow, drawn in the border's colour",
};

function filesOf(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

const TOKENS = readTokens(readFileSync(join(ROOT, TOKENS_FILE), "utf8"));

/** "text on background: light 4.39" for every theme in which the pair is under the minimum. */
function shortfallsOf(text: string, background: string): string[] {
  return THEMES.flatMap((theme) => {
    const contrast = tokenContrast(TOKENS, text, background, theme);
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
    // A length (the type and space scales) is not a colour.
    const single = [...TOKENS].filter(
      ([name, value]) => !PAIR.test(value) && !LENGTH.test(value) && !(name in NOT_A_PAIR),
    );
    expect(single.map(([name, value]) => `${name}: ${value}`)).toEqual([]);
  });

  it("keep their list of exceptions true", () => {
    // An exception that became a pair, or was deleted, leaves the list.
    const stale = Object.keys(NOT_A_PAIR).filter((name) =>
      PAIR.test(TOKENS.get(name) ?? "light-dark(#000000, #000000)"),
    );
    expect(stale).toEqual([]);
  });

  it("fall each in one family of Storybook's Colours page, at most", () => {
    // groupColours draws each colour once, so two families claiming one would
    // hand it silently to the first of them, which may be the wrong one; none
    // claiming it draws it under "Other", which is allowed.
    const colours = [...TOKENS.keys()].filter((name) => colourOf(TOKENS, name, "light") !== null);
    expect(colours.length).toBeGreaterThan(40);
    const twice = colours.filter(
      (name) => COLOUR_GROUPS.filter(({ pattern }) => pattern.test(name.replace("--platform-", ""))).length > 1,
    );
    expect(twice).toEqual([]);
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
      expect(tokenContrast(TOKENS, "--platform-text-subtle", `--platform-${fill}`, "light"), fill).toBeLessThan(
        TEXT_MINIMUM,
      );
      expect(
        tokenContrast(TOKENS, "--platform-text-muted", `--platform-${fill}`, "light"),
        fill,
      ).toBeGreaterThanOrEqual(TEXT_MINIMUM);
    }
  });
});
