// Copies the board's pieces (lichess's "cburnett" set) to public/pieces.
//
// chessground does not ship loose SVGs: the twelve drawings are embedded in
// base64 inside assets/chessground.cburnett.css, one rule per piece. This script
// decodes them and writes them as files with the names the app's stylesheets use
// (w-knight.svg, b-queen.svg, …), so that the promotion picker, the figurines,
// the diagrams and the image export render exactly the same as the board.
//
//   npm run pieces:sync      run after updating @lichess-org/chessground
//
// chessground's SVGs declare width/height but no viewBox, and without a viewBox
// an SVG image does not scale to the size the CSS asks for (chessground does not
// notice because it uses them at their natural size). When writing them the
// equivalent viewBox, `0 0 width height`, is added, which does not change the
// drawing.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = join(process.cwd(), "node_modules/@lichess-org/chessground/assets/chessground.cburnett.css");
const TARGET_DIR = join(process.cwd(), "public/pieces");

const COLOR_PREFIX: Record<string, string> = { white: "w", black: "b" };
const ROLES = new Set(["pawn", "knight", "bishop", "rook", "queen", "king"]);
const EXPECTED_COUNT = 12;

/** `.cg-wrap piece.knight.black { background-image: url('data:image/svg+xml;base64,…') }` */
const PIECE_RULE =
  /\.cg-wrap piece\.(\w+)\.(\w+)\s*\{\s*background-image:\s*url\(['"]?data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)['"]?\)/g;

function withViewBox(svg: string): string {
  if (/<svg[^>]*\sviewBox=/.test(svg)) return svg;
  const width = /<svg[^>]*\swidth="([\d.]+)"/.exec(svg)?.[1];
  const height = /<svg[^>]*\sheight="([\d.]+)"/.exec(svg)?.[1];
  if (!width || !height) throw new Error("SVG sin viewBox y sin width/height: no se puede escalar.");
  return svg.replace("<svg", `<svg viewBox="0 0 ${width} ${height}"`);
}

function main(): void {
  const css = readFileSync(SOURCE, "utf8");
  mkdirSync(TARGET_DIR, { recursive: true });

  const written: string[] = [];
  for (const [, role = "", color = "", base64 = ""] of css.matchAll(PIECE_RULE)) {
    const prefix = COLOR_PREFIX[color];
    if (!prefix || !ROLES.has(role)) continue;
    const svg = withViewBox(Buffer.from(base64, "base64").toString("utf8"));
    const name = `${prefix}-${role}.svg`;
    writeFileSync(join(TARGET_DIR, name), `${svg.trimEnd()}\n`);
    written.push(name);
  }

  if (written.length !== EXPECTED_COUNT) {
    throw new Error(
      `Esperaba ${EXPECTED_COUNT} piezas y salieron ${written.length}: ${written.join(", ") || "ninguna"}`,
    );
  }
  console.log(`${written.length} piezas escritas en public/pieces desde ${SOURCE}`);
}

main();
