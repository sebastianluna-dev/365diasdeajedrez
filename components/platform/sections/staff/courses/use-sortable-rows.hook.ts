"use client";

import { useState, useTransition } from "react";

/** The list with the item at `from` placed at `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

interface UseSortableRowsOptions<T> {
  /** The rows as the server has them. */
  items: T[];
  /**
   * Whether a row has a FIXED place — the introduction in front, the closing
   * at the end — and so is neither moved nor part of the order that is sent.
   */
  isFixed: (row: T) => boolean;
  /** Saves the new order. Server action already bound to its course or chapter. */
  onReorder: (orderedIds: string[]) => Promise<void>;
}

/**
 * The order of a drag-sortable list, without its looks: the chapters of a
 * course and the lessons of a chapter draw it differently and move the same.
 *
 * The order is applied on the client on drop and saved in a transition,
 * without waiting for a response: reordering is the operation where a
 * flicker shows most, and the list already knows how it will end up. If the
 * server rejects the change, its revalidation returns the good order and
 * the row goes back to its place.
 */
export function useSortableRows<T extends { id: string }>({ items, isFixed, onReorder }: UseSortableRowsOptions<T>) {
  const [rows, setRows] = useState(items);
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // When the server revalidates, new items arrive through props. The state is
  // adjusted during render — not in an effect — so as not to paint once with
  // the old list before correcting it.
  const [baseline, setBaseline] = useState(items);
  if (items !== baseline) {
    setBaseline(items);
    setRows(items);
  }

  /**
   * Reordering affects ONLY the normal content.
   *
   * The intro and the closing travel in the same list so they are seen where
   * they belong, but they are neither dragged nor part of the order that is
   * sent: the server would not accept them either, because it leaves them out of its query.
   */
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const origin = rows[from];
    const target = rows[to];
    if (!origin || !target || isFixed(origin) || isFixed(target)) return;

    const next = moved(rows, from, to);
    setRows(next);
    startTransition(() => {
      void onReorder(next.filter((row) => !isFixed(row)).map((row) => row.id));
    });
  };

  // The number rendered counts ONLY the normal content: with an intro in
  // front, the first real chapter is 1, not 2.
  const numbers = new Map<string, number>();
  let plain = 0;
  for (const row of rows) {
    if (!isFixed(row)) numbers.set(row.id, ++plain);
  }

  return { rows, dragging, setDragging, move, numbers };
}
