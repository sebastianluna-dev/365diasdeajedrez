"use client";

import { useEffect, useMemo, useState } from "react";
import { useEngineClient, type EngineClientHandle } from "@/components/chess/engine/use-engine-client.hook";
import { mergeEngineLines, orderedEngineLines, type EngineInfo, type EngineLines } from "@/lib/chess/engine-protocol";
import { positionOutcome, type PositionOutcome } from "@/lib/chess/legal-moves";

// The analysis engine, tied to a component's lifecycle.
//
// Stockfish runs in its own Web Worker (`useEngineClient`): it is a separate
// program, not platform code, and that way the analysis does not block the
// interface however deep it goes. The turn-taking of the UCI conversation —
// never a `position` while a `go` is in flight — lives once, in the engine
// client (`lib/chess/engine/engine-client.ts`); this hook only says which
// position it wants analysed.

/** How deep it analyses: trustworthy without pushing anyone's laptop to full throttle. */
const MAX_DEPTH = 20;

/**
 * How many continuations are requested.
 *
 * Three is what makes a position legible: with just one you cannot tell
 * whether the good move is good by a little or by a lot. It costs the engine
 * work — it analyses the three for real, with no reuse — which is why it is not five.
 */
const ENGINE_LINES = 3;

/** The hash the analysis asks for, said explicitly rather than left to the default. */
const ENGINE_HASH_MB = 16;

export interface EngineState {
  /** The continuations of the CURRENT position, best first. */
  lines: EngineInfo[];
  /** The best of them all: it is what drives the evaluation bar. */
  info: EngineInfo | null;
  /**
   * The module is still downloading and starting: on, not failed, and no
   * `readyok` yet. Once it has answered, a position without lines is one being
   * searched, which is a different thing to say.
   */
  loading: boolean;
  /**
   * The position is over — mate or stalemate —, read from the board: there is
   * nothing to search, and the engine answers `bestmove (none)` with no line,
   * so waiting for lines would be waiting forever.
   */
  outcome: PositionOutcome | null;
  /** It could not load: say so instead of leaving a button that does not respond. */
  failed: boolean;
}

/**
 * Analyses `fen` while `enabled`.
 *
 * With `shared`, it analyses on an engine its caller already owns (the analysis
 * board shares one between the analysis and the full-strength module);
 * without it, it creates its own.
 */
export function useEngine(fen: string, enabled: boolean, shared?: EngineClientHandle): EngineState {
  const own = useEngineClient(enabled && !shared);
  const { client, status } = shared ?? own;

  // The evaluations are stored NEXT TO THE POSITION that produced them. That
  // way they need not be cleared on move change — which would force touching
  // the state inside an effect — and, besides, showing another position's
  // evaluation is impossible: if the FEN does not match, it is not used.
  const [result, setResult] = useState<EngineLines | null>(null);
  const outcome = useMemo(() => positionOutcome(fen), [fen]);

  // Once per engine, before any analysis: the FIFO queue of the client sends
  // these options ahead of the first position.
  useEffect(() => {
    if (!enabled || !client) return;
    client.setOptions({ hash: ENGINE_HASH_MB, multiPv: ENGINE_LINES }).catch(() => {});
  }, [client, enabled]);

  // Changing move does NOT restart the worker: it only changes which position
  // is wanted. The client asks the running search to stop and launches the new
  // one when its `bestmove` arrives.
  useEffect(() => {
    if (!enabled || !client || !fen || outcome) return;
    return client.analyse({ fen, depth: MAX_DEPTH }, (info) => {
      if (info.pv.length > 0) setResult((current) => mergeEngineLines(current, fen, info));
    });
  }, [client, enabled, fen, outcome]);

  const lines = orderedEngineLines(result, fen);
  return {
    lines,
    info: lines[0] ?? null,
    loading: enabled && status === "loading",
    outcome,
    failed: enabled && status === "failed",
  };
}
