"use client";

import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Game, PgnNodeData } from "chessops/pgn";
import { useCallback, useMemo } from "react";
import {
  addMove,
  deleteFrom,
  nodeAtPathIn,
  parseEditableGame,
  pathOfNode,
  promoteOneStep,
  promoteToMainLine,
  serializeGame,
  setShapes,
  variationPgn,
} from "@/lib/chess/pgn-edit";
import { parentPathOf } from "@/lib/chess/pgn-tree";

interface UsePgnEditingOptions {
  /** The current PGN: every change starts from it, never from a stored copy. */
  pgn: string;
  onPgnChange: (pgn: string) => void;
  /** Where to leave the selected move after each change. */
  onPathChange: (path: string) => void;
}

export interface PgnEditing {
  addMoveAt: (path: string, san: string) => void;
  updateShapes: (path: string, shapes: DrawShape[]) => void;
  promoteOneStepAt: (path: string) => void;
  promoteToMainAt: (path: string) => void;
  deleteAt: (path: string) => void;
  copyVariation: (path: string) => Promise<void>;
}

/**
 * Editing the game FROM the viewer: adding moves, drawing arrows, promoting,
 * copying a line and deleting.
 *
 * The comment and the signs are NOT here: they are written in the panel
 * under the board, and the move menu only leads to it (see `useToolsTab` in game-tools.comp.tsx).
 *
 * Each operation reparses the PGN, mutates the chessops game and returns the
 * new PGN upwards. It is reparsing more than needed, yes, but it leaves ONE
 * source of truth — the PGN the viewer renders — instead of a parallel
 * mutable game that could drift out of sync with it; a game fits easily
 * within that budget.
 *
 * The chess logic lives entirely in lib/chess/pgn-edit.ts: here it is only
 * bound to the screen state.
 */
export function usePgnEditing({ pgn, onPgnChange, onPathChange }: UsePgnEditingOptions): PgnEditing {
  /**
   * Applies a change and publishes the resulting PGN.
   *
   * `mutate` returns the path to leave the viewer at, or null to touch
   * nothing — illegal move, broken path, unreadable PGN.
   */
  const edit = useCallback(
    (mutate: (game: Game<PgnNodeData>) => string | null) => {
      const game = parseEditableGame(pgn);
      if (!game) return;

      const next = mutate(game);
      if (next === null) return;

      onPgnChange(serializeGame(game));
      onPathChange(next);
    },
    [pgn, onPgnChange, onPathChange],
  );

  /**
   * Mutates and follows the move wherever it ends up.
   *
   * Promoting reindexes the siblings, so the starting path may stop pointing
   * at the same move. That is why the REFERENCE to the node is kept before
   * mutating and the node is asked again where it ended up.
   */
  const keepingPlace = useCallback(
    (path: string, mutate: (game: Game<PgnNodeData>) => boolean) => (game: Game<PgnNodeData>) => {
      const node = nodeAtPathIn(game, path);
      if (!node || !mutate(game)) return null;
      return pathOfNode(game, node) ?? parentPathOf(path);
    },
    [],
  );

  return useMemo(
    () => ({
      addMoveAt: (path, san) => edit((game) => addMove(game, path, san)?.path ?? null),
      updateShapes: (path, shapes) => edit((game) => (setShapes(game, path, shapes) ? path : null)),
      promoteOneStepAt: (path) => edit(keepingPlace(path, (game) => promoteOneStep(game, path))),
      promoteToMainAt: (path) => edit(keepingPlace(path, (game) => promoteToMainLine(game, path))),
      // Deleting is the only one that cannot stay where it was: the move no
      // longer exists, so it goes up to the parent.
      deleteAt: (path) => edit((game) => (deleteFrom(game, path) ? parentPathOf(path) : null)),
      copyVariation: async (path) => {
        const game = parseEditableGame(pgn);
        const text = game ? variationPgn(game, path) : null;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Without clipboard permission there is nothing to do from here; the
          // full PGN is still at hand in the game tools.
        }
      },
    }),
    [edit, keepingPlace, pgn],
  );
}
