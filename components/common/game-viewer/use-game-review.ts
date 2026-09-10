"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseEngineInfo } from "@/lib/chess/engine-protocol";
import type { MoveEvaluation } from "@/lib/chess/pgn-tree";
import { replayGame, turnColor } from "@/lib/chess/replay";

// Evaluate the WHOLE game: one engine pass per main-line position.
//
// Its own worker, apart from the one in `use-engine.ts`. Not for convenience:
// that one chases the position the user is at and keeps stopping and
// relaunching the search; injecting a second batch of positions into that
// conversation is exactly what makes Stockfish abort (see the long comment in
// that file). Two different tasks, two engines.
//
// The traversal is serial and in turns: `position` + `go`, the last score it
// gives is noted and it does NOT move on to the next until its `bestmove`.

/**
 * How deep it goes on each position.
 *
 * Sixteen and not the twenty of the live analysis: here it is sixty positions
 * in a row, and at twenty a long game runs to several minutes of waiting with
 * the fan at full blast. At sixteen, the gross mistakes show up all the same.
 */
const REVIEW_DEPTH = 16;

export type GameReviewState = "idle" | "running" | "failed";

export interface GameReviewProgress {
  state: GameReviewState;
  /** Positions already evaluated and how many there are in total. */
  done: number;
  total: number;
  /** The depth being analysed at, so it can be reported. */
  depth: number;
}

interface Options {
  /**
   * Called ONCE on completion, with the evaluation of every main-line
   * position — the first is the starting position. Whoever mounts it decides
   * what to do with them; this hook does not touch the PGN.
   */
  onFinished: (evaluations: MoveEvaluation[]) => void;
}

export interface GameReviewRunner extends GameReviewProgress {
  /** Starts the traversal of a game. */
  start: (pgn: string) => void;
  /** Cuts it short and kills the engine. What was evaluated so far is discarded. */
  cancel: () => void;
}

export function useGameReview({ onFinished }: Options): GameReviewRunner {
  const [progress, setProgress] = useState<GameReviewProgress>({
    state: "idle",
    done: 0,
    total: 0,
    depth: REVIEW_DEPTH,
  });

  const workerRef = useRef<Worker | null>(null);
  // By reference so starting the traversal does not depend on whoever mounts
  // the hook memoising its callback.
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const stop = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  // Leaving the screen mid-evaluation cannot leave the engine thinking.
  useEffect(() => stop, [stop]);

  const cancel = useCallback(() => {
    stop();
    setProgress({ state: "idle", done: 0, total: 0, depth: REVIEW_DEPTH });
  }, [stop]);

  const start = useCallback(
    (pgn: string) => {
      stop();

      const positions = replayGame(pgn);
      if (positions.length === 0) {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      let worker: Worker;
      try {
        worker = new Worker("/engine/stockfish.js");
      } catch {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      workerRef.current = worker;
      setProgress({ state: "running", done: 0, total: positions.length, depth: REVIEW_DEPTH });

      const evaluations: MoveEvaluation[] = [];
      let index = 0;
      /** The best reading of the position being analysed right now. */
      let current: MoveEvaluation | null = null;

      const askNext = () => {
        if (index >= positions.length) {
          stop();
          setProgress((previous) => ({ ...previous, state: "idle", done: positions.length }));
          onFinishedRef.current(evaluations);
          return;
        }
        current = null;
        worker.postMessage(`position fen ${positions[index].fen}`);
        worker.postMessage(`go depth ${REVIEW_DEPTH}`);
      };

      worker.addEventListener("message", (event: MessageEvent) => {
        const line = typeof event.data === "string" ? event.data : "";

        if (line.startsWith("readyok")) {
          askNext();
          return;
        }

        if (line.startsWith("bestmove")) {
          // Without a score — a finished position, mate or stalemate — the last
          // known one is kept: the chart needs a value per position.
          evaluations.push(current ?? evaluations[evaluations.length - 1] ?? { score: 0, mateIn: null });
          index += 1;
          setProgress((previous) => ({ ...previous, done: index }));
          askNext();
          return;
        }

        const parsed = parseEngineInfo(line, turnColor(positions[index].fen));
        if (parsed) current = { score: parsed.score, mateIn: parsed.mateIn };
      });

      worker.onerror = () => {
        stop();
        setProgress((previous) => ({ ...previous, state: "failed" }));
      };

      worker.postMessage("uci");
      worker.postMessage("setoption name UCI_AnalyseMode value true");
      // A single line: here only the position's value matters, and asking for
      // three would multiply the work per position without adding anything to the chart.
      worker.postMessage("setoption name MultiPV value 1");
      worker.postMessage("isready");
    },
    [stop],
  );

  return { ...progress, start, cancel };
}
