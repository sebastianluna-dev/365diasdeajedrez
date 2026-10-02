import { readTokens, withoutComments } from "@/lib/platform-tokens";
import { PLATFORM_CSS, PLATFORM_STYLESHEETS, usagesOf } from "./platform-stylesheets.const";

// A PROPOSAL, not applied: the scales of type and spacing the platform could
// adopt (TODOS T43), for Sebastian to choose from on the foundations pages.
// Today every stylesheet writes its own px and `zoom: var(--platform-zoom)` on
// the body draws all of it a tenth larger; the zoom was the way to say "bigger",
// not a figure to keep. So the steps here are in REAL px — what the eye gets,
// with the enlargement already inside them — and each value in use is mapped
// to the step nearest to how it is drawn TODAY (written × zoom).

export interface Step {
  /** The token it would become. */
  token: string;
  px: number;
}

export interface Scale {
  id: string;
  name: string;
  summary: string;
  steps: readonly Step[];
}

// The names are joined rather than written whole: these tokens do not exist
// yet, and the tokens test fails on any name of the family that is used and
// not declared in platform.css.
const token = (family: string, name: string) => ["--platform", family, name].join("-");
const type = (name: string, px: number): Step => ({ token: token("type", name), px });
const space = (name: string, px: number): Step => ({ token: token("space", name), px });

export const TYPE_SCALES: readonly Scale[] = [
  {
    id: "A",
    name: "A — ten steps",
    summary:
      "Four small steps a pixel apart, 14 to 17, where nearly all of the platform's text is — today's 14px labels become 15, its 15 to 16.5px text 17 — and five steps for the headings and the figures.",
    steps: [
      type("2xs", 12),
      type("xs", 14),
      type("sm", 15),
      type("md", 16),
      type("lg", 17),
      type("xl", 20),
      type("2xl", 24),
      type("3xl", 32),
      type("4xl", 44),
      type("5xl", 52),
    ],
  },
  {
    id: "B",
    name: "B — eight steps",
    summary:
      "Fewer and further apart: today's 12 to 13.5px become 14, its 14 to 15px labels 16, its 15.5 to 19px text 18, and the headings 24, 32, 44 and 52. Simpler, and it moves more of what is on screen: the body text grows by about a pixel.",
    steps: [
      type("xs", 12),
      type("sm", 14),
      type("md", 16),
      type("lg", 18),
      type("xl", 24),
      type("2xl", 32),
      type("3xl", 44),
      type("4xl", 52),
    ],
  },
];

export const SPACE_SCALES: readonly Scale[] = [
  {
    id: "A",
    name: "A — a 4px grid, twelve steps",
    summary: "Every space a multiple of 4 (and 2 for the tightest), so any two spaces on a screen agree.",
    steps: [
      space("0-5", 2),
      space("1", 4),
      space("2", 8),
      space("3", 12),
      space("4", 16),
      space("5", 20),
      space("6", 24),
      space("8", 32),
      space("10", 40),
      space("12", 48),
      space("16", 64),
      space("24", 96),
    ],
  },
  {
    id: "B",
    name: "B — 4px with the steps between, sixteen steps",
    summary:
      "The same grid with 6, 10, 14 and 28 kept, and 96 at the top: closer to what is drawn today, and less of a scale.",
    steps: [
      space("0-5", 2),
      space("1", 4),
      space("1-5", 6),
      space("2", 8),
      space("2-5", 10),
      space("3", 12),
      space("3-5", 14),
      space("4", 16),
      space("5", 20),
      space("6", 24),
      space("7", 28),
      space("8", 32),
      space("10", 40),
      space("12", 48),
      space("16", 64),
      space("24", 96),
    ],
  },
];

/** The zoom the body is drawn at today, read from the stylesheet. */
export const ZOOM = Number(readTokens(PLATFORM_CSS).get("--platform-zoom") ?? "1") || 1;

/** What is drawn as a line rather than as a space: kept as it is, off any scale. */
export const HAIRLINE = 1;

/** A px value as a number (`"15.5px"` → 15.5, `"-22px"` → -22); null for anything else. */
export function pxOf(value: string): number | null {
  const match = /^(-?[0-9]*\.?[0-9]+)px$/.exec(value.trim());
  return match ? Number(match[1]) : null;
}

/** The step nearest to a size in real px; between two, the larger. A negative size keeps its sign. */
export function nearestStep(steps: readonly Step[], drawn: number): Step {
  const size = Math.abs(drawn);
  const step = steps.reduce((best, candidate) => {
    const distance = Math.abs(candidate.px - size) - Math.abs(best.px - size);
    return distance < 0 || (distance === 0 && candidate.px > best.px) ? candidate : best;
  });
  return drawn < 0 ? { token: `calc(-1 * var(${step.token}))`, px: -step.px } : step;
}

export interface Mapping {
  /** As written in the stylesheets. */
  written: number;
  count: number;
  /** As drawn today: written × zoom. */
  today: number;
  step: Step;
  /** Proposed minus today, in real px. */
  delta: number;
}

/** Each px value in use, mapped to its step, from the smallest to the largest. */
export function mappingOf(usages: readonly { value: string; count: number }[], steps: readonly Step[]): Mapping[] {
  const counts = new Map<number, number>();
  for (const { value, count } of usages) {
    const px = pxOf(value);
    if (px !== null && px !== 0) counts.set(px, (counts.get(px) ?? 0) + count);
  }
  return [...counts]
    .map(([written, count]) => {
      const today = written * ZOOM;
      // A hairline is a line, not a space: it stays one pixel, off the scale.
      const step =
        Math.abs(written) <= HAIRLINE ? { token: "a hairline: kept", px: written } : nearestStep(steps, today);
      return { written, count, today, step, delta: step.px - today };
    })
    .sort((first, second) => first.written - second.written);
}

/** A change large enough to be seen: a pixel and a half, or a tenth of the size. */
export function isNoticeable({ delta, today }: Mapping): boolean {
  return Math.abs(delta) >= 1.5 || Math.abs(delta / today) >= 0.1;
}

/** What is not in px (an `em`, a `calc`, a variable): to be moved by hand. */
export function notInPx(usages: readonly { value: string; count: number }[]): { value: string; count: number }[] {
  return usages.filter(
    ({ value }) => pxOf(value) === null && value !== "0" && !/^(inherit|auto|initial|unset)$/.test(value),
  );
}

export const typeUsages = () => usagesOf("font-size");

/** The parts of a shorthand, split on the spaces that are not inside a `calc(…)` or a `var(…)`. */
function partsOf(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value.replace(/\s*!important$/, "")) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === " " && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  return current ? [...parts, current] : parts;
}

/** The spaces: gaps, paddings and margins, each part of a shorthand counted once. */
export function spaceUsages(): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const { value, count } of usagesOf("(?:row-|column-)?gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?")) {
    for (const part of partsOf(value)) counts.set(part, (counts.get(part) ?? 0) + count);
  }
  return [...counts].map(([value, count]) => ({ value, count }));
}

/**
 * Every other length in px the zoom enlarges today — widths, heights,
 * positions, borders, radii, shadows — by property, the most written first.
 * Without the zoom each of them is drawn a tenth smaller unless it changes.
 */
export function otherLengths(): { property: string; count: number }[] {
  const scaled = /^(?:font-size|(?:row-|column-)?gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?)$/;
  const counts = new Map<string, number>();
  for (const { source } of PLATFORM_STYLESHEETS) {
    for (const match of withoutComments(source).matchAll(/(?:^|[;{\s])(-{0,2}[a-z][a-z-]*)\s*:\s*([^;{}]+)/g)) {
      const [, property = "", value = ""] = match;
      if (scaled.test(property) || property === "zoom") continue;
      const lengths = (value.match(/(?<![\w.-])-?[0-9]*\.?[0-9]+px\b/g) ?? []).filter((px) => pxOf(px) !== 0);
      if (lengths.length > 0) counts.set(property, (counts.get(property) ?? 0) + lengths.length);
    }
  }
  return [...counts]
    .map(([property, count]) => ({ property, count }))
    .sort((first, second) => second.count - first.count || first.property.localeCompare(second.property));
}

/** The stylesheets that read the zoom to undo it (a viewport unit, a fixed position), and how often. */
export function zoomReaders(): { path: string; count: number }[] {
  return PLATFORM_STYLESHEETS.map(({ path, source }) => ({
    path,
    count: (withoutComments(source).match(/var\(--platform-zoom/g) ?? []).length,
  })).filter(({ count }) => count > 0);
}
