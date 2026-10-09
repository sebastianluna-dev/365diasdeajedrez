import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import type { EngineTransport } from "../../lib/chess/engine/engine-transport";

/**
 * The engine the browser loads, run as a child process: `node
 * public/engine/stockfish.js` is the very same bytes, which as a main module
 * reads UCI from stdin and finds `stockfish.wasm` beside itself. So what is
 * measured here (the calibration) is what the student plays against.
 */
export const ENGINE_SCRIPT = resolve(process.cwd(), "public/engine/stockfish.js");

export function createProcessTransport(script = ENGINE_SCRIPT): EngineTransport {
  const child = spawn(process.execPath, [script], { stdio: ["pipe", "pipe", "pipe"] });
  const lineListeners = new Set<(line: string) => void>();
  const errorListeners = new Set<(error: Error) => void>();
  let ended = false;

  const failWith = (error: Error) => {
    if (ended) return;
    ended = true;
    for (const listener of [...errorListeners]) listener(error);
  };

  createInterface({ input: child.stdout }).on("line", (line) => {
    for (const listener of [...lineListeners]) listener(line);
  });
  child.on("error", failWith);
  child.on("exit", (code, signal) => failWith(new Error(`The engine exited (${signal ?? code})`)));
  // A write after the engine died is reported by its exit, not thrown here.
  child.stdin.on("error", () => {});

  return {
    post(line) {
      if (!ended) child.stdin.write(`${line}\n`);
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
      ended = true;
      child.kill();
    },
  };
}
