// Lectura de las líneas `info` que escupe un motor UCI.
//
// Módulo puro: el worker sólo pasa texto, y todo lo que hay que entender de él
// —a quién favorece la puntuación, cómo se lee un mate, dónde acaba la línea—
// se decide y se prueba aquí.

export interface EngineInfo {
  /**
   * Qué línea de las pedidas es ésta: 1 es la mejor. El motor la omite cuando
   * sólo se le pide una, así que se asume 1 en ese caso.
   */
  multipv: number;
  depth: number;
  /** Ventaja en peones, SIEMPRE desde el punto de vista de las blancas. */
  score: number;
  /** Jugadas hasta el mate, en signo de blancas. `null` si no hay mate a la vista. */
  mateIn: number | null;
  /** Línea principal en UCI («e2e4 e7e5»), tal cual la da el motor. */
  pv: string[];
}

/** Con cuántas medias jugadas de ventaja se pinta la barra llena en un mate. */
const MATE_SCORE = 100;

/**
 * Lee una línea `info` del motor. Devuelve `null` si no es una con evaluación
 * —hay muchas de trámite, como las de `currmove` o `string`—.
 *
 * El motor puntúa desde el punto de vista de QUIEN MUEVE, así que en una
 * posición de negras un `+1.2` significa que van mejor las negras. Aquí se
 * normaliza a blancas de una vez, que es como se lee un tablero: si no, la
 * barra saltaría de lado en cada jugada.
 */
export function parseEngineInfo(line: string, turn: "white" | "black"): EngineInfo | null {
  if (!line.startsWith("info ")) return null;

  const tokens = line.split(/\s+/);
  const depthAt = tokens.indexOf("depth");
  const scoreAt = tokens.indexOf("score");
  if (depthAt === -1 || scoreAt === -1) return null;

  const depth = Number(tokens[depthAt + 1]);
  const kind = tokens[scoreAt + 1];
  const value = Number(tokens[scoreAt + 2]);
  if (!Number.isFinite(depth) || !Number.isFinite(value)) return null;

  const multipvAt = tokens.indexOf("multipv");
  const multipv = multipvAt === -1 ? 1 : Number(tokens[multipvAt + 1]);
  if (!Number.isFinite(multipv) || multipv < 1) return null;

  const sign = turn === "white" ? 1 : -1;
  const pvAt = tokens.indexOf("pv");
  const pv = pvAt === -1 ? [] : tokens.slice(pvAt + 1).filter((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token));

  if (kind === "mate") {
    return { multipv, depth, score: sign * (value >= 0 ? MATE_SCORE : -MATE_SCORE), mateIn: sign * value, pv };
  }
  if (kind !== "cp") return null;

  return { multipv, depth, score: (sign * value) / 100, mateIn: null, pv };
}

/**
 * Cuánto llena la barra, de 0 (ganan las negras) a 1 (ganan las blancas).
 *
 * No es lineal a propósito: la diferencia entre +0,3 y +1,0 se nota en la
 * partida, y entre +7 y +9 ya no. La curva logística reparte casi todo el
 * recorrido en el rango donde la ventaja aún se discute.
 */
export function evaluationBarFill(score: number): number {
  return 1 / (1 + Math.exp(-0.42 * score));
}

/** La puntuación como se escribe en un tablero: «+1.4», «−0.7», «M3». */
export function formatEvaluation(info: EngineInfo): string {
  if (info.mateIn !== null) {
    const moves = Math.abs(info.mateIn);
    return `${info.mateIn >= 0 ? "+" : "−"}M${moves}`;
  }
  const rounded = Math.abs(info.score).toFixed(1);
  if (info.score > 0) return `+${rounded}`;
  if (info.score < 0) return `−${rounded}`;
  return "0.0";
}

/**
 * Numera una línea del módulo como se escribiría en una partida: «18. Cd5 Dxb2
 * 19. Axf7+».
 *
 * El número y el turno salen del FEN, no de la posición inicial: la línea
 * empieza donde está el tablero, y sin eso una sugerencia en la jugada 30 se
 * leería como si fuera la apertura. Cuando toca a las negras, la primera lleva
 * los puntos suspensivos que dicen que su par ya se jugó.
 */
export function formatEngineLine(fen: string, sans: string[]): string {
  const fields = fen.split(" ");
  let moveNumber = Number(fields[5]);
  let whiteToMove = fields[1] !== "b";
  if (!Number.isFinite(moveNumber) || moveNumber < 1) moveNumber = 1;

  const parts: string[] = [];
  for (const [index, san] of sans.entries()) {
    if (whiteToMove) parts.push(`${moveNumber}.`);
    else if (index === 0) parts.push(`${moveNumber}…`);

    parts.push(san);

    if (!whiteToMove) moveNumber += 1;
    whiteToMove = !whiteToMove;
  }
  return parts.join(" ");
}

/** Las continuaciones conocidas de una posición, indexadas por número de línea. */
export interface EngineLines {
  fen: string;
  byIndex: Record<number, EngineInfo>;
}

/**
 * Incorpora una evaluación recién llegada a lo que ya se sabe.
 *
 * El motor emite cada línea por separado y cada una avanza a su ritmo, así que
 * se guardan por índice y la nueva sustituye a la suya. Si el FEN no es el de
 * lo acumulado se empieza de cero: mezclar líneas de dos posiciones dejaría en
 * pantalla una sugerencia imposible.
 */
export function mergeEngineLines(
  current: EngineLines | null,
  fen: string,
  info: EngineInfo,
): EngineLines {
  const byIndex = current?.fen === fen ? { ...current.byIndex } : {};
  byIndex[info.multipv] = info;
  return { fen, byIndex };
}

/** Las líneas de `fen`, la mejor primero. Vacío si lo guardado es de otra posición. */
export function orderedEngineLines(current: EngineLines | null, fen: string): EngineInfo[] {
  if (current?.fen !== fen) return [];
  return Object.keys(current.byIndex)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => current.byIndex[index]);
}
