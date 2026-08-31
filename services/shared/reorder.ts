// Reordenación de listas con `@@unique([padre, order])` (bloques de clase,
// capítulos, lecciones, ejercicios).
//
// El problema: PostgreSQL valida el índice único fila a fila y Prisma no emite
// constraints diferibles, así que el intercambio «obvio» —A→orden de B, B→orden
// de A— lanza P2002 de forma intermitente: durante un instante las dos filas
// comparten orden. Por eso el intercambio pasa SIEMPRE por un valor temporal
// fuera de rango.
//
// Toda la lógica de secuencia vive en funciones puras (testeables con
// permutaciones); los servicios sólo ejecutan la lista de updates que devuelven,
// en orden y dentro de una `$transaction`. Prohibido reordenar «a mano» fuera de
// este módulo.

export interface ReorderRow {
  id: string;
  order: number;
}

export interface OrderUpdate {
  id: string;
  order: number;
}

export type MoveDirection = "up" | "down";

/**
 * Orden temporal para el intercambio. Negativo a propósito: los órdenes reales
 * empiezan en 1, así que ningún valor legítimo puede colisionar con él.
 */
export const TEMP_ORDER = -1;

function sortByOrder(rows: ReorderRow[]): ReorderRow[] {
  return [...rows].sort((left, right) => left.order - right.order);
}

/**
 * Updates —en orden— para mover una fila una posición arriba o abajo.
 * Devuelve [] si la fila no existe o ya está en el extremo: mover el primero
 * hacia arriba no es un error, simplemente no hace nada.
 */
export function planSwap(rows: ReorderRow[], id: string, direction: MoveDirection): OrderUpdate[] {
  const sorted = sortByOrder(rows);
  const index = sorted.findIndex((row) => row.id === id);
  if (index === -1) return [];

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return [];

  const moved = sorted[index];
  const displaced = sorted[targetIndex];

  return [
    // La fila que se mueve sale primero del rango válido: así la que ocupa su
    // sitio nunca comparte orden con ella.
    { id: moved.id, order: TEMP_ORDER },
    { id: displaced.id, order: moved.order },
    { id: moved.id, order: displaced.order },
  ];
}

/**
 * Updates para dejar la lista densa (1..n) después de borrar una fila. Van en
 * orden ASCENDENTE a propósito: el hueco que deja la fila borrada viaja por
 * delante de cada actualización, así que ninguna encuentra su destino ocupado.
 * Se llama DESPUÉS del delete, con las filas restantes.
 */
export function planDenseRenumber(rows: ReorderRow[]): OrderUpdate[] {
  const updates: OrderUpdate[] = [];
  sortByOrder(rows).forEach((row, index) => {
    const order = index + 1;
    // Cerrar huecos sólo baja los órdenes, nunca los sube: por eso el destino
    // siempre está libre cuando se aplica en ascendente.
    if (row.order !== order) updates.push({ id: row.id, order });
  });
  return updates;
}

/** Orden de la fila que se añade al final de una lista de `count` elementos. */
export function nextOrder(count: number): number {
  return count + 1;
}
