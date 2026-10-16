"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
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
import { platformRoutes, teacherRoutes } from "@/lib/platform-routes";
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
  const { path, onPathChange } = useRememberedMove(game.id);

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
        // A teacher's own game offers «Crear ejercicio desde aquí» (D11), also
        // seen as a reader: it only links to the editor, it changes nothing here.
        exerciseFromHereHref={
          game.canCreateExercise ? teacherRoutes.newExerciseFromGame(game.studyId, game.id) : undefined
        }
        path={path}
        onPathChange={onPathChange}
      />
    </section>
  );
}

/** Where a game's move is kept, in this browser: one key per game. */
const moveKey = (gameId: string) => `365:estudios:partida:${gameId}:jugada`;

/** Another tab that moves through the same game keeps this one in step. */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readMove(gameId: string): string | null {
  try {
    return localStorage.getItem(moveKey(gameId));
  } catch {
    // Storage refused (a private window, blocked data): nothing remembered.
    return null;
  }
}

/**
 * The move a game was left on, kept by the browser (`localStorage`) and given
 * back when the game is opened again (2026-10-07): which game a study opens on
 * is the server's (`StudyVisit`), which move inside it is this device's, saved
 * on every move, at once, with nothing to send when the page closes.
 *
 * The viewer is driven (`path`): the server renders the start, which is all
 * it can know, and the browser's first render already takes the stored move
 * (`useSyncExternalStore`), so the board — drawn in the browser only — opens
 * on it. A move the PGN no longer has is resolved by the viewer to its
 * closest ancestor. What the viewer reports back that is the move it was
 * given is an echo, not a move, and is not written.
 */
function useRememberedMove(gameId: string) {
  const saved = useSyncExternalStore(
    subscribeToStorage,
    () => readMove(gameId),
    () => null,
  );
  const [moved, setMoved] = useState<{ gameId: string; path: string } | null>(null);
  const path = moved?.gameId === gameId ? moved.path : (saved ?? "");

  const onPathChange = (next: string) => {
    if (next === path) return;
    setMoved({ gameId, path: next });
    try {
      if (next) localStorage.setItem(moveKey(gameId), next);
      else localStorage.removeItem(moveKey(gameId));
    } catch {
      // Storage refused: the move is simply not remembered.
    }
  };

  return { path, onPathChange };
}
