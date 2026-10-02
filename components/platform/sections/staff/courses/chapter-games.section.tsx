import Link from "next/link";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  isCompleteImport,
  pgnImportNotice,
  type PgnImportReport,
} from "@/constants/platform/pgn-import-messages.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { deleteChapterGame, importChapterGames } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail, CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "./staff-panel.comp";
import "./chapter-games.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface ChapterGamesSectionProps {
  chapter: ChapterAdminDetail;
  games: CourseGameRow[];
  errorCode?: string;
  /** The result of the PGN import that has just happened, if one has: how many games went in. */
  importReport?: PgnImportReport | null;
}

/**
 * The chapter's game collection: here writing does happen.
 *
 * It is the ONLY place where a PGN is pasted. The chapter's lessons choose
 * from this list, and fixing a game fixes at once every lesson that uses it.
 * Each game opens on the board, where it is read and edited.
 */
export function ChapterGamesSection({ chapter, games, errorCode, importReport }: ChapterGamesSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="chapter-games">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      {importReport && (
        <PlatformNotice
          message={pgnImportNotice(importReport)}
          variant={isCompleteImport(importReport) ? "success" : "info"}
        />
      )}

      <StaffPanel
        title="Colección de partidas"
        meta={`${games.length}`}
        description="Las lecciones de este capítulo eligen de aquí, y corregir una partida arregla todas las lecciones que la usan. Ábrela para verla en el tablero y editarla; aquí es donde se pega un PGN nuevo."
      >
        {games.length > 0 ? (
          <ul className="chapter-games__list">
            {games.map((game) => (
              <li key={game.id} className="chapter-games__row">
                <span className="chapter-games__text">
                  <Link href={game.href} className="chapter-games__title">
                    {game.title}
                  </Link>
                  <span className="chapter-games__meta">
                    {game.detail}
                    {game.detail && " · "}
                    {game.moveCount} jugadas
                    {game.lessonCount > 0 &&
                      ` · en ${game.lessonCount} ${game.lessonCount === 1 ? "lección" : "lecciones"}`}
                  </span>
                </span>

                {/* Removal is only offered for the one no lesson uses: the foreign key
                    is SET NULL, so deleting it would not fail, it would empty them
                    silently. */}
                <Link
                  href={game.href}
                  className="chapter-games__open"
                  aria-label={`Abrir «${game.title}» en el tablero`}
                >
                  Abrir
                </Link>
                {game.lessonCount === 0 && (
                  <form action={deleteChapterGame.bind(null, chapter.courseId, chapter.id)}>
                    <input type="hidden" name="gameId" value={game.id} />
                    <SubmitButton className="chapter-games__remove" pendingLabel="Quitando…">
                      Quitar
                    </SubmitButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="chapter-games__empty">
            Este capítulo todavía no tiene partidas. Pega un PGN para empezar: sus lecciones sólo pueden usar partidas
            de aquí.
          </p>
        )}

        <form className="chapter-games__import" action={importChapterGames.bind(null, chapter.courseId, chapter.id)}>
          <textarea
            name="pgn"
            required
            rows={6}
            className="chapter-games__import-input"
            placeholder={`Pega aquí un PGN con una o varias partidas (hasta ${PGN_MAX_GAMES} por importación)`}
            aria-label="PGN a importar"
          />
          <SubmitButton className="platform-button" pendingLabel="Importando…">
            Importar PGN
          </SubmitButton>
        </form>
      </StaffPanel>
    </div>
  );
}
