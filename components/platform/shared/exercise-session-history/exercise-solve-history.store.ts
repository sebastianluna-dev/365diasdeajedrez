import { useSyncExternalStore } from "react";

// The exercises solved in this visit to a solve page (the history under the
// board): kept in memory only, so a reload starts it again, and emptied when
// the student leaves the solve pages (`ExerciseSessionReset`) or moves to
// another scope (another series, practice). Nothing of it is stored.

/** How it went, by its pill's colour: right first time, solved after a wrong move, or the solution seen. */
export type SolveHistoryTone = "clean" | "late" | "shown";

export interface SolveHistoryEntry {
  /** Unique within the visit: the same exercise may come twice. */
  key: number;
  exerciseId: string;
  title: string;
  /** Its own page, for the pill to go back to; null when it has none (practice serves at random). */
  href: string | null;
  tone: SolveHistoryTone;
  /** The rating change it brought; null when it did not count. */
  delta: number | null;
}

interface SolveHistoryState {
  scope: string | null;
  entries: SolveHistoryEntry[];
}

const EMPTY: SolveHistoryEntry[] = [];
let state: SolveHistoryState = { scope: null, entries: EMPTY };
let nextKey = 1;
const listeners = new Set<() => void>();

function emit(next: SolveHistoryState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Adds the exercise just finished to the scope's history; another scope's history is dropped first. */
export function recordSolve(scope: string, entry: Omit<SolveHistoryEntry, "key">) {
  const entries = state.scope === scope ? state.entries : EMPTY;
  emit({ scope, entries: [...entries, { ...entry, key: nextKey++ }] });
}

export function clearSolveHistory() {
  if (state.scope === null && state.entries.length === 0) return;
  emit({ scope: null, entries: EMPTY });
}

/** The history of this scope: empty while another scope's is the one kept. */
export function useSolveHistory(scope: string): SolveHistoryEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => (state.scope === scope ? state.entries : EMPTY),
    () => EMPTY,
  );
}

/** The pages a visit's history lives on: «Ejercicios» itself, practice, a library exercise again, and a series' exercise. */
export function isSolvePath(pathname: string): boolean {
  return /^\/ejercicios(\/(practica|biblioteca\/[^/]+|series\/[^/]+\/\d+))?\/?$/.test(pathname);
}
