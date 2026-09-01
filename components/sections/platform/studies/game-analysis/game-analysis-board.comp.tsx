"use client";

import { useCallback } from "react";
import { AnalysisBoard } from "@/components/common/analysis-board/analysis-board.comp";
import { autosaveGamePgn } from "@/services/studies/studies.actions";

interface GameAnalysisBoardProps {
  studyId: string;
  gameId: string;
  pgn: string;
}

/**
 * El tablero de la partida, con autoguardado.
 *
 * Existe sólo para atar el componente genérico a esta partida: `AnalysisBoard`
 * no sabe de estudios ni de acciones, y la sección que lo envuelve es un
 * componente de servidor y no puede pasarle una función.
 */
export function GameAnalysisBoard({ studyId, gameId, pgn }: GameAnalysisBoardProps) {
  const handleAutoSave = useCallback(
    async (nextPgn: string) => (await autosaveGamePgn(studyId, gameId, nextPgn)).ok,
    [studyId, gameId],
  );

  return <AnalysisBoard name="pgn" defaultPgn={pgn} onAutoSave={handleAutoSave} />;
}
