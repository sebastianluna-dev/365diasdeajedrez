// Reordering lists with `@@unique([parent, order])` (class blocks, chapters,
// lessons, exercises).
//
// The problem: PostgreSQL validates the unique index row by row and Prisma does
// not emit deferrable constraints, so the "obvious" swap — A→B's order, B→A's
// order — throws P2002 intermittently: for an instant the two rows share an
// order. That is why the swap ALWAYS goes through a temporary out-of-range value.
//
// All the sequence logic lives in pure functions (testable with permutations);
// the services only execute the list of updates they return, in order and within
// a `$transaction`. Reordering "by hand" outside this module is forbidden.

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
 * Temporary order for the swap. Negative on purpose: the real orders start at 1,
 * so no legitimate value can collide with it.
 */
export const TEMP_ORDER = -1;

function sortByOrder(rows: ReorderRow[]): ReorderRow[] {
  return [...rows].sort((left, right) => left.order - right.order);
}

/**
 * Updates — in order — to move a row one position up or down.
 * It returns [] if the row does not exist or is already at the end: moving the
 * first one up is not an error, it simply does nothing.
 */
export function planSwap(rows: ReorderRow[], id: string, direction: MoveDirection): OrderUpdate[] {
  const sorted = sortByOrder(rows);
  const index = sorted.findIndex((row) => row.id === id);
  if (index === -1) return [];

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return [];

  const moved = sorted[index];
  const displaced = sorted[targetIndex];
  if (!moved || !displaced) return [];

  return [
    // The row that moves leaves the valid range first: that way the one taking its
    // place never shares an order with it.
    { id: moved.id, order: TEMP_ORDER },
    { id: displaced.id, order: moved.order },
    { id: moved.id, order: displaced.order },
  ];
}

/**
 * Updates to leave the list dense (1..n) after deleting a row. They go in
 * ASCENDING order on purpose: the gap the deleted row leaves travels ahead of
 * each update, so none finds its destination occupied.
 * It is called AFTER the delete, with the remaining rows.
 */
export function planDenseRenumber(rows: ReorderRow[]): OrderUpdate[] {
  const updates: OrderUpdate[] = [];
  sortByOrder(rows).forEach((row, index) => {
    const order = index + 1;
    // Closing gaps only lowers the orders, never raises them: that is why the
    // destination is always free when applied in ascending order.
    if (row.order !== order) updates.push({ id: row.id, order });
  });
  return updates;
}

/** Order of the row added at the end of a list of `count` elements. */
export function nextOrder(count: number): number {
  return count + 1;
}

/**
 * Updates to leave the rows in the order `orderedIds` says (1..n).
 *
 * It is what is needed when dragging: two neighbours are not swapped, one is
 * placed anywhere and all those in between shift. There the unique index
 * problem gets worse — half the list wants the order the other half still
 * occupies — so it goes in TWO passes: first the ones that move leave the valid
 * range to temporaries that differ from each other, and only afterwards do they
 * take their final order. No intermediate update clashes with another.
 *
 * It returns `[]` if `orderedIds` is not exactly the set of rows: it comes from
 * the browser and an incomplete list would erase positions. Doing nothing is
 * the right thing — the server does not reorder halfway — and whoever calls it
 * already has the good list in the database.
 */
export function planFullReorder(rows: ReorderRow[], orderedIds: string[]): OrderUpdate[] {
  if (orderedIds.length !== rows.length) return [];

  const received = new Set(orderedIds);
  if (received.size !== orderedIds.length) return [];
  for (const row of rows) if (!received.has(row.id)) return [];

  const currentOrder = new Map(rows.map((row) => [row.id, row.order]));
  const moving = orderedIds.filter((id, index) => currentOrder.get(id) !== index + 1);
  if (moving.length === 0) return [];

  return [
    // First pass: out of the range, each one with its own temporary.
    ...moving.map((id, index) => ({ id, order: -(index + 1) })),
    // Second: nobody is left occupying the destination places.
    ...moving.map((id) => ({ id, order: orderedIds.indexOf(id) + 1 })),
  ];
}
