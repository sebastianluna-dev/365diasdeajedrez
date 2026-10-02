import { describe, expect, it } from "vitest";
import {
  COLOUR_GROUPS,
  FILLS,
  TEXT_PAIRS,
  WHITE_SURFACES,
  colourOf,
  contrastOf,
  groupColours,
  readTokenDeclarations,
  readTokens,
  tokenContrast,
} from "./platform-tokens";

const STYLESHEET = `
:root {
  /* Which theme is drawn. */
  color-scheme: light dark;

  /* The canvas. */
  --platform-bg: light-dark(#f6f6f6, #14100d);
  --platform-surface: light-dark(#ffffff, #1e1a16);

  /* Two line weights. */
  --platform-border: light-dark(#e6e6e6, #2e2926);
  --platform-border-strong: light-dark(#dcdcdc, #413a34);

  --platform-text: light-dark(#16110d, #f2ede7);
  --platform-ink: light-dark(#16110d, #0d0a08);
  --platform-accent: light-dark(#a81e22, #ff9143);
  --platform-accent-on-ink: light-dark(#f44046, #ff9143);
  --platform-logo-accent: var(--platform-accent);
  --platform-flame: #ffb82f;
  --platform-mystery: light-dark(#123456, #654321);
  --platform-font: var(--font-sf-pro), sans-serif;
  --platform-shadow-card:
    light-dark(0 0 0 0 transparent, 0 0 0 1px var(--platform-border)),
    0 1px 2px rgba(0, 0, 0, 0.05);
}
:root[data-theme="dark"] {
  --platform-bg: #000000;
}
`;

describe("readTokens", () => {
  const tokens = readTokens(STYLESHEET);

  it("reads the first :root block only, each value on one line", () => {
    expect(tokens.get("--platform-bg")).toBe("light-dark(#f6f6f6, #14100d)");
    expect(tokens.get("--platform-shadow-card")).toBe(
      "light-dark(0 0 0 0 transparent, 0 0 0 1px var(--platform-border)), 0 1px 2px rgba(0, 0, 0, 0.05)",
    );
    expect(tokens.size).toBe(13);
  });
});

describe("readTokenDeclarations", () => {
  const declarations = readTokenDeclarations(STYLESHEET);
  const noteOf = (name: string) => declarations.find((token) => token.name === name)?.note;

  it("keeps the order the tokens are written in", () => {
    expect(declarations.map(({ name }) => name).slice(0, 3)).toEqual([
      "--platform-bg",
      "--platform-surface",
      "--platform-border",
    ]);
  });

  it("gives a token the comment written right above it", () => {
    expect(noteOf("--platform-bg")).toBe("The canvas.");
    expect(noteOf("--platform-border")).toBe("Two line weights.");
  });

  it("does not hand a group's comment to the rest of the group", () => {
    expect(noteOf("--platform-surface")).toBeNull();
    expect(noteOf("--platform-border-strong")).toBeNull();
  });

  it("does not hand a comment across another declaration", () => {
    // "Which theme is drawn." sits above `color-scheme`, not above a token.
    expect(declarations.some(({ note }) => note === "Which theme is drawn.")).toBe(false);
  });
});

describe("colourOf", () => {
  const tokens = readTokens(STYLESHEET);

  it("takes the half of a pair that the theme draws", () => {
    expect(colourOf(tokens, "--platform-accent", "light")).toBe("#a81e22");
    expect(colourOf(tokens, "--platform-accent", "dark")).toBe("#ff9143");
  });

  it("follows an alias, and a single value is the same in both themes", () => {
    expect(colourOf(tokens, "--platform-logo-accent", "dark")).toBe("#ff9143");
    expect(colourOf(tokens, "--platform-flame", "dark")).toBe("#ffb82f");
  });

  it("is null for what is not a colour, and for an alias that never ends", () => {
    expect(colourOf(tokens, "--platform-font", "light")).toBeNull();
    expect(colourOf(tokens, "--platform-shadow-card", "light")).toBeNull();
    expect(colourOf(tokens, "--platform-missing", "light")).toBeNull();
    const loop = new Map([
      ["--platform-a", "var(--platform-b)"],
      ["--platform-b", "var(--platform-a)"],
    ]);
    expect(colourOf(loop, "--platform-a", "light")).toBeNull();
  });
});

describe("contrast", () => {
  it("is measured as WCAG does", () => {
    expect(contrastOf("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastOf("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(contrastOf("#ffffff", "#777777")).toBeCloseTo(4.48, 2);
  });

  it("between two tokens is 0 when either is not a colour", () => {
    const tokens = readTokens(STYLESHEET);
    expect(tokenContrast(tokens, "--platform-text", "--platform-surface", "light")).toBeGreaterThan(17);
    expect(tokenContrast(tokens, "--platform-font", "--platform-surface", "light")).toBe(0);
  });
});

describe("TEXT_PAIRS", () => {
  it("lists every pair once", () => {
    const keys = TEXT_PAIRS.map(([text, background]) => `${text} on ${background}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("puts the subtle grey on the white surfaces and on no fill", () => {
    const subtleOn = TEXT_PAIRS.filter(([text]) => text === "text-subtle").map(([, background]) => background);
    expect(subtleOn).toEqual([...WHITE_SURFACES]);
    expect(subtleOn.some((background) => (FILLS as readonly string[]).includes(background))).toBe(false);
  });
});

describe("groupColours", () => {
  const groups = groupColours(STYLESHEET);
  const namesIn = (group: string) =>
    groups.find(({ name }) => name === group)?.tokens.map(({ name }) => name.replace("--platform-", ""));

  it("shows the colours only, by family, in the families' order", () => {
    expect(groups.map(({ name }) => name)).toEqual([
      "Surfaces",
      "Borders",
      "Text",
      "Accent",
      "Logo",
      "Streak",
      "Ink",
      "Other",
    ]);
    expect(namesIn("Accent")).toEqual(["accent"]);
    expect(namesIn("Logo")).toEqual(["logo-accent"]);
    expect(namesIn("Ink")).toEqual(["ink", "accent-on-ink"]);
  });

  it("shows a colour no family claims as Other instead of leaving it out", () => {
    expect(namesIn("Other")).toEqual(["mystery"]);
  });

  it("has families that never claim the same name twice", () => {
    const names = [
      "accent-on-ink",
      "on-accent",
      "accent-soft",
      "logo-accent",
      "danger",
      "danger-soft",
      "surface-soft",
      "text-subtle",
    ];
    for (const name of names) {
      const claimants = COLOUR_GROUPS.filter(({ pattern }) => pattern.test(name)).map((group) => group.name);
      expect(claimants, name).toHaveLength(1);
    }
  });
});
