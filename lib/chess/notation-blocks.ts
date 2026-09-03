import type { PgnTree, PgnTreeNode } from "./pgn-tree";

// Cómo se ordena una notación de ajedrez para leerla.
//
// La línea principal va en una rejilla de dos columnas (blancas / negras) y
// todo lo demás —comentarios y variantes— va a lo ancho. Son dos cajas que
// tienen que alternarse, así que en vez de pintar el árbol recursivamente se
// emite una LISTA de bloques en el orden en que se leen. Aquí sólo se decide
// ese orden; quién lo pinta es cosa del componente.
//
// Módulo puro y sin JSX a propósito: las reglas de abajo son sutiles —cuándo se
// parte un par, qué baja de nivel— y se comprueban con tests en lugar de
// mirando una pantalla.

export interface NotationRow {
  kind: "row";
  key: string;
  number: number;
  white?: PgnTreeNode;
  black?: PgnTreeNode;
  /** Las blancas jugaron en un renglón anterior: su hueco lleva «…». */
  continuation: boolean;
  /** La respuesta de negras bajó de renglón: su hueco lleva «…». */
  pushedBlack: boolean;
}

export interface NotationComment {
  kind: "comment";
  key: string;
  text: string;
}

export type LineItem =
  | { type: "move"; node: PgnTreeNode; withNumber: boolean }
  | { type: "comment"; text: string };

export interface NotationLine {
  kind: "line";
  key: string;
  /** 0 = variante de la línea principal; cada nivel sangra un escalón más. */
  depth: number;
  items: LineItem[];
}

export type NotationBlock = NotationRow | NotationComment | NotationLine;

const moveNumberOf = (node: PgnTreeNode): number => Math.ceil(node.ply / 2);
const isWhite = (node: PgnTreeNode): boolean => node.ply % 2 === 1;

/**
 * Emite una variante y lo que cuelga de ella.
 *
 * La regla que decide dónde se corta es la BIFURCACIÓN, no el comentario: una
 * jugada con una sola continuación sigue en el mismo renglón, y una con varias
 * lo cierra y baja **todas** sus opciones un nivel —también la principal—.
 *
 * Se ve claro en una línea real: `1...e6 2.Cf3 f5` se corta en f5 porque de ahí
 * salen tres jugadas, y las tres se listan sangradas debajo. Si sólo bajaran
 * las alternativas, la principal quedaría pegada a f5 y las otras dos parecerían
 * colgar de otro sitio.
 */
function emitLine(start: PgnTreeNode, depth: number, out: NotationBlock[]): void {
  const items: LineItem[] = [];
  let current: PgnTreeNode | undefined = start;
  let withNumber = true;

  while (current) {
    const node: PgnTreeNode = current;
    items.push({ type: "move", node, withNumber });
    withNumber = false;

    if (node.comment) {
      items.push({ type: "comment", text: node.comment });
      // Tras un comentario la jugada siguiente vuelve a numerarse: el texto de
      // por medio corta la lectura y «Cf6» a secas no diría de quién es.
      withNumber = true;
    }

    if (node.children.length > 1) {
      out.push({ kind: "line", key: start.path, depth, items });
      for (const child of node.children) emitLine(child, depth + 1, out);
      return;
    }

    current = node.children[0];
  }

  out.push({ kind: "line", key: start.path, depth, items });
}

/** La notación entera, en el orden en que se lee. */
export function buildNotationBlocks(tree: PgnTree): NotationBlock[] {
  const blocks: NotationBlock[] = [];
  let pending: NotationRow | null = null;

  const flush = () => {
    if (pending) blocks.push(pending);
    pending = null;
  };

  let current: PgnTreeNode | undefined = tree.children[0];
  // Las alternativas a una jugada NO viven en ella, sino entre los hermanos que
  // cuelgan de su padre: se calculan al pasar por el padre y se emiten en la
  // vuelta siguiente, junto a la jugada a la que sustituyen.
  let variationsForCurrent = tree.children.slice(1);

  while (current) {
    const node: PgnTreeNode = current;
    const number = moveNumberOf(node);
    const [next, ...siblings] = node.children;
    const variations = variationsForCurrent;
    variationsForCurrent = siblings;

    if (isWhite(node)) {
      flush();
      pending = { kind: "row", key: node.path, number, white: node, continuation: false, pushedBlack: false };
    } else if (pending && !pending.black && pending.number === number) {
      pending.black = node;
    } else {
      const hadPrevious: boolean = pending !== null || blocks.length > 0;
      flush();
      pending = { kind: "row", key: node.path, number, black: node, continuation: hadPrevious, pushedBlack: false };
    }

    if (node.comment || variations.length > 0) {
      // Lo que va a lo ancho cierra la fila. Si quien lo trae es una jugada de
      // blancas Y hay respuesta detrás, el hueco de negras lleva «…»: si no, la
      // fila se leería como que las negras no contestaron.
      if (pending && isWhite(node) && next && !isWhite(next)) pending.pushedBlack = true;
      flush();

      if (node.comment) blocks.push({ kind: "comment", key: `${node.path}-comment`, text: node.comment });
      for (const variation of variations) emitLine(variation, 0, blocks);
    }

    current = next;
  }

  flush();
  return blocks;
}
