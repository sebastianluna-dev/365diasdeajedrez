"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useEnginePlayer } from "@/components/chess/engine/use-engine-player.hook";
import type { BotStrength } from "@/lib/chess/bots/bot-strength";
import { seedOf } from "@/lib/chess/bots/rng";
import { sideToMove } from "@/lib/chess/live-game";
import {
  initialLiveGameState,
  liveGameReducer,
  type LiveGameSnapshot,
  type LiveGameState,
} from "@/lib/play/live-game-machine";
import { abandonPlayedGame, appendPlayedMove } from "@/services/play/play.actions";
import type { AppendMoveResult } from "@/services/play/play.types";

/** How long a throttled save waits before each retry; after the last one it gives up as stale. */
const THROTTLE_RETRIES_MS = [1_000, 2_000, 4_000];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** One move to the server, retried while the rate limit says so. */
async function saveMove(gameId: string, expectedPly: number, san: string): Promise<AppendMoveResult> {
  for (const delay of [...THROTTLE_RETRIES_MS, null]) {
    const result = await appendPlayedMove(gameId, { expectedPly, san });
    if (result.ok || result.reason !== "throttled" || delay === null) return result;
    await wait(delay);
  }
  return { ok: false, reason: "stale" };
}

export interface LiveGame {
  state: LiveGameState;
  /** The person's move, from the board. */
  move: (san: string) => void;
  /** «Abandonar»: closes the game, lost, and resolves once the server has it. */
  abandon: () => Promise<void>;
}

/**
 * The live game against a bot, wired: the pure reducer (`liveGameReducer`)
 * holds the record, and this hook does what each state asks for — save the
 * last move (one at a time, versioned by its ply), ask the bot for its move
 * as soon as the person's is on the board, and show it after the bot's
 * human-like delay. The bot's engine lives only while the game does.
 *
 * `seated`: only whoever holds a seat plays; a teacher reading the game gets
 * the record and no engine.
 */
export function useLiveGame({
  gameId,
  snapshot,
  strength,
  seated,
}: {
  gameId: string;
  snapshot: LiveGameSnapshot;
  strength: BotStrength | null;
  seated: boolean;
}): LiveGame {
  const [state, dispatch] = useReducer(liveGameReducer, snapshot, (game) => initialLiveGameState(game));
  const playing = seated && state.status !== "over" && state.status !== "stale" && state.status !== "engine-failed";
  const player = useEnginePlayer(strength, playing);

  // The engine's own state reaches the game: ready to start, or gone.
  useEffect(() => {
    if (player.status === "ready") dispatch({ type: "ENGINE_READY" });
    if (player.status === "failed") dispatch({ type: "ENGINE_FAILED" });
  }, [player.status]);

  // Save the move the server does not have yet. At most one in flight: the
  // next one waits for this one's answer, which is its version.
  const savingPly = useRef<number | null>(null);
  useEffect(() => {
    if (state.status !== "human-moved" && state.status !== "bot-moved") return;
    const ply = state.savedPly;
    const san = state.sans[ply];
    if (san === undefined || savingPly.current === ply) return;
    savingPly.current = ply;
    void saveMove(gameId, ply, san).then((result) => {
      savingPly.current = null;
      if (result.ok) dispatch({ type: "SAVED", plyCount: result.plyCount, end: result.end });
      else dispatch({ type: "SAVE_FAILED", reason: result.reason });
    });
  }, [state.status, state.savedPly, state.sans, gameId]);

  // Ask the bot as soon as it is its turn on the board — while the person's
  // move is still being saved — and hand its move in after its delay.
  const searched = useRef<string | null>(null);
  const timers = useRef(new Set<number>());
  useEffect(() => {
    if (player.status !== "ready" || state.end) return;
    if (state.status !== "human-moved" && state.status !== "bot-thinking") return;
    if (sideToMove(state) === state.humanColor) return;
    const key = `${state.generation}:${state.sans.length}`;
    if (searched.current === key) return;
    searched.current = key;
    const generation = state.generation;
    player.reply({ initialFen: state.initialFen, sans: state.sans }, seedOf(gameId, state.sans.length)).then(
      ({ san, waitMs }) => {
        const timer = window.setTimeout(() => {
          timers.current.delete(timer);
          dispatch({ type: "BOT_REPLY", san, generation });
        }, waitMs);
        timers.current.add(timer);
      },
      () => dispatch({ type: "ENGINE_FAILED" }),
    );
  }, [player, state, gameId]);

  // A delay still running when the page goes away shows nothing.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const move = useCallback((san: string) => dispatch({ type: "HUMAN_MOVE", san }), []);

  const savedPlyRef = useRef(state.savedPly);
  useEffect(() => {
    savedPlyRef.current = state.savedPly;
  });
  const abandon = useCallback(async () => {
    dispatch({ type: "ABANDON" });
    const result = await abandonPlayedGame(gameId, { expectedPly: savedPlyRef.current });
    if (result.ok && result.end) dispatch({ type: "CLOSED", end: result.end });
    else if (!result.ok) dispatch({ type: "SAVE_FAILED", reason: result.reason });
  }, [gameId]);

  return { state, move, abandon };
}
