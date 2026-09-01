import { createHash } from "node:crypto";

// Identidad de una posición para el buscador por posición. ÚNICA fuente de
// verdad: el cliente manda el FEN y el hash se calcula siempre aquí, en
// servidor. No importar desde un componente "use client" (node:crypto no
// existe en el navegador) ni duplicar esta lógica en ninguna otra parte.
//
// Sin "server-only" a propósito, igual que constants/platform/demo-user.const:
// el seed y los scripts de indexado corren fuera de Next y necesitan importarlo.

/**
 * Los cuatro campos que definen la posición: piezas, turno, derechos de enroque
 * y casilla al paso. Se descartan el reloj de medias jugadas y el número de
 * jugada, que cuentan la historia de la partida y no la posición: dos partidas
 * que transponen por órdenes distintos llegan al mismo sitio con relojes
 * distintos y deben contar como la misma posición.
 *
 * La casilla al paso no necesita tratamiento especial: chessops sólo la escribe
 * cuando la captura es legal de verdad (`legalEpSquare` en `Position.toSetup`),
 * así que un FEN suyo ya viene normalizado en ese punto.
 */
export function normalizePositionFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}

/**
 * Hash determinista de la posición, para indexar y buscar por igualdad.
 *
 * SHA-256 y no Zobrist: el hash sólo tiene que ser estable y sin colisiones
 * prácticas, y esto lo da la librería estándar sin estado que mantener ni
 * tablas que versionar. Zobrist sólo valdría la pena si hubiera que actualizar
 * el hash de forma incremental jugada a jugada, que no es el caso.
 */
export function createPositionHash(fen: string): string {
  return createHash("sha256").update(normalizePositionFen(fen)).digest("hex");
}
