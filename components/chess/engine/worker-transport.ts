import type { EngineTransport } from "@/lib/chess/engine/engine-transport";

/**
 * Where the browser loads Stockfish from: a separate program with its own
 * GPL licence, served as is from `public/engine/` and never bundled with the
 * platform's code. Only `createWorkerTransport` creates a worker from it.
 */
export const ENGINE_WORKER_URL = "/engine/stockfish.js";

/**
 * The engine in a Web Worker: the browser's transport for the engine client.
 * The worker downloads its 7 MB of WebAssembly when it is created, so this is
 * only called when an engine is really wanted.
 *
 * Throws when the browser cannot create a worker at all (no Workers, or an
 * environment that blocks them); a worker that fails later, while loading or
 * mid-search, is reported through `onError`.
 */
export function createWorkerTransport(): EngineTransport {
  const worker = new Worker(ENGINE_WORKER_URL);
  const lineListeners = new Set<(line: string) => void>();
  const errorListeners = new Set<(error: Error) => void>();

  worker.addEventListener("message", (event: MessageEvent) => {
    const data = typeof event.data === "string" ? event.data : "";
    for (const line of data.split("\n")) {
      if (!line) continue;
      for (const listener of [...lineListeners]) listener(line);
    }
  });
  worker.addEventListener("error", (event: ErrorEvent) => {
    const error = new Error(event.message || "The engine worker failed");
    for (const listener of [...errorListeners]) listener(error);
  });

  return {
    post: (line) => worker.postMessage(line),
    onLine(listener) {
      lineListeners.add(listener);
      return () => lineListeners.delete(listener);
    },
    onError(listener) {
      errorListeners.add(listener);
      return () => errorListeners.delete(listener);
    },
    terminate: () => worker.terminate(),
  };
}
