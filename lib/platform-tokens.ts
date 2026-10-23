// The platform's colours as data. They are declared in ONE place, the `:root`
// block of app/(platform)/platform.css, each as `light-dark(<light>, <dark>)`;
// this reads that block from the stylesheet's text and says what WCAG says
// about writing one on another. It takes the text and never opens a file, so
// the convention test (which reads the stylesheet from disk) and Storybook's
// foundations pages (which import it raw) measure exactly the same thing.
//
// The adventure's paper has a palette of its own with the same shape — its
// block is `.adventure` of components/adventure/adventure.css and its names
// start with `--adventure-` — so the readers take a `TokenSet` saying where
// the tokens are and how they are named, and the platform's is the default.

/** Where a family of tokens is declared and how its names begin. */
export interface TokenSet {
  /** What every name starts with: `--platform-`. */
  prefix: string;
  /** The rule that declares them, as the stylesheet writes it: `:root`, `.adventure`. */
  selector: string;
  /** The stylesheet, from the repository's root. */
  file: string;
}

/** Where the tokens are declared, from the repository's root. */
export const TOKENS_FILE = "app/(platform)/platform.css";

/** The platform's tokens: the `:root` of platform.css. */
export const PLATFORM_TOKEN_SET: TokenSet = { prefix: "--platform-", selector: ":root", file: TOKENS_FILE };

/** The adventure's: the `.adventure` block of its own stylesheet. */
export const ADVENTURE_TOKEN_SET: TokenSet = {
  prefix: "--adventure-",
  selector: ".adventure",
  file: "components/adventure/adventure.css",
};

const escapeForRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A declaration of a token of the set: its name and its value, up to the `;`. */
const declarationOf = (set: TokenSet): RegExp =>
  new RegExp(`(${escapeForRegExp(set.prefix)}[a-z0-9-]+)\\s*:\\s*([^;]+);`, "g");

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** WCAG 2.2, 1.4.3: the least a text has to stand out from what it is written on. */
export const TEXT_MINIMUM = 4.5;

export const PAIR = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/i;
export const ALIAS = /^var\((--[a-z0-9-]+)\)$/;
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

/** The body of the first block of the set's selector: the one that declares the tokens. */
function rootBlockOf(css: string, set: TokenSet): string {
  return new RegExp(`(?:^|\\n)${escapeForRegExp(set.selector)}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css)?.[1] ?? "";
}

/**
 * The declarations of the `:root` block, in the order they are written. A
 * comment counts as a token's note only when nothing but blank space stands
 * between it and the declaration: a comment that opens a group (the borders'
 * "two line weights") is the note of the first token of it, not of the rest.
 */
export function readTokenDeclarations(css: string, set: TokenSet = PLATFORM_TOKEN_SET): TokenDeclaration[] {
  const block = rootBlockOf(css, set);
  const declarations: TokenDeclaration[] = [];
  const pattern = new RegExp(
    `\\/\\*([\\s\\S]*?)\\*\\/|(${escapeForRegExp(set.prefix)}[a-z0-9-]+)\\s*:\\s*([^;]+);|[^\\s]`,
    "g",
  );
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
export function readTokens(css: string, set: TokenSet = PLATFORM_TOKEN_SET): Map<string, string> {
  const block = withoutComments(rootBlockOf(css, set));
  return new Map(
    [...block.matchAll(declarationOf(set))].map((match) => [
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

// --- What a stylesheet writes on what -------------------------------------------

export type Rule = { selector: string; declarations: string };

/** The rules of a stylesheet with the declarations that are their OWN, nested rules left out. */
export function rulesOf(css: string): Rule[] {
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

/** The token a rule's own `color` reads, when it reads one of the set. */
export function ownColourOf(rule: Rule, set: TokenSet): string | undefined {
  const prefix = escapeForRegExp(set.prefix);
  return new RegExp(`(?:^|;)\\s*color\\s*:\\s*var\\(\\s*(${prefix}[a-z0-9-]+)\\s*[,)]`).exec(rule.declarations)?.[1];
}

/** The token a rule's own `background` or `background-color` reads, when it reads one of the set. */
export function ownBackgroundOf(rule: Rule, set: TokenSet): string | undefined {
  const prefix = escapeForRegExp(set.prefix);
  return new RegExp(`(?:^|;)\\s*background(?:-color)?\\s*:\\s*var\\(\\s*(${prefix}[a-z0-9-]+)\\s*[,)]`).exec(
    rule.declarations,
  )?.[1];
}

/** A control that is switched off is exempt from the minimum (WCAG 1.4.3, inactive components). */
const INACTIVE = /:disabled|\[disabled\]|\[data-disabled\]|\[aria-disabled(?:="true")?\]/;

/** Switched off in every selector of the list; `:not(:disabled)` is the control that is ON. */
export function isInactive(selector: string): boolean {
  return selector
    .replace(/:not\([^)]*\)/g, "")
    .split(",")
    .every((one) => INACTIVE.test(one));
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
  // the pointer) and on its wash (a chosen card's description). The text on
  // that wash: the student's notice of the classes paid without a date.
  ["on-selection", "selection"],
  ["selection", "surface"],
  ["selection", "selection-soft"],
  ["selection", "selection-wash"],
  ["text", "selection-wash"],
  // A portrait's initials on each of its six tones.
  ...[1, 2, 3, 4, 5, 6].map((tone) => ["on-avatar", `avatar-${tone}`] as const),
  // Material 3 (the new design system): its two inks on its canvas, panel
  // and containers, the primary as ink on the white and on the container, and
  // each «on» role on its own fill.
  ...["m3-on-surface", "m3-on-surface-variant"].flatMap((text) =>
    ["m3-canvas", "m3-panel", "m3-container", "m3-container-high"].map((background) => [text, background] as const),
  ),
  ["m3-primary", "m3-panel"],
  ["m3-primary", "m3-container"],
  ["m3-success", "m3-panel"],
  ["m3-on-primary", "m3-primary"],
  ["m3-on-primary", "m3-primary-hover"],
  ["m3-on-primary-container", "m3-primary-container"],
  ["m3-on-secondary-container", "m3-secondary-container"],
  ["m3-on-success", "m3-success"],
  ["m3-on-success-container", "m3-success-container"],
  ["m3-on-warning-container", "m3-warning-container"],
  ["m3-on-info-container", "m3-info-container"],
  ["m3-on-class-container", "m3-class-container"],
  // A continuation's move, count and share, written over its bar.
  ["m3-on-surface", "m3-primary-wash"],
  ["m3-on-surface-variant", "m3-primary-wash"],
  ["m3-error", "m3-canvas"],
  ["m3-error", "m3-panel"],
  ["m3-error", "m3-container-high"],
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
  { name: "Material 3", pattern: /^m3-[a-z0-9-]+$/ },
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
