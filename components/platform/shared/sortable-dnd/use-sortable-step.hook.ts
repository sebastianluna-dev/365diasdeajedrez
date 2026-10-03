"use client";

import { createContext, useContext } from "react";

/** One place up and one place down; `null` where the row is already at that end. */
export interface SortableSteps {
  up: (() => void) | null;
  down: (() => void) | null;
}

interface SortableStepValue {
  /** The ids of the items that can be moved, in the order they are drawn. */
  ids: string[];
  /** Moves an item one place: `-1` up, `1` down. */
  step: (id: string, offset: -1 | 1) => void;
}

/** Provided by `SortableDnd`; outside one, nothing moves. */
export const SortableStepContext = createContext<SortableStepValue>({ ids: [], step: () => {} });

/**
 * The item whose place `id` takes one step up (`-1`) or down (`1`): its
 * neighbour on that side, or `null` where the row is already at that end —
 * or is not in the order at all, as the introduction and the closing.
 */
export function stepTarget(ids: readonly string[], id: string, offset: -1 | 1): string | null {
  const index = ids.indexOf(id);
  if (index === -1) return null;
  return ids[index + offset] ?? null;
}

/**
 * How a row of a sortable list moves one place without being dragged: what
 * its «Subir» and «Bajar» call. Dragging is a path the pointer has to hold
 * from one place to another, and whoever cannot — a tremor, a head pointer, a
 * touch screen that scrolls instead — needs a way to reorder with single
 * clicks (WCAG 2.5.7). The step goes through the same `onMove` a drop does,
 * so the list cannot tell one from the other, and `SortableDnd` says where
 * the row landed.
 */
export function useSortableStep(id: string): SortableSteps {
  const { ids, step } = useContext(SortableStepContext);
  return {
    up: stepTarget(ids, id, -1) === null ? null : () => step(id, -1),
    down: stepTarget(ids, id, 1) === null ? null : () => step(id, 1),
  };
}
