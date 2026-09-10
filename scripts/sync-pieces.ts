// Copia las piezas del tablero (juego «cburnett» de lichess) a public/pieces.
//
// chessground no trae SVG sueltos: los doce dibujos van incrustados en base64
// dentro de assets/chessground.cburnett.css, una regla por pieza. Este script
// los decodifica y los escribe como archivos con el nombre que usan las hojas
// de la app (w-knight.svg, b-queen.svg, …), para que el selector de coronación,
// los figurines, los diagramas y la exportación a imagen pinten exactamente lo
// mismo que el tablero.
//
//   npm run pieces:sync      ejecutar tras actualizar @lichess-org/chessground
//
// Los SVG de chessground declaran width/height pero no viewBox, y sin viewBox
// una imagen SVG no se escala al tamaño que le pide el CSS (chessground no lo
// nota porque los usa a su tamaño natural). Al escribirlos se les añade el
// viewBox equivalente, `0 0 width height`, que no cambia el dibujo.

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
  for (const [, role, color, base64] of css.matchAll(PIECE_RULE)) {
    const prefix = COLOR_PREFIX[color];
    if (!prefix || !ROLES.has(role)) continue;
    const svg = withViewBox(Buffer.from(base64, "base64").toString("utf8"));
    const name = `${prefix}-${role}.svg`;
    writeFileSync(join(TARGET_DIR, name), `${svg.trimEnd()}\n`);
    written.push(name);
  }

  if (written.length !== EXPECTED_COUNT) {
    throw new Error(`Esperaba ${EXPECTED_COUNT} piezas y salieron ${written.length}: ${written.join(", ") || "ninguna"}`);
  }
  console.log(`${written.length} piezas escritas en public/pieces desde ${SOURCE}`);
}

main();
