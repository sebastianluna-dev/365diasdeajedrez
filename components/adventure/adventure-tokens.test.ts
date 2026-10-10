import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ADVENTURE_TOKEN_SET,
  PAIR,
  TEXT_MINIMUM,
  THEMES,
  isInactive,
  ownBackgroundOf,
  ownColourOf,
  readTokens,
  rulesOf,
  tokenContrast,
} from "@/lib/platform-tokens";

// The adventure's paper has a palette of its own, declared in ONE place — the
// `.adventure` block of components/adventure/adventure.css — each colour as
// `light-dark(<light>, <dark>)`: the same three ways to go wrong as the
// platform's (see platform-tokens.test.ts), and the same three rules. The
// platform's list of what is written on what does not apply to the paper, so
// this one has its own; the reading of the stylesheets is lib/platform-tokens.ts.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SET = ADVENTURE_TOKEN_SET;

/** Where a `--adventure-*` token can be used: any stylesheet or component of the app. */
const SOURCES = ["app", "components"];

/** The paper's own stylesheets: what a rule writes there is read for its contrast. */
const ADVENTURE_STYLES = "components/adventure";

/** The tokens that are not a pair of colours, and why. */
const NOT_A_PAIR: Record<string, string> = {
  "--adventure-font-title": "not a colour",
  "--adventure-font-note": "not a colour",
  "--adventure-font-hand": "not a colour",
  "--adventure-font-data": "not a colour",
  "--adventure-shadow": "a list of shadows, with its pairs inside",
  "--adventure-shadow-lift": "a list of shadows, with its pairs inside",
};

/**
 * What is written on what, as token names without `--adventure-`: every ink on
 * the papers it is written on, the small print on the kraft, the tag's text on
 * its brick and the desk's text on the wood.
 */
const TEXT_PAIRS: readonly (readonly [text: string, background: string])[] = [
  ...["ink", "ink-soft", "graphite", "brick"].flatMap((text) =>
    ["paper", "cream", "cream-bright", "ticket", "ticket-quiet"].map((background) => [text, background] as const),
  ),
  ["ink", "kraft-pale"],
  ["ink-soft", "kraft-pale"],
  ["graphite", "kraft-pale"],
  ["brick-deep", "kraft-pale"],
  ["brick-deep", "cream"],
  ["brick-deep", "cream-bright"],
  ["on-brick", "brick-fill"],
  ["on-brick", "brick-fill-deep"],
  ["on-wood", "wood"],
  ["on-wood-soft", "wood"],
];

function filesOf(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesOf(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

const TOKENS = readTokens(readFileSync(join(ROOT, SET.file), "utf8"), SET);

const short = (name: string) => name.replace(SET.prefix, "");

/** "ink on paper: dark 4.39" for every theme in which the pair is under the minimum. */
function shortfallsOf(text: string, background: string): string[] {
  return THEMES.flatMap((theme) => {
    const contrast = tokenContrast(TOKENS, text, background, theme);
    return contrast < TEXT_MINIMUM ? [`${short(text)} on ${short(background)}: ${theme} ${contrast.toFixed(2)}`] : [];
  });
}

type Written = { where: string; text: string; background: string };

/** Every rule of the paper's stylesheets that sets, itself, both a text colour and the fill behind it. */
function writtenPairs(): Written[] {
  return filesOf(join(ROOT, ADVENTURE_STYLES), [".css"]).flatMap((path) =>
    rulesOf(readFileSync(path, "utf8")).flatMap((rule) => {
      const text = ownColourOf(rule, SET);
      const background = ownBackgroundOf(rule, SET);
      if (!text || !background || isInactive(rule.selector)) return [];
      return [{ where: `${relative(ROOT, path)} ${rule.selector}`, text, background }];
    }),
  );
}

describe("the adventure's tokens", () => {
  it("are found", () => {
    // A renamed file or a reshaped block would leave the rules below watching nothing.
    expect(TOKENS.size).toBeGreaterThan(25);
  });

  it("are a pair of light and dark, every colour of them", () => {
    const single = [...TOKENS].filter(([name, value]) => !PAIR.test(value) && !(name in NOT_A_PAIR));
    expect(single.map(([name, value]) => `${name}: ${value}`)).toEqual([]);
  });

  it("keep their list of exceptions true", () => {
    // An exception that became a pair, was deleted or never was a token leaves the list.
    const stale = Object.keys(NOT_A_PAIR).filter((name) => !TOKENS.has(name) || PAIR.test(TOKENS.get(name) ?? ""));
    expect(stale).toEqual([]);
  });

  it("decide the theme on the element that declares them", () => {
    // Lightning CSS declares its helper variables wherever it finds `color-scheme`:
    // away from the tokens, every colour of the paper would come out empty.
    const css = readFileSync(join(ROOT, SET.file), "utf8");
    const block = /\n\.adventure\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
    expect(block).toMatch(/^\s*color-scheme:\s*light dark;/m);
    expect(block).toMatch(/:root\[data-theme="light"\]\s*&\s*\{\s*color-scheme:\s*light;/);
    expect(block).toMatch(/:root\[data-theme="dark"\]\s*&\s*\{\s*color-scheme:\s*dark;/);
  });

  it("are declared, every one that is used", () => {
    const sources = SOURCES.flatMap((directory) => filesOf(join(ROOT, directory), [".css", ".tsx", ".ts"]));
    expect(sources.length).toBeGreaterThan(300);

    const undeclared = sources.flatMap((path) => {
      const content = readFileSync(path, "utf8");
      const used = new Set(content.match(/--adventure-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []);
      return [...used].filter((name) => !TOKENS.has(name)).map((name) => `${relative(ROOT, path)}: ${name}`);
    });
    expect(undeclared).toEqual([]);
  });

  it("are used only by the paper's own stylesheets and components", () => {
    // The platform's sheets do not know the paper: its colours would be missing
    // wherever the paper is not under them.
    const strays = ["app", "components/platform", "components/auth", "components/chess"]
      .flatMap((directory) => filesOf(join(ROOT, directory), [".css"]))
      .filter((path) => readFileSync(path, "utf8").includes("--adventure-"))
      .map((path) => relative(ROOT, path));
    expect(strays).toEqual([]);
  });
});

describe("the adventure's contrast", () => {
  it("reaches 4.5:1 for every text on the papers it is written on, in both themes", () => {
    const shortfalls = TEXT_PAIRS.flatMap(([text, background]) =>
      shortfallsOf(`${SET.prefix}${text}`, `${SET.prefix}${background}`),
    );
    expect(shortfalls).toEqual([]);
  });

  it("names only tokens that exist in the list of what is written on what", () => {
    const missing = TEXT_PAIRS.flatMap(([text, background]) => [text, background])
      .filter((name) => !TOKENS.has(`${SET.prefix}${name}`))
      .map((name) => `--adventure-${name}`);
    expect(missing).toEqual([]);
  });

  it("reaches 4.5:1 in every rule that sets a text colour and its own fill", () => {
    const written = writtenPairs();
    const shortfalls = written.flatMap(({ where, text, background }) =>
      shortfallsOf(text, background).map((shortfall) => `${where} — ${shortfall}`),
    );
    expect(shortfalls).toEqual([]);
  });

  it("lists in the pairs every one a rule writes", () => {
    const listed = new Set(
      TEXT_PAIRS.map(([text, background]) => `${SET.prefix}${text} on ${SET.prefix}${background}`),
    );
    const unlisted = writtenPairs()
      .filter(({ text, background }) => !listed.has(`${text} on ${background}`))
      .map(({ where, text, background }) => `${where} — ${short(text)} on ${short(background)}`);
    expect(unlisted).toEqual([]);
  });
});
