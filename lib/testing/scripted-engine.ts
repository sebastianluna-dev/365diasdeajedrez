import type { EngineTransport } from "@/lib/chess/engine/engine-transport";

// An engine that answers from a script, for testing the engine client and
// whatever drives it without 7 MB of WebAssembly.
//
// It records every command it was sent. Its own replies go out on a later
// microtask, as a real worker's would: the client never hears an answer in
// the middle of posting the question. Out of the box it answers `uci` with
// `uciok` and `isready` with `readyok`; anything else — a search's `info`
// lines and its `bestmove` — the test emits when it wants, or a responder
// returns.

export interface ScriptedEngine extends EngineTransport {
  /** Every command posted, in order. */
  readonly sent: string[];
  /** Delivers lines from the engine now. */
  emit(...lines: string[]): void;
  /** The engine dies: every error listener hears it. */
  die(message?: string): void;
  /** Whether the client terminated it. */
  readonly terminated: boolean;
}

/** Extra replies for a command; return nothing to keep the default (`uciok`, `readyok`). */
export type ScriptedResponder = (command: string) => string[] | undefined;

export function createScriptedEngine(responder?: ScriptedResponder): ScriptedEngine {
  const sent: string[] = [];
  const lineListeners = new Set<(line: string) => void>();
  const errorListeners = new Set<(error: Error) => void>();
  let terminated = false;

  const deliver = (lines: string[]) => {
    for (const line of lines) {
      for (const listener of [...lineListeners]) listener(line);
    }
  };

  const defaults = (command: string): string[] => {
    if (command === "uci") return ["id name Scripted", "uciok"];
    if (command === "isready") return ["readyok"];
    return [];
  };

  return {
    sent,
    get terminated() {
      return terminated;
    },
    post(line) {
      if (terminated) return;
      sent.push(line);
      const replies = responder?.(line) ?? defaults(line);
      if (replies.length > 0) queueMicrotask(() => deliver(replies));
    },
    onLine(listener) {
      lineListeners.add(listener);
      return () => lineListeners.delete(listener);
    },
    onError(listener) {
      errorListeners.add(listener);
      return () => errorListeners.delete(listener);
    },
    terminate() {
      terminated = true;
    },
    emit(...lines) {
      deliver(lines);
    },
    die(message = "The scripted engine died") {
      for (const listener of [...errorListeners]) listener(new Error(message));
    },
  };
}

/** Lets every pending microtask and zero-delay timer run. */
export const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
