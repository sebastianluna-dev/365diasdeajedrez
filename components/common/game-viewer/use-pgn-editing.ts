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
  /** El PGN actual: cada cambio parte de él, nunca de una copia guardada. */
  pgn: string;
  onPgnChange: (pgn: string) => void;
  /** Dónde dejar la jugada seleccionada después de cada cambio. */
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
 * Editar la partida DESDE el visor: añadir jugadas, dibujar flechas, promover,
 * copiar una línea y borrar.
 *
 * El comentario y los signos NO están aquí: se escriben en el panel bajo el
 * tablero, y el menú de la jugada sólo lleva hasta él (ver `onRequestEdit`).
 *
 * Cada operación reparsea el PGN, muta el juego de chessops y devuelve el PGN
 * nuevo hacia arriba. Es reparsear de más, sí, pero deja UNA sola fuente de
 * verdad —el PGN que el visor pinta— en vez de un juego mutable en paralelo que
 * pueda desincronizarse con él; una partida cabe de sobra en ese presupuesto.
 *
 * La lógica de ajedrez vive entera en lib/chess/pgn-edit.ts: aquí sólo se ata
 * al estado de la pantalla.
 */
export function usePgnEditing({ pgn, onPgnChange, onPathChange }: UsePgnEditingOptions): PgnEditing {
  /**
   * Aplica un cambio y publica el PGN resultante.
   *
   * `mutate` devuelve la ruta en la que dejar al visor, o null para no tocar
   * nada —jugada ilegal, ruta rota, PGN que no se puede leer—.
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
   * Muta y sigue a la jugada allá donde quede.
   *
   * Promover reindexa a los hermanos, así que la ruta de partida puede dejar de
   * señalar la misma jugada. Por eso se guarda la REFERENCIA al nodo antes de
   * mutar y se le vuelve a preguntar dónde ha quedado.
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
      // Borrar es el único que no puede quedarse donde estaba: la jugada ya no
      // existe, así que se sube al padre.
      deleteAt: (path) => edit((game) => (deleteFrom(game, path) ? parentPathOf(path) : null)),
      copyVariation: async (path) => {
        const game = parseEditableGame(pgn);
        const text = game ? variationPgn(game, path) : null;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Sin permiso de portapapeles no hay nada que hacer desde aquí; el
          // PGN completo sigue a mano en las herramientas de la partida.
        }
      },
    }),
    [edit, keepingPlace, pgn],
  );
}
