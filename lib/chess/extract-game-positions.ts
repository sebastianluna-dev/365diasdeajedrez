import { createPositionHash } from "./position-hash";
import { replayGameDetailed } from "./replay";

// Convierte una partida en la colección de posiciones por las que pasó, que es
// lo que indexa el buscador por posición (ver services/game-positions).
//
// Cada fila responde a «esta partida estuvo en esta posición y después se jugó
// X»: de ahí salen tanto las partidas que contienen una posición como las
// estadísticas de continuaciones.

export interface ExtractedPosition {
  /** Medias jugadas desde el inicio. 0 es la posición de partida. */
  ply: number;
  positionHash: string;
  /** Jugada que se jugó DESDE esta posición. Nula en la posición final. */
  nextMoveSan: string | null;
  /** La misma jugada en UCI: es la forma estable de agrupar entre partidas. */
  nextMoveUci: string | null;
}

export interface ExtractGamePositionsResult {
  positions: ExtractedPosition[];
  /**
   * Avisos del reproductor (PGN ilegible o jugada ilegal). No son un error: la
   * partida se indexa hasta donde se pudo reproducir, y quien importa decide
   * si informar al usuario.
   */
  warnings: string[];
}

/**
 * Reproduce el PGN y devuelve una posición por ply, ya hasheada.
 *
 * Se apoya en `replayGameDetailed`, que es el reproductor de la plataforma
 * (mismo parseo, mismas reglas y mismos FEN que ve el alumno en el tablero):
 * indexar con otro camino permitiría que el índice y la pantalla discreparan.
 *
 * Una posición repetida dentro de la misma partida produce varias filas, una
 * por ply. Es deliberado —cada visita pudo continuar distinto— y obliga a
 * contar partidas por `gameId` distintos, nunca por número de filas.
 */
export function extractGamePositions(pgn: string): ExtractGamePositionsResult {
  const { positions, warnings } = replayGameDetailed(pgn);

  const extracted = positions.map((position, index) => {
    const next = positions[index + 1];
    return {
      ply: index,
      positionHash: createPositionHash(position.fen),
      nextMoveSan: next ? next.san : null,
      nextMoveUci: next ? next.uci : null,
    };
  });

  return { positions: extracted, warnings };
}
