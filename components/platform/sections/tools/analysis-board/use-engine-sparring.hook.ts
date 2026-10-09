"use client";

import { INITIAL_FEN } from "chessops/fen";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineClientHandle } from "@/components/chess/engine/use-engine-client.hook";
import { useEnginePlayer } from "@/components/chess/engine/use-engine-player.hook";
import { FULL_STRENGTH_PROFILE } from "@/lib/chess/bots/full-strength.const";
import { gameEnd, type GameEnd } from "@/lib/chess/game-end";
import { sideToMove, type LiveGame } from "@/lib/chess/live-game";
import { addMoveToPgn } from "@/lib/chess/pgn-edit";
import { parsePgnTree, sansAlongPath } from "@/lib/chess/pgn-tree";

/** A position being played against the module on the analysis board. */
export interface Sparring {
  /** The person's colour. */
  color: "white" | "black";
  /** The node it started at: the line hangs from it, as a variation if the node already went on. */
  fromPath: string;
  /** The line's last move. */
  leafPath: string;
  status: "your-turn" | "thinking" | "over";
  /** How the board ended it; null while on, and when the module stopped answering. */
  end: GameEnd | null;
  /** The module stopped answering: the line stays, the game cannot go on. */
  failed: boolean;
}

/** The line from the root to `path` of a PGN, as a game the rules and the engine read. */
function lineAt(pgn: string, path: string): LiveGame | null {
  const tree = parsePgnTree(pgn);
  if (!tree) return null;
  return { initialFen: tree.initialFen === INITIAL_FEN ? null : tree.initialFen, sans: sansAlongPath(tree, path) };
}

/** Whose turn it is after a move landed, or the end. */
function next(line: LiveGame, color: "white" | "black"): Pick<Sparring, "status" | "end"> {
  const end = gameEnd(line.initialFen, line.sans);
  if (end) return { status: "over", end };
  return { status: sideToMove(line) === color ? "your-turn" : "thinking", end: null };
}

/**
 * «Jugar esta posición contra el módulo» (planning decision B): the module at
 * full strength, answering at once, never a clock, never saved and never
 * counted. Every move — the person's and the module's — goes into the PGN
 * after the line's last move (`addMoveToPgn`), so what is played is already a
 * variation of the analysis when it ends. It plays on the board's own engine
 * (`shared`): the analysis stops while it plays and nothing is compiled
 * again.
 */
export function useEngineSparring({
  pgn,
  applyPgn,
  shared,
}: {
  pgn: string;
  applyPgn: (next: string) => void;
  shared: EngineClientHandle;
}) {
  const [sparring, setSparring] = useState<Sparring | null>(null);
  const player = useEnginePlayer(FULL_STRENGTH_PROFILE, sparring !== null && sparring.status !== "over", shared);

  // The PGN as it is NOW: a reply lands after the search, by when the person
  // may have commented a move.
  const pgnRef = useRef(pgn);
  const sparringRef = useRef(sparring);
  useEffect(() => {
    pgnRef.current = pgn;
    sparringRef.current = sparring;
  });

  /** Starts playing the position at `path` with `color`. */
  const start = useCallback((color: "white" | "black", path: string) => {
    const line = lineAt(pgnRef.current, path);
    if (!line) return;
    setSparring({ color, fromPath: path, leafPath: path, ...next(line, color), failed: false });
  }, []);

  const stop = useCallback(() => setSparring(null), []);

  /** A move after the line's last, by whoever's turn it is. */
  const play = useCallback(
    (current: Sparring, san: string): Sparring | null => {
      const added = addMoveToPgn(pgnRef.current, current.leafPath, san);
      const line = added && lineAt(added.pgn, added.path);
      if (!added || !line) return null;
      pgnRef.current = added.pgn;
      applyPgn(added.pgn);
      return { ...current, leafPath: added.path, ...next(line, current.color) };
    },
    [applyPgn],
  );

  /** The person's move, from the board. */
  const move = useCallback(
    (san: string) => {
      if (!sparring || sparring.status !== "your-turn") return;
      const moved = play(sparring, san);
      if (moved) setSparring(moved);
    },
    [sparring, play],
  );

  // The module's turn: one search per position, its move added at once.
  const asked = useRef<string | null>(null);
  useEffect(() => {
    if (!sparring || sparring.status !== "thinking" || player.status !== "ready") return;
    const key = `${sparring.fromPath}>${sparring.leafPath}`;
    if (asked.current === key) return;
    asked.current = key;
    const line = lineAt(pgnRef.current, sparring.leafPath);
    if (!line) return;
    player.reply(line, 0).then(
      ({ san }) => {
        const current = sparringRef.current;
        // Stopped, or another line started, while it searched: the reply is dropped.
        if (!current || current.fromPath !== sparring.fromPath || current.leafPath !== sparring.leafPath) return;
        setSparring(play(current, san) ?? { ...current, status: "over", failed: true });
      },
      () => setSparring((current) => (current ? { ...current, status: "over", failed: true } : current)),
    );
  }, [sparring, player, play]);

  // A module that cannot load ends the game where it is.
  const failed = player.status === "failed" && sparring !== null && sparring.status !== "over";

  return {
    sparring: failed && sparring ? { ...sparring, status: "over" as const, failed: true } : sparring,
    start,
    stop,
    move,
  };
}
