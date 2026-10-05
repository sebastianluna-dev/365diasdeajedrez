"use client";

import Link from "next/link";
import { useCallback } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  isCompleteImport,
  pgnImportNotice,
  type PgnImportReport,
} from "@/constants/platform/pgn-import-messages.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { STUDY_ERROR_MESSAGES } from "@/constants/platform/student-messages.const";
import { GAME_ANALYSIS_MODE, GAME_ANALYSIS_MODE_LABELS } from "@/constants/platform/study-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView } from "@/services/studies/studies.types";
import { useGameAutosave } from "@/components/platform/shared/use-game-autosave.hook";
import { usePgnHistory } from "@/components/platform/shared/use-pgn-history.hook";
import { autosaveGamePgn } from "@/services/studies/studies.actions";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
  /**
   * The owner asked to see the game as a reader: nothing is edited or saved,
   * and the game's analysis mode applies, as it does to whoever cannot edit it.
   */
  asReader?: boolean;
  /**
   * What bounced back from a server action: the game's (delete without
   * confirming) and the study's, whose forms live in the aside beside this
   * column; the notice goes above the board, where the answer is looked for.
   */
  errorCode?: string;
  /** The result of the PGN import that has just happened, if one has: how many games went in. */
  importReport?: PgnImportReport | null;
}

/**
 * The board column of a Mis estudios game: it is read and annotated in the
 * SAME place. The study around it — its games, its actions — is the layout's
 * business (`StudyAside`), and the game's record is `GameRecord`, which the
 * page renders after this.
 *
 * There is no separate editing screen. Whoever owns the game plays on the
 * board to add moves and uses the list's right click to comment, annotate,
 * promote or delete them; all of that saves by itself. This section only
 * wires the two things the viewer cannot own: the PGN's history, which the
 * autosave reads, and the autosave itself, which is a server action.
 */
export function GameViewSection({ game, asReader = false, errorCode, importReport }: GameViewSectionProps) {
  // An owner looking as a reader edits nothing: the viewer is the reader's.
  const canEdit = game.canEdit && !asReader;
  const { pgn, applyPgn } = usePgnHistory(game.pgn, { undo: canEdit });
  const save = useCallback((next: string) => autosaveGamePgn(game.studyId, game.id, next), [game.studyId, game.id]);
  const { saveLabel } = useGameAutosave({ pgn, enabled: canEdit, save });

  // The mode is the reader's: it changes nothing for whoever edits the game,
  // so its owner is told it is on and given the way to see it at work.
  const mode = game.analysisModeCode === GAME_ANALYSIS_MODE.CONCEAL ? GAME_ANALYSIS_MODE.CONCEAL : null;
  const gamePath = platformRoutes.gameDetail(game.studyId, game.id);

  return (
    <section className="game-view">
      {errorCode && <PlatformNotice message={STUDY_ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}
      {importReport && (
        <PlatformNotice
          message={pgnImportNotice(importReport)}
          variant={isCompleteImport(importReport) ? "success" : "info"}
        />
      )}

      {game.canEdit && mode && (
        <p className="game-view__mode">
          {asReader ? "Estás viendo la partida como la ve quien la lee" : "Quien lea esta partida la verá en el modo"} «
          {GAME_ANALYSIS_MODE_LABELS[mode]}».{" "}
          <Link href={asReader ? gamePath : `${gamePath}?vista=lector`} className="game-view__mode-link">
            {asReader ? "Volver a editar" : "Ver como lector"}
          </Link>
        </p>
      )}

      <GameViewer
        pgn={pgn}
        orientation={game.orientationCode === BOARD_ORIENTATION.BLACK ? "black" : "white"}
        pinnedComment={game.pinnedComment}
        hideNextMoves={mode === GAME_ANALYSIS_MODE.CONCEAL}
        // No header in the panel: the players are already in the board strips
        // and in the aside's record, and repeating them here stole height from
        // the moves, which is what one comes to look at.
        // In Mis estudios the game is traversed: the controls go next to the
        // moves, not under the board.
        controls="panel"
        engine
        editable={canEdit}
        onPgnChange={applyPgn}
        players={{
          white: { name: game.white, elo: game.whiteElo, title: game.whiteTitle, country: game.whiteCountry },
          black: { name: game.black, elo: game.blackElo, title: game.blackTitle, country: game.blackCountry },
        }}
        result={game.resultLabel}
        tools={{ saveLabel }}
      />
    </section>
  );
}
