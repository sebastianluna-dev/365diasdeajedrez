"use client";

import { useCallback } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { useGameAutosave } from "@/components/platform/shared/use-game-autosave.hook";
import { usePgnHistory } from "@/components/platform/shared/use-pgn-history.hook";
import type { AutosaveResult } from "@/services/shared/game-record";
import { autosaveChapterGamePgn } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterGameDetail } from "@/services/staff-courses/staff-courses.types";
import "./chapter-game-board.comp.css";

/**
 * What to say when a save is refused. Only the reasons the staff can do
 * something about get words of their own; for the rest the viewer's «no se
 * pudo guardar» is all there is to say.
 */
const FAILURE_MESSAGES: Partial<Record<NonNullable<AutosaveResult["reason"]>, string>> = {
  training:
    "No se guardó: una lección entrenable usa esta partida y con ese cambio se quedaría sin línea principal que entrenar. Deshaz el cambio (Ctrl+Z) o desmarca la lección como entrenable.",
  throttled: "Demasiados cambios seguidos. Espera un momento: se guardará con el siguiente.",
  denied: "Esta partida ya no está en la colección del capítulo. Recarga la página.",
};

interface ChapterGameBoardProps {
  game: ChapterGameDetail;
}

/**
 * The board column of a game of the chapter: it is read and edited in the
 * SAME place, exactly as a student does with a game of their own studies.
 * Moves are played on the board to add them, the list's right click comments,
 * annotates, promotes or deletes them, and all of it saves by itself.
 *
 * It is the leaf with state of the screen: the PGN's history and the
 * autosave. What is around it stays on the server.
 */
export function ChapterGameBoard({ game }: ChapterGameBoardProps) {
  const { pgn, applyPgn } = usePgnHistory(game.pgn, { undo: true });
  const save = useCallback(
    (next: string) => autosaveChapterGamePgn(game.courseId, game.chapterId, game.id, next),
    [game.courseId, game.chapterId, game.id],
  );
  const { saveLabel, failure } = useGameAutosave({ pgn, enabled: true, save });
  const failureMessage = failure ? FAILURE_MESSAGES[failure] : undefined;

  return (
    <section className="chapter-game-board">
      {failureMessage && <PlatformNotice message={failureMessage} />}

      <GameViewer
        pgn={pgn}
        orientation={game.orientation}
        // The same viewer the studies mount, set the same way: the controls
        // next to the moves, the engine on offer and the tools under the board.
        controls="panel"
        engine
        editable
        onPgnChange={applyPgn}
        players={{
          white: { name: game.white, elo: game.whiteElo, title: game.whiteTitle, country: game.whiteCountry },
          black: { name: game.black, elo: game.blackElo, title: game.blackTitle, country: game.blackCountry },
        }}
        tools={{ saveLabel }}
      />
    </section>
  );
}
