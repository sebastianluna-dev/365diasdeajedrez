"use client";

import { useEffect, useRef, useState } from "react";
import {
  mergeEngineLines,
  orderedEngineLines,
  parseEngineInfo,
  type EngineInfo,
  type EngineLines,
} from "@/lib/chess/engine-protocol";
import { turnColor } from "@/lib/chess/replay";

// The analysis engine, tied to a component's lifecycle.
//
// Stockfish runs in its own Web Worker: it is a separate program, not
// platform code, and that way the analysis does not block the interface
// however deep it goes. The worker is created LAZILY, only when switched on,
// because it is 7 MB of WebAssembly that make no sense to download for
// someone who will never use it.
//
// THE IMPORTANT PART OF THIS FILE: the UCI protocol is a conversation in
// turns, not a mailbox. `stop` does not halt the search at once — it asks it
// to finish — and until the engine answers `bestmove` it keeps analysing.
// Sending it `position` in that gap violates the protocol, and Stockfish
// does not forgive it: it aborts with "RuntimeError: unreachable" and takes
// the worker down with it. That is why there is a small state machine here
// instead of firing the commands point-blank.

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

export interface EngineState {
  /** The continuations of the CURRENT position, best first. */
  lines: EngineInfo[];
  /** The best of them all: it is what drives the evaluation bar. */
  info: EngineInfo | null;
  loading: boolean;
  /** It could not load: say so instead of leaving a button that does not respond. */
  failed: boolean;
}

/** What has to be remembered between messages so as not to break the turn-taking. */
interface Conversation {
  /** The engine already answered `readyok`: before that nothing is asked of it. */
  ready: boolean;
  /** A `go` is in flight; until its `bestmove` the position cannot be changed. */
  searching: boolean;
  /** The position that should be under analysis. */
  wanted: string;
  /** The one it was actually asked for, which may lag behind `wanted`. */
  searching_fen: string;
  /** The last one that finished, so it is not relaunched in a loop. */
  finished: string;
}

export function useEngine(fen: string, enabled: boolean): EngineState {
  // The evaluations are stored NEXT TO THE POSITION that produced them. That
  // way they need not be cleared on move change — which would force touching
  // the state inside an effect — and, besides, showing another position's
  // evaluation is impossible: if the FEN does not match, it is not used.
  const [result, setResult] = useState<EngineLines | null>(null);
  const [failed, setFailed] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  /** The launcher is published by the startup effect so the position effect can use it. */
  const startRef = useRef<(() => void) | null>(null);
  const talkRef = useRef<Conversation>({
    ready: false,
    searching: false,
    wanted: "",
    searching_fen: "",
    finished: "",
  });

  // Startup and shutdown. Depends only on `enabled`: switching off has to
  // KILL the worker, not leave it thinking in the background.
  useEffect(() => {
    if (!enabled) return;

    // In development, strict mode mounts the effect, cleans it up and mounts it
    // again. That cleanup terminates the FIRST worker while it is still
    // downloading its 7 MB, and aborting that load fires its `onerror`. Without
    // this flag, that error from an already dead worker marked the engine as
    // failed even though the second one started perfectly.
    let cancelled = false;

    let worker: Worker;
    try {
      worker = new Worker("/engine/stockfish.js");
    } catch {
      // The constructor can throw synchronously — a browser without Workers or
      // an environment that blocks them. The flag is deferred one tick: changing
      // state in the effect body would be a render inside another.
      const pending = window.setTimeout(() => {
        if (!cancelled) setFailed(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(pending);
      };
    }

    workerRef.current = worker;
    const talk = talkRef.current;
    talk.ready = false;
    talk.searching = false;
    talk.searching_fen = "";
    talk.finished = "";

    /** Launches the pending search, if it can be done now. */
    const startIfPossible = () => {
      if (!talk.ready || talk.searching) return;
      if (!talk.wanted || talk.wanted === talk.finished) return;

      talk.searching = true;
      talk.searching_fen = talk.wanted;
      worker.postMessage(`position fen ${talk.wanted}`);
      worker.postMessage(`go depth ${MAX_DEPTH}`);
    };
    startRef.current = startIfPossible;

    const onMessage = (event: MessageEvent) => {
      const line = typeof event.data === "string" ? event.data : "";
      if (cancelled) return;

      if (line.startsWith("readyok")) {
        talk.ready = true;
        startIfPossible();
        return;
      }

      if (line.startsWith("bestmove")) {
        // This is where the turn is really released: until this message the
        // engine kept analysing however many `stop`s it had been sent.
        talk.searching = false;
        talk.finished = talk.searching_fen;
        startIfPossible();
        return;
      }

      const searched = talk.searching_fen;
      if (!searched) return;
      const parsed = parseEngineInfo(line, turnColor(searched));
      if (parsed && parsed.pv.length > 0) {
        setResult((current) => mergeEngineLines(current, searched, parsed));
      }
    };

    worker.addEventListener("message", onMessage);
    worker.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    worker.postMessage("uci");
    worker.postMessage("setoption name UCI_AnalyseMode value true");
    // Set once, at startup: it is an engine option, not a position one.
    worker.postMessage(`setoption name MultiPV value ${ENGINE_LINES}`);
    // Nothing is asked of it until it answers: the `readyok` is what opens the door.
    worker.postMessage("isready");

    return () => {
      cancelled = true;
      worker.removeEventListener("message", onMessage);
      // Plain `terminate()`: sending it "stop" first adds nothing — it dies
      // anyway — and is one more message that can fail if it has not started yet.
      worker.terminate();
      workerRef.current = null;
      startRef.current = null;
    };
  }, [enabled]);

  // Changing move does NOT restart the worker: it only changes which position is wanted.
  // If a search is running it is asked to stop and its `bestmove` is awaited;
  // the new one comes out of that. Sending it right now is what made the engine abort.
  useEffect(() => {
    const worker = workerRef.current;
    if (!enabled || !fen || !worker) return;

    const talk = talkRef.current;
    talk.wanted = fen;

    if (talk.searching && talk.searching_fen !== fen) {
      // It is only ASKED to stop. The new position is launched by the `bestmove`
      // when it arrives, which is when the engine has really given up the turn.
      worker.postMessage("stop");
    } else {
      startIfReady(startRef);
    }
  }, [fen, enabled]);

  const lines = orderedEngineLines(result, fen);
  return { lines, info: lines[0] ?? null, loading: enabled && !failed && lines.length === 0, failed };
}

/** Calls the launcher if the startup effect has already published it. */
function startIfReady(ref: { current: (() => void) | null }): void {
  ref.current?.();
}
