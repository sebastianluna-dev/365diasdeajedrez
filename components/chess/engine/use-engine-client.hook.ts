"use client";

import { useEffect, useState } from "react";
import { createEngineClient, type EngineClient } from "@/lib/chess/engine/engine-client";
import { createWorkerTransport } from "./worker-transport";

export type EngineClientStatus = "off" | "loading" | "ready" | "failed";

export interface EngineClientHandle {
  /** The client once it has answered `readyok`; null while off, loading or failed. */
  client: EngineClient | null;
  status: EngineClientStatus;
}

/**
 * One engine — a Web Worker and its client — tied to a component's life.
 *
 * Created LAZILY, only while `enabled`: it is 7 MB of WebAssembly that make no
 * sense to download for someone who never switches it on. Switching off KILLS
 * the worker; it is never left thinking in the background.
 */
export function useEngineClient(enabled: boolean): EngineClientHandle {
  const [ready, setReady] = useState<EngineClient | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // In development, strict mode mounts the effect, cleans it up and mounts it
    // again. That cleanup terminates the FIRST worker while it is still
    // downloading, and aborting the load fires its error. Without this flag that
    // error from a dead worker would mark the engine as failed even though the
    // second one started perfectly.
    let cancelled = false;

    let client: EngineClient;
    try {
      const transport = createWorkerTransport();
      transport.onError(() => {
        if (!cancelled) setFailed(true);
      });
      client = createEngineClient(transport);
    } catch {
      // The constructor can throw synchronously. The flag is deferred one tick:
      // changing state in the effect body would be a render inside another.
      const pending = window.setTimeout(() => {
        if (!cancelled) setFailed(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(pending);
      };
    }

    client.ready().then(
      () => {
        if (!cancelled) setReady(client);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );

    return () => {
      cancelled = true;
      // The next worker starts from scratch: until it answers, it is loading.
      setReady(null);
      setFailed(false);
      client.terminate();
    };
  }, [enabled]);

  const status: EngineClientStatus = !enabled ? "off" : failed ? "failed" : ready ? "ready" : "loading";
  return { client: status === "ready" ? ready : null, status };
}
