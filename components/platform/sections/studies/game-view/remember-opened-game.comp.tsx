"use client";

import { useEffect } from "react";
import { rememberOpenedGame } from "@/services/studies/studies.actions";

interface RememberOpenedGameProps {
  studyId: string;
  gameId: string;
}

/**
 * Tells the server that this game is the one the study was last left on: «Mis
 * estudios» opens the study on it, its card shows where it ends, and
 * «Recientes» orders by when it was opened (`StudyVisit`). From the browser,
 * once the game is on screen, and not while the page renders: a page Next
 * prefetches is rendered and never seen. Draws nothing.
 */
export function RememberOpenedGame({ studyId, gameId }: RememberOpenedGameProps) {
  useEffect(() => {
    // Fire and forget: a failed write costs a stale card, nothing on screen.
    void rememberOpenedGame(studyId, gameId);
  }, [studyId, gameId]);

  return null;
}
