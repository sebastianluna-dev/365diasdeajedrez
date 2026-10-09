// The platform's colours as data. They are declared in ONE place, the `:root`
// block of app/(platform)/platform.css, each as `light-dark(<light>, <dark>)`;
// this reads that block from the stylesheet's text and says what WCAG says
// about writing one on another. It takes the text and never opens a file, so
// the convention test (which reads the stylesheet from disk) and Storybook's
// foundations pages (which import it raw) measure exactly the same thing.

/** Where the tokens are declared, from the repository's root. */
export const TOKENS_FILE = "app/(platform)/platform.css";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** WCAG 2.2, 1.4.3: the least a text has to stand out from what it is written on. */
export const TEXT_MINIMUM = 4.5;

export const PAIR = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/i;
export const ALIAS = /^var\((--platform-[a-z0-9-]+)\)$/;
export const HEX = /^#[0-9a-f]{6}$/i;

/** The name, the value as written (on one line) and the comment written right above it, if any. */
export interface TokenDeclaration {
  name: string;
  value: string;
  note: string | null;
}

export function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** The body of the first `:root` block: the one that declares the tokens. */
function rootBlockOf(css: string): string {
  return /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
}

/**
 * The declarations of the `:root` block, in the order they are written. A
 * comment counts as a token's note only when nothing but blank space stands
 * between it and the declaration: a comment that opens a group (the borders'
 * "two line weights") is the note of the first token of it, not of the rest.
 */
export function readTokenDeclarations(css: string): TokenDeclaration[] {
  const block = rootBlockOf(css);
  const declarations: TokenDeclaration[] = [];
  const pattern = /\/\*([\s\S]*?)\*\/|(--platform-[a-z0-9-]+)\s*:\s*([^;]+);|[^\s]/g;
  let note: string | null = null;
  for (const match of block.matchAll(pattern)) {
    const [, comment, name, value] = match;
    if (comment !== undefined) {
      note = comment.replace(/\s+/g, " ").trim();
    } else if (name && value) {
      declarations.push({ name, value: value.replace(/\s+/g, " ").trim(), note });
      note = null;
    } else {
      // Anything else (`color-scheme: light dark;`, a stray character) ends the note's reach.
      note = null;
    }
  }
  return declarations;
}

/** Every token of the `:root` block, by name, its value on a single line. */
export function readTokens(css: string): Map<string, string> {
  const block = withoutComments(rootBlockOf(css));
  return new Map(
    [...block.matchAll(/(--platform-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1] ?? "",
      (match[2] ?? "").replace(/\s+/g, " ").trim(),
    ]),
  );
}

/** The colour a token paints in a theme, following an alias to the token it names; null when it is not a colour. */
export function colourOf(tokens: ReadonlyMap<string, string>, name: string, theme: Theme, depth = 0): string | null {
  const value = tokens.get(name);
  if (value === undefined || depth > 5) return null;
  const alias = ALIAS.exec(value);
  if (alias?.[1]) return colourOf(tokens, alias[1], theme, depth + 1);
  const pair = PAIR.exec(value);
  if (pair) return (theme === "light" ? pair[1] : pair[2]) ?? null;
  return HEX.test(value) ? value : null;
}

/** Relative luminance of a `#rrggbb`, as WCAG 2 defines it. */
export function luminanceOf(hex: string): number {
  const channel = (offset: number): number => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Contrast ratio of two `#rrggbb`, from 1 (the same colour) to 21 (black on white). */
export function contrastOf(first: string, second: string): number {
  const [lighter = 0, darker = 0] = [luminanceOf(first), luminanceOf(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The contrast of a text token on a background token in a theme; 0 when either is not a colour. */
export function tokenContrast(
  tokens: ReadonlyMap<string, string>,
  text: string,
  background: string,
  theme: Theme,
): number {
  const textColour = colourOf(tokens, text, theme);
  const backgroundColour = colourOf(tokens, background, theme);
  return textColour && backgroundColour ? contrastOf(textColour, backgroundColour) : 0;
}

/** The surfaces a page or a card is made of: white in the light theme. */
export const WHITE_SURFACES = ["surface", "surface-soft"] as const;

/** The grey and tinted fills: the canvas, a table's head, a pill, a row that is hovered or current. */
export const FILLS = ["bg", "surface-neutral", "surface-sunken", "accent-soft", "accent-wash", "accent-mist"] as const;

/** The colours text is written in, on any surface or fill. */
export const TEXT_ANYWHERE = [
  "text",
  "text-title",
  "text-muted",
  "accent-ink",
  "danger",
  "success-ink",
  "warning-ink",
] as const;

/**
 * What is written on what, as token names without `--platform-`. The subtle
 * grey is here for the white surfaces only: on a fill it falls under the
 * minimum, and the muted one is used instead.
 */
export const TEXT_PAIRS: readonly (readonly [text: string, background: string])[] = [
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
  // A played game's «Ganaste»/«Ganó», filled in the success ink (G6).
  ["surface", "success-ink"],
  // The user menu's avatar: the initial in the canvas's colour, on the text's.
  ["bg", "text"],
  // A study's tile: the brand's mark in the accent, on the white surface.
  ["accent", "surface"],
  // The move tree's current and hovered move, on the variations' fill.
  ["text-muted", "variation-soft"],
  // What is chosen: the tick and a chosen day on the selection's fill, its
  // blue as ink on the white, on its tint (a highlighted option, a day under
  // the pointer) and on its wash (a chosen card's description).
  ["on-selection", "selection"],
  ["selection", "surface"],
  ["selection", "selection-soft"],
  ["selection", "selection-wash"],
  // A portrait's initials on each of its six tones.
  ...[1, 2, 3, 4, 5, 6].map((tone) => ["on-avatar", `avatar-${tone}`] as const),
];

/**
 * The families the colours are shown in, in this order, each recognised by
 * its name without `--platform-`; the same groups as the token table of
 * docs/content/ui/styling.mdx. A colour no family claims is shown as "Other"
 * rather than left out, so a new token is never missing from the page.
 */
export const COLOUR_GROUPS: readonly { name: string; pattern: RegExp }[] = [
  { name: "Surfaces", pattern: /^(bg|surface(-[a-z]+)*)$/ },
  { name: "Borders", pattern: /^border(-[a-z]+)*$/ },
  { name: "Text", pattern: /^text(-[a-z]+)*$/ },
  { name: "Accent", pattern: /^(on-accent|accent|accent-(?!on-ink$)[a-z-]+)$/ },
  { name: "Logo", pattern: /^logo(-[a-z]+)*$/ },
  { name: "Selection", pattern: /^(selection(-[a-z]+)*|on-selection)$/ },
  { name: "Progress", pattern: /^(progress|track)$/ },
  { name: "Variations", pattern: /^variation(-[a-z]+)*$/ },
  { name: "Streak", pattern: /^flame(-[a-z]+)*$/ },
  { name: "Semantic", pattern: /^(danger|(success|danger|warning)-[a-z]+)$/ },
  { name: "Ink", pattern: /^(ink|on-ink|accent-on-ink)$/ },
  { name: "Levels", pattern: /^level-[0-9]+$/ },
  { name: "Avatar", pattern: /^(avatar-[0-9]+|on-avatar|ring(-[a-z]+)+)$/ },
];

export interface ColourGroup {
  name: string;
  tokens: TokenDeclaration[];
}

/** The colour tokens of a stylesheet, by family, in the order each family's tokens are written. */
export function groupColours(css: string): ColourGroup[] {
  const tokens = readTokens(css);
  const colours = readTokenDeclarations(css).filter(({ name }) => colourOf(tokens, name, "light") !== null);
  const short = (name: string) => name.replace(/^--platform-/, "");
  const claimed = new Set<string>();
  const groups = COLOUR_GROUPS.map(({ name, pattern }) => {
    const members = colours.filter((token) => !claimed.has(token.name) && pattern.test(short(token.name)));
    members.forEach((token) => claimed.add(token.name));
    return { name, tokens: members };
  });
  const other = colours.filter((token) => !claimed.has(token.name));
  return [...groups, { name: "Other", tokens: other }].filter((group) => group.tokens.length > 0);
}
