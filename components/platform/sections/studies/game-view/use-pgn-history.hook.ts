import { useCallback, useEffect, useReducer } from "react";

/**
 * How many steps back are remembered. The whole PGN of each one is stored — a
 * game takes a few kilobytes — which is infinitely simpler than keeping a log
 * of inverse operations and cannot drift out of sync.
 */
export const HISTORY_LIMIT = 50;

export interface PgnHistory {
  pgn: string;
  /** The previous states, oldest to most recent. */
  past: string[];
}

export type PgnAction = { type: "edit"; pgn: string } | { type: "undo" };

/**
 * The PGN and where it has been, in a reducer and not in two loose states:
 * undo has to move both at once, and with `useState` there would be a moment
 * when the history and the PGN do not correspond.
 */
export function pgnReducer(state: PgnHistory, action: PgnAction): PgnHistory {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous === undefined ? state : { pgn: previous, past: state.past.slice(0, -1) };
  }

  // Storing the same PGN twice would spend an undo step that undoes nothing,
  // and that shows: the first Ctrl+Z would seem not to work.
  if (action.pgn === state.pgn) return state;
  return { pgn: action.pgn, past: [...state.past, state.pgn].slice(-HISTORY_LIMIT) };
}

interface PgnHistoryOptions {
  /** Whether ⌘Z / Ctrl+Z undoes the last change; off for a game one cannot edit. */
  undo: boolean;
}

/**
 * The game's PGN with an undo stack. It lives in the section and not in the
 * viewer because two things write it — the viewer and the tools under the
 * board — and a third reads it, the autosave; if each kept its own,
 * commenting a move would not show in the list until reload.
 */
export function usePgnHistory(initialPgn: string, { undo }: PgnHistoryOptions) {
  const [history, dispatch] = useReducer(pgnReducer, { pgn: initialPgn, past: [] });
  const applyPgn = useCallback((next: string) => dispatch({ type: "edit", pgn: next }), []);
  const undoLast = useCallback(() => dispatch({ type: "undo" }), []);

  // Ctrl+Z (⌘Z on Mac) undoes the last change to the game. While a comment is
  // being typed the field's own undo rules, which is what anyone expects with
  // the cursor inside a text.
  useEffect(() => {
    if (!undo) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "z" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) {
        return;
      }

      event.preventDefault();
      dispatch({ type: "undo" });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  return { pgn: history.pgn, applyPgn, undo: undoLast };
}
