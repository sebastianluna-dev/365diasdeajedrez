import "server-only";
import { pgnOfFen } from "@/lib/chess/position-input";
import { getPlayedGame } from "@/services/play/play.service";
import { getGameById } from "@/services/studies/studies.service";

// Where the analysis board starts from, read through each source's own
// visibility rule: a FEN in the URL, a played game, or a study's game. A
// source the person may not see opens the board empty, as if nothing had been
// asked. A PGN never travels in the URL.

export interface AnalysisSource {
  pgn: string;
  /** What the board opened with, said above it: «Partida: Ana Torres – Don Chuy». */
  label: string;
}

export async function resolveAnalysisSource(query: {
  fen?: string;
  partida?: string;
  estudio?: string;
}): Promise<AnalysisSource | null> {
  if (query.estudio && query.partida) {
    const game = await getGameById(query.estudio, query.partida);
    return game ? { pgn: game.pgn, label: `Partida: ${game.white} – ${game.black}` } : null;
  }
  if (query.partida) {
    const played = await getPlayedGame(query.partida);
    return played ? { pgn: played.pgn, label: `Partida: ${played.white.name} – ${played.black.name}` } : null;
  }
  if (query.fen) {
    const pgn = pgnOfFen(query.fen);
    return pgn ? { pgn, label: "Posición del enlace" } : null;
  }
  return null;
}
