import { readTokenDeclarations, withoutComments } from "@/lib/platform-tokens";
import { PLATFORM_CSS, PLATFORM_STYLESHEETS, usagesOf } from "./platform-stylesheets.const";

// The platform's scales of type and space, as the foundations pages draw them:
// the steps are the type and space tokens (`--platform-type-2xs` to `--platform-type-5xl`, `--platform-space-0-5` to `--platform-space-24`) of the
// `:root` of platform.css, read from it, and how often each is written is
// counted in the stylesheets. They took the place of the `zoom: 1.1` the body
// carried until 2026-10-02 (TODOS T43).

export interface Step {
  token: string;
  px: number;
  /** The comment written above the token, for the first of a family. */
  note: string | null;
}

function stepsOf(family: "type" | "space"): Step[] {
  const prefix = ["--platform", family, ""].join("-");
  return readTokenDeclarations(PLATFORM_CSS)
    .filter(({ name }) => name.startsWith(prefix))
    .map(({ name, value, note }) => ({ token: name, px: Number.parseFloat(value), note }))
    .sort((first, second) => first.px - second.px);
}

export const TYPE_STEPS = stepsOf("type");
export const SPACE_STEPS = stepsOf("space");

/** How many times a token is written across the platform's stylesheets. */
export function usesOf(token: string): number {
  const reference = new RegExp(`var\\(${token}[,)]`, "g");
  return PLATFORM_STYLESHEETS.reduce(
    (sum, { source }) => sum + (withoutComments(source).match(reference) ?? []).length,
    0,
  );
}

/** A length in px left in a value once the tokens, and the fallbacks they carry for the public site, are taken out. */
const pxLeftIn = (value: string) =>
  value.replace(/var\(--platform-(?:type|space)-[a-z0-9-]+(?:,\s*[^)]*)?\)/g, "").match(/-?\d*\.?\d+px/g) ?? [];

/** The font sizes still written in px, off the scale: what each is and how often. */
export function typeOffScale(): { value: string; count: number }[] {
  return usagesOf("font-size|--[a-z-]*font-size").filter(({ value }) => pxLeftIn(value).length > 0);
}

/**
 * The spaces still written in px: a hairline of 1px, which is a line and not a
 * space, and the px inside a `calc()` of geometry (a mark's centre, a step of
 * indentation), which belong to what they measure.
 */
export function spaceOffScale(): { value: string; count: number }[] {
  return usagesOf("(?:row-|column-)?gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?").filter(
    ({ value }) => pxLeftIn(value).length > 0,
  );
}

/**
 * A PROPOSAL, not applied (TODOS T43): what each step would become from
 * 1536px wide (Tailwind's `2xl`), where there is room to spare, for
 * Sebastian to choose on the «Large screens» page. Type: a pixel more on the
 * small steps and about a tenth on the large ones. Space: the steps up to
 * 12px as they are, the rest about an eighth more, on the 4px grid.
 */
export const FROM_2XL: Readonly<Record<string, number>> = {
  "--platform-type-2xs": 13,
  "--platform-type-xs": 15,
  "--platform-type-sm": 16,
  "--platform-type-md": 17,
  "--platform-type-lg": 18,
  "--platform-type-xl": 22,
  "--platform-type-2xl": 26,
  "--platform-type-3xl": 36,
  "--platform-type-4xl": 48,
  "--platform-type-5xl": 56,
  "--platform-space-0-5": 2,
  "--platform-space-1": 4,
  "--platform-space-2": 8,
  "--platform-space-3": 12,
  "--platform-space-4": 20,
  "--platform-space-5": 24,
  "--platform-space-6": 28,
  "--platform-space-8": 36,
  "--platform-space-10": 44,
  "--platform-space-12": 56,
  "--platform-space-16": 72,
  "--platform-space-24": 108,
};

/** The proposal as custom properties, to draw anything inside it at the larger scale. */
export const FROM_2XL_PROPERTIES = Object.fromEntries(
  Object.entries(FROM_2XL).map(([token, px]) => [token, `${px}px`]),
) as Record<string, string>;
