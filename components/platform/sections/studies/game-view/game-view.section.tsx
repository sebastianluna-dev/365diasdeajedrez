"use client";

import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STUDY_ERROR_MESSAGES } from "@/constants/platform/student-messages.const";
import type { GameView } from "@/services/studies/studies.types";
import { useGameAutosave } from "./use-game-autosave.hook";
import { usePgnHistory } from "./use-pgn-history.hook";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
  /**
   * What bounced back from a server action: the game's (delete without
   * confirming) and the study's, whose forms live in the aside beside this
   * column; the notice goes above the board, where the answer is looked for.
   */
  errorCode?: string;
}

/**
 * The board column of a Mis estudios game: it is read and annotated in the
 * SAME place. The study around it — its games, its actions — is the aside's
 * business (`GameAside`), which the page lays out beside this.
 *
 * There is no separate editing screen. Whoever owns the game plays on the
 * board to add moves and uses the list's right click to comment, annotate,
 * promote or delete them; all of that saves by itself. This section only
 * wires the two things the viewer cannot own: the PGN's history, which the
 * autosave reads, and the autosave itself, which is a server action.
 */
export function GameViewSection({ game, errorCode }: GameViewSectionProps) {
  const { pgn, applyPgn } = usePgnHistory(game.pgn, { undo: game.canEdit });
  const { saveLabel } = useGameAutosave({ studyId: game.studyId, gameId: game.id, pgn, enabled: game.canEdit });

  return (
    <section className="game-view">
      {errorCode && <PlatformNotice message={STUDY_ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

      <GameViewer
        pgn={pgn}
        // No header in the panel: the players are already in the board strips
        // and in the aside's record, and repeating them here stole height from
        // the moves, which is what one comes to look at.
        // In Mis estudios the game is traversed: the controls go next to the
        // moves, not under the board.
        controls="panel"
        engine
        editable={game.canEdit}
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
