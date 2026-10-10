// Exports the art of an adventure from its version-2 mockup.
//
//   npm run adventure:art -- <path-to-mockup.html> <adventure-slug>
//
// e.g. `npm run adventure:art -- planning/jugar/proposals/aventura/propuesta-b-v2.html cuaderno-del-viajero`.
//
// It reads no `.env.local` and touches no database. It opens the mockup in
// Chromium (Playwright), runs the mockup's own drawing code in the page and
// writes, from what it draws:
//
// - `public/aventuras/<slug>/{escritorio,tableta,movil}.svg`: each layout's
//   scenery with the viewBox of the mockup's bleed (the paper runs 700 units
//   past each side), WITHOUT the live part — the seam, the needle, the stamps,
//   the notebook's pages, the keepsakes, the pencil notes and the token are
//   drawn by the app from data (components/adventure/map); only the paper tape
//   of the path stays in the scenery;
// - `public/aventuras/<slug>/{miniatura-alta,miniatura-ancha}.svg`: the two
//   miniatures' scenery, with no path;
// - `components/adventure/portraits/<rival>-portrait.comp.tsx` ×12 and their
//   registry, the engraved portraits as components (clip paths and patterns
//   keep ids of their own through `useId`);
// - `components/adventure/keepsakes/<slug>-keepsakes.const.tsx`, the drawings
//   of the keepsakes, and `sealed-envelope.comp.tsx`;
// - `components/adventure/map/{player-token,needle}.comp.tsx` and
//   `path-marks.const.ts`, the pieces of the live layer the mockup draws.
//
// The mockup lives in `planning/` (ignored by git): this script is what stays
// in the repository for the next map. Every .tsx goes through Prettier's API,
// as `bots:calibrate` does with its JSON, so `npm run format:check` still
// passes after a run. An SVG over ~400 KB is worth a pass of `svgo`
// (`npx npm@10.8.2 install -D svgo`, a preset that keeps the ids the <use>
// elements point at); the script only says when one is.

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { format, resolveConfig } from "prettier";

const ROOT = process.cwd();
const PAGE_SCRIPT = resolve(ROOT, "scripts/lib/adventure-art-page.js");
const HEAVY_BYTES = 400 * 1024;

const LAYOUTS = [
  { key: "escritorio", file: "escritorio.svg" },
  { key: "tableta", file: "tableta.svg" },
  { key: "movil", file: "movil.svg" },
] as const;
const MINIATURES = [
  { key: "miniatura", file: "miniatura-alta.svg" },
  { key: "miniaturaAncha", file: "miniatura-ancha.svg" },
] as const;

interface ExportedFragment {
  viewBox: string;
  jsx: string;
}

const pascal = (kebab: string) =>
  kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
const constant = (kebab: string) => kebab.toUpperCase().replaceAll("-", "_");

const ATTRIBUTION = `// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run \`npm run adventure:art\` again instead of editing this file by hand.`;

/** Writes `contents` formatted as Prettier would (its config, and the file's own parser). */
async function writeSource(relativePath: string, contents: string): Promise<void> {
  const file = resolve(ROOT, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  const formatted = await format(contents, { ...(await resolveConfig(file)), filepath: file });
  writeFileSync(file, formatted);
  console.log(`  ${relativePath}`);
}

function writeAsset(relativePath: string, contents: string): number {
  const file = resolve(ROOT, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
  return statSync(file).size;
}

const kilobytes = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

async function main(): Promise<void> {
  const [mockupArg, slug] = process.argv.slice(2);
  if (!mockupArg || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error("Usage: npm run adventure:art -- <path-to-mockup.html> <adventure-slug>");
    process.exit(1);
  }
  const mockup = resolve(ROOT, mockupArg);
  readFileSync(mockup); // a missing file fails here, with its path

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on("pageerror", (error) => console.error(`  (the mockup said: ${error.message})`));
    await page.goto(pathToFileURL(mockup).href);
    await page.addScriptTag({ path: PAGE_SCRIPT });
    // The calls go as source text: a closure compiled by tsx would drag its helpers into the page.
    const run = async <T>(expression: string): Promise<T> =>
      (await page.evaluate(`(() => { const api = window.__adventureArt; return ${expression}; })()`)) as T;

    console.log(`Scenery of «${slug}»:`);
    const sizes: Record<string, number> = {};
    for (const { key, file } of [...LAYOUTS, ...MINIATURES]) {
      const method = key.startsWith("miniatura") ? "miniature" : "scene";
      const svg = await run<string>(`api.${method}(${JSON.stringify(key)})`);
      sizes[file] = writeAsset(`public/aventuras/${slug}/${file}`, svg);
      console.log(`  public/aventuras/${slug}/${file}  ${kilobytes(sizes[file]!)}`);
    }
    for (const [file, bytes] of Object.entries(sizes)) {
      if (bytes > HEAVY_BYTES) console.warn(`  ${file} weighs ${kilobytes(bytes)}: a pass of svgo is worth it.`);
    }

    console.log("\nSource files:");
    const rivals = await run<{ id: string; order: number }[]>("api.rivals()");
    const registry: string[] = [];
    for (const [index, rival] of rivals.entries()) {
      const body = await run<string>(`api.portrait(${index})`);
      const name = `${pascal(rival.id)}Portrait`;
      const usesId = body.includes("${id}");
      await writeSource(
        `components/adventure/portraits/${rival.id}-portrait.comp.tsx`,
        `${usesId ? 'import { useId } from "react";\n\n' : ""}${ATTRIBUTION}
//
// The engraved portrait of ${rival.id}, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from \`useId\`, so the same portrait can be on a page twice.

export function ${name}() {
  ${usesId ? "const id = useId();" : ""}
  return <>${body}</>;
}
`,
      );
      registry.push(`  ${JSON.stringify(rival.id)}: ${name},`);
    }
    await writeSource(
      `components/adventure/portraits/${slug}-portraits.const.ts`,
      `import type { ComponentType } from "react";
${rivals.map((rival) => `import { ${pascal(rival.id)}Portrait } from "./${rival.id}-portrait.comp";`).join("\n")}

${ATTRIBUTION}

/** The portraits of «${slug}»'s rivals by the rival's slug; each draws inside a 100 x 112 box. */
export const ${constant(slug)}_PORTRAITS: Readonly<Record<string, ComponentType>> = {
${registry.join("\n")}
};
`,
    );

    const orders = await run<number[]>("api.keepsakes()");
    const drawings: string[] = [];
    const entries: string[] = [];
    let anyId = false;
    for (const order of orders) {
      const { viewBox, jsx } = await run<ExportedFragment>(`api.keepsake(${order})`);
      const usesId = jsx.includes("${id}");
      const usesName = jsx.includes("${name}");
      anyId ||= usesId;
      drawings.push(`function Keepsake${order}Drawing(${usesName ? "{ name }: KeepsakeDrawingProps" : ""}) {
  ${usesId ? "const id = useId();" : ""}
  return <>${jsx}</>;
}`);
      entries.push(`  ${order}: { viewBox: ${JSON.stringify(viewBox)}, Drawing: Keepsake${order}Drawing },`);
    }
    await writeSource(
      `components/adventure/keepsakes/${slug}-keepsakes.const.tsx`,
      `${anyId ? 'import { useId } from "react";\n' : ""}import type { KeepsakeDrawing, KeepsakeDrawingProps } from "@/components/adventure/keepsakes/keepsake-drawing.types";

${ATTRIBUTION}
//
// The keepsakes of «${slug}»: one small drawing per rival, by the rival's
// order, each in its own viewBox. The membership card writes the person's name.

${drawings.join("\n\n")}

/** The drawings of «${slug}»'s keepsakes by the order of the rival that leaves them. */
export const ${constant(slug)}_KEEPSAKES: Readonly<Record<number, KeepsakeDrawing>> = {
${entries.join("\n")}
};
`,
    );

    const envelope = await run<ExportedFragment>("api.envelope()");
    await writeSource(
      "components/adventure/keepsakes/sealed-envelope.comp.tsx",
      `${ATTRIBUTION}

/** The sealed envelope of a keepsake still to win: it draws inside the box \`${envelope.viewBox}\`. */
export const SEALED_ENVELOPE_VIEW_BOX = ${JSON.stringify(envelope.viewBox)};

export function SealedEnvelope() {
  return <>${envelope.jsx}</>;
}
`,
    );

    await writeSource(
      "components/adventure/map/player-token.comp.tsx",
      `${ATTRIBUTION}

interface PlayerTokenProps {
  /** The person's initials, written on the token's head. */
  initials: string;
}

/** The person's token: a red pawn with their initials, standing on the origin (drawn upward, 60 x 94 around it). */
export function PlayerToken({ initials }: PlayerTokenProps) {
  return <>${await run<string>("api.token()")}</>;
}
`,
    );
    await writeSource(
      "components/adventure/map/needle.comp.tsx",
      `${ATTRIBUTION}

/** The needle that leads the seam: its point on the origin, pointing to the right. */
export function Needle() {
  return <>${await run<string>("api.needle()")}</>;
}
`,
    );
    const marks = await run<{ pawn: string; knight: string; star: string }>("api.marks()");
    await writeSource(
      "components/adventure/map/path-marks.const.ts",
      `${ATTRIBUTION}

/** The small marks printed along the paper tape (a pawn, a knight and a star), as the mockup draws them. */
export const PATH_MARKS = {
  pawn: ${JSON.stringify(marks.pawn)},
  knight: ${JSON.stringify(marks.knight)},
  star: ${JSON.stringify(marks.star)},
} as const;
`,
    );
  } finally {
    await browser.close();
  }
  console.log("\nDone. Remember `npm run lint` and `npm run typecheck`.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
