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
