// Rastreo del movetext en busca de tokens que NI SIQUIERA tienen forma de
// jugada («Qz9», «Bx99»), que es el error más probable en un PGN escrito a
// mano.
//
// Por qué hace falta: el tokenizador de chessops los descarta antes de que
// nuestra validación los vea, así que la rama desaparece del árbol sin dejar
// rastro y `parsePgnTree` no tiene nada de lo que avisar. Aquí se mira el texto
// crudo, antes de que nadie lo interprete.
//
// El listón es ALTO a propósito: sólo se avisa de lo que no encaja en la
// gramática SAN habiendo quitado todo lo que legítimamente vive en un movetext.
// Un falso positivo en una partida buena es peor que callarse en una mala.

/**
 * La gramática SAN, tal y como se escribe en un PGN:
 * enroques, jugada de pieza (con desambiguación y captura opcionales) y jugada
 * de peón (con captura y coronación opcionales), más jaque, mate y los signos
 * que a veces se pegan al final.
 */
const SAN_PATTERN =
  /^(?:[O0]-[O0](?:-[O0])?|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h](?:[1-8]|x[a-h][1-8])(?:=?[QRBN])?)[+#]?[!?]{0,2}$/;

/** El resultado de la partida, que cierra el movetext y no es una jugada. */
const RESULT_PATTERN = /^(?:1-0|0-1|1\/2-1\/2|\*)$/;

/**
 * Tokens que no son jugadas pero aparecen en movetexts reales: la jugada nula
 * de los módulos y los puntos suspensivos sueltos de algunos exportadores.
 */
const TOLERATED = new Set(["--", "Z0", "...", "…"]);

/** Deja sólo el movetext: fuera cabeceras, comentarios y comandos. */
function movetextOf(pgn: string): string {
  return pgn
    .replace(/^\s*\[[^\]]*\]\s*$/gm, " ") // cabeceras
    .replace(/\{[^}]*\}/g, " ") // comentarios entre llaves
    .replace(/;[^\n]*/g, " ") // comentario hasta el fin de línea, empiece donde empiece
    .replace(/^\s*%.*$/gm, " ") // líneas de escape del estándar
    .replace(/<[^>]*>/g, " ") // tokens reservados
    .replace(/[()]/g, " ") // paréntesis de variante
    .replace(/\$\d+/g, " ") // NAGs
    .replace(/\b\d+\.(?:\.\.)?/g, " "); // números de jugada, con o sin puntos
}

/**
 * Los tokens del movetext que no son una jugada válida.
 *
 * Devuelve cada uno UNA vez y en el orden en que aparecen: un PGN con la misma
 * errata repetida se avisa una sola vez, que es lo que hay que corregir.
 */
export function findMalformedMoveTokens(pgn: string): string[] {
  const seen = new Set<string>();

  for (const token of movetextOf(pgn).split(/\s+/)) {
    if (token.length === 0 || TOLERATED.has(token)) continue;
    if (RESULT_PATTERN.test(token) || SAN_PATTERN.test(token)) continue;
    seen.add(token);
  }

  return [...seen];
}
