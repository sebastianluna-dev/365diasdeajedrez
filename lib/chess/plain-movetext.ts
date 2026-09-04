import { extractMainline } from "./mainline";

// El PGN «en limpio»: sólo la línea principal, sin variantes, sin comentarios,
// sin anotaciones y sin cabeceras.
//
// Es lo que se pega en un chat, en un buscador de aperturas o en otro programa
// cuando lo que se quiere compartir son LAS JUGADAS y no el trabajo de análisis
// que hay alrededor. El PGN completo sigue estando a un botón de distancia.

/** Posición de partida estándar: cuando es esa, no hace falta decir nada. */
const STANDARD_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Numera los SAN como se escriben: «1. e4 e5 2. Cf3».
 *
 * El número de la primera jugada y de quién es sale del FEN de partida, no de
 * cero: una partida que arranca en la jugada 24 y de negras se leería como una
 * apertura si se numerase desde el principio.
 */
function numberMoves(sans: string[], initialFen: string): string {
  const fields = initialFen.split(" ");
  let moveNumber = Number(fields[5]);
  let whiteToMove = fields[1] !== "b";
  if (!Number.isFinite(moveNumber) || moveNumber < 1) moveNumber = 1;

  const parts: string[] = [];
  for (const [index, san] of sans.entries()) {
    if (whiteToMove) parts.push(`${moveNumber}.`);
    else if (index === 0) parts.push(`${moveNumber}...`);

    parts.push(san);

    if (!whiteToMove) moveNumber += 1;
    whiteToMove = !whiteToMove;
  }
  return parts.join(" ");
}

/**
 * La línea principal de un PGN, a secas. Null si no hay ninguna jugada que
 * copiar.
 *
 * ÚNICA excepción a lo de «sin cabeceras»: si la partida no empieza en la
 * posición inicial, se conservan `SetUp` y `FEN`. Sin ellas, las jugadas no se
 * pueden reproducir en ningún sitio y lo copiado no valdría para nada, que es
 * peor que llevar dos líneas de más.
 */
export function plainMovetext(pgn: string): string | null {
  const mainline = extractMainline(pgn);
  if (!mainline) return null;

  const initialFen = mainline.initialFen ?? STANDARD_START;
  const moves = numberMoves(mainline.sans, initialFen);

  return mainline.initialFen === null
    ? moves
    : `[SetUp "1"]\n[FEN "${mainline.initialFen}"]\n\n${moves}`;
}
