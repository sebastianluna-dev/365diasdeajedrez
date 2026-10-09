"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EngineClient } from "@/lib/chess/engine/engine-client";
import { thinkDelayMs } from "@/lib/chess/bots/bot-delay";
import { botSearchOf, pickBotMove } from "@/lib/chess/bots/bot-move";
import type { BotStrength } from "@/lib/chess/bots/bot-strength";
import type { FullStrengthProfile } from "@/lib/chess/bots/full-strength.const";
import { mulberry32 } from "@/lib/chess/bots/rng";
import { legalUciMoves } from "@/lib/chess/legal-moves";
import { currentFen, uciMoves, type LiveGame } from "@/lib/chess/live-game";
import { uciLineToSan } from "@/lib/chess/replay";
import { useEngineClient, type EngineClientHandle } from "./use-engine-client.hook";

/** Who plays: a bot at its strength, or the module at full strength (the analysis board). */
export type EnginePlayerProfile = BotStrength | FullStrengthProfile;

export type EnginePlayerStatus = "off" | "loading" | "ready" | "failed";

/** A bot's answer: its move, and how long to wait before showing it. */
export interface BotReply {
  san: string;
  /** The human-like delay left once the search's own time is taken off it. */
  waitMs: number;
}

export interface EnginePlayer {
  status: EnginePlayerStatus;
  /** The bot's move in `game`, its randomness seeded by `seed` (`seedOf(gameId, ply)`). Rejects if the engine fails. */
  reply: (game: LiveGame, seed: number) => Promise<BotReply>;
}

/**
 * A bot: its own Worker with the bot's options set once and `ucinewgame`,
 * then one `bestMove` per move, picked as the calibration picks it
 * (`pickBotMove`) and delayed as a person would (`thinkDelayMs`). Off, or
 * once the game is over, the Worker is terminated: a phone never holds the
 * player's engine and the review's at once.
 *
 * With the full-strength profile it is the analysis board's module: the
 * engine's own move, searched for 300 ms, shown at once. With `shared` it
 * plays on an engine its caller owns — the board's, which also analyses — and
 * sets its options again every time it is switched on, since the analysis
 * changed them meanwhile.
 */
export function useEnginePlayer(
  strength: EnginePlayerProfile | null,
  enabled: boolean,
  shared?: EngineClientHandle,
): EnginePlayer {
  const own = useEngineClient(enabled && strength !== null && !shared);
  const { client, status } = shared ?? own;
  // The options are what matters, not the object: a page refresh hands an
  // equal strength in a new object, and that must not start a new game.
  const strengthKey = useMemo(() => JSON.stringify(strength), [strength]);
  const [prepared, setPrepared] = useState<{ client: EngineClient; key: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const strengthRef = useRef(strength);
  useEffect(() => {
    strengthRef.current = strength;
  });

  useEffect(() => {
    const options = strengthRef.current?.engine;
    if (!client || !options || !enabled) return;
    let cancelled = false;
    client
      .setOptions(options)
      .then(() => client.newGame())
      .then(
        () => {
          if (!cancelled) setPrepared({ client, key: strengthKey });
        },
        () => {
          if (!cancelled) setFailed(true);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [client, strengthKey, enabled]);

  const ready = enabled && prepared !== null && prepared.client === client && prepared.key === strengthKey;

  const reply = useCallback(
    async (game: LiveGame, seed: number): Promise<BotReply> => {
      if (!ready || !prepared || !strength) throw new Error("The bot's engine is not ready");
      const fen = currentFen(game);
      if (!fen) throw new Error("The game does not replay");
      const started = performance.now();
      const isBot = "regime" in strength;
      const answer = await prepared.client.bestMove({
        fen: game.initialFen,
        moves: uciMoves(game),
        search: isBot ? botSearchOf(strength, true) : strength.search,
      });
      const searchMs = performance.now() - started;

      const legal = legalUciMoves(fen);
      const rng = mulberry32(seed);
      const uci = isBot ? pickBotMove(strength, answer, legal, rng) : answer.bestMove;
      const san = uci ? uciLineToSan(fen, [uci])[0] : undefined;
      if (!uci || !san) throw new Error(`The bot had no playable move at ${fen}`);

      // A recapture is answered at once, as a person would: the opponent just
      // took on that square, and the bot takes back on it.
      const lastSan = game.sans.at(-1);
      const lastUci = uciMoves(game).at(-1);
      const recapture = Boolean(
        lastSan?.includes("x") && san.includes("x") && lastUci?.slice(2, 4) === uci.slice(2, 4),
      );
      // The module answers at once; a bot waits as a person would.
      const delay = isBot
        ? thinkDelayMs(strength, {
            ply: game.sans.length,
            candidates: answer.candidates,
            forced: legal.length === 1,
            recapture,
            rng,
          })
        : 0;
      return { san, waitMs: Math.max(0, delay - searchMs) };
    },
    [ready, prepared, strength],
  );

  const playerStatus: EnginePlayerStatus =
    status === "off" ? "off" : failed || status === "failed" ? "failed" : ready ? "ready" : "loading";
  return { status: playerStatus, reply };
}
