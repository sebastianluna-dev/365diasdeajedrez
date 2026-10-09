"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createWorkerTransport } from "@/components/chess/engine/worker-transport";
import { createEngineClient, type EngineClient } from "@/lib/chess/engine/engine-client";
import { evaluationOfCandidate, type Candidate } from "@/lib/chess/engine-protocol";
import { positionOutcome } from "@/lib/chess/legal-moves";
import type { MoveEvaluation } from "@/lib/chess/pgn-tree";
import { replayGame, turnColor } from "@/lib/chess/replay";

// Evaluate the WHOLE game: one engine pass per main-line position.
//
// Its own engine, apart from the one in `use-engine.hook.ts`. Not for
// convenience: that one chases the position the user is at and keeps
// replacing its search; a batch of sixty positions does not belong in that
// conversation. Two different tasks, two engines.
//
// The traversal is serial: one `bestMove` per position, through the engine
// client, which waits for each `bestmove` before sending the next `position`.

/**
 * How deep it goes on each position.
 *
 * Sixteen and not the twenty of the live analysis: here it is sixty positions
 * in a row, and at twenty a long game runs to several minutes of waiting with
 * the fan at full blast. At sixteen, the gross mistakes show up all the same.
 */
const REVIEW_DEPTH = 16;

/** The hash the review asks for, said explicitly rather than left to the default. */
const REVIEW_HASH_MB = 16;

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

/**
 * A position's value for the chart. Without a line — the position is over and
 * the engine answers `bestmove (none)` — the board says it: a stalemate is a
 * draw, and a mate keeps the previous position's figure, the winner's mate in
 * one (a `mate 0` has no sign of its own to say who won).
 */
function evaluationAt(fen: string, best: Candidate | undefined, previous: MoveEvaluation | undefined): MoveEvaluation {
  if (best) return evaluationOfCandidate(best, turnColor(fen));
  if (positionOutcome(fen) === "stalemate") return { score: 0, mateIn: null };
  return previous ?? { score: 0, mateIn: null };
}

export function useGameReview({ onFinished }: Options): GameReviewRunner {
  const [progress, setProgress] = useState<GameReviewProgress>({
    state: "idle",
    done: 0,
    total: 0,
    depth: REVIEW_DEPTH,
  });

  const clientRef = useRef<EngineClient | null>(null);
  /** Which traversal is the live one: a cancelled one keeps quiet when its engine is killed under it. */
  const runRef = useRef(0);
  // By reference so starting the traversal does not depend on whoever mounts
  // the hook memoising its callback.
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const stop = useCallback(() => {
    runRef.current += 1;
    clientRef.current?.terminate();
    clientRef.current = null;
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
      const run = runRef.current;

      const positions = replayGame(pgn);
      if (positions.length === 0) {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      let client: EngineClient;
      try {
        client = createEngineClient(createWorkerTransport());
      } catch {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      clientRef.current = client;
      setProgress({ state: "running", done: 0, total: positions.length, depth: REVIEW_DEPTH });

      void (async () => {
        try {
          await client.ready();
          // A single line: here only the position's value matters, and asking
          // for three would multiply the work without adding anything to the chart.
          await client.setOptions({ hash: REVIEW_HASH_MB, multiPv: 1 });
          await client.newGame();

          const evaluations: MoveEvaluation[] = [];
          for (const [index, position] of positions.entries()) {
            const { candidates } = await client.bestMove({
              fen: position.fen,
              moves: [],
              search: { depth: REVIEW_DEPTH },
            });
            if (runRef.current !== run) return;
            evaluations.push(evaluationAt(position.fen, candidates[0], evaluations.at(-1)));
            setProgress((previous) => ({ ...previous, done: index + 1 }));
          }

          stop();
          setProgress((previous) => ({ ...previous, state: "idle", done: positions.length }));
          onFinishedRef.current(evaluations);
        } catch {
          // A cancelled traversal is rejected when its engine is killed: not a failure.
          if (runRef.current !== run) return;
          stop();
          setProgress((previous) => ({ ...previous, state: "failed" }));
        }
      })();
    },
    [stop],
  );

  return { ...progress, start, cancel };
}
