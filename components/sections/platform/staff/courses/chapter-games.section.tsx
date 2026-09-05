import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import { deleteChapterGame, importChapterGames } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail, CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import { StaffEditorHead } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import { StaffTabs } from "./staff-tabs.comp";
import "./chapter-games.section.css";

interface ChapterGamesSectionProps {
  chapter: ChapterAdminDetail;
  games: CourseGameRow[];
  errorCode?: string;
}

/**
 * La colección de partidas del capítulo: aquí sí se escribe.
 *
 * Es el ÚNICO sitio donde se pega un PGN. Las lecciones del capítulo eligen de
 * esta lista, y corregir una partida arregla de una vez todas las que la usan.
 */
export function ChapterGamesSection({ chapter, games, errorCode }: ChapterGamesSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="chapter-games">
      <StaffEditorHead
        crumbs={[
          { label: "Cursos", href: staffRoutes.courses },
          { label: chapter.courseName, href: staffRoutes.courseDetail(chapter.courseId) },
        ]}
        title={chapter.name}
        meta={<span>Capítulo {chapter.order}</span>}
      />

      <StaffTabs
        current={staffRoutes.chapterGames(chapter.courseId, chapter.id)}
        tabs={[
          { label: "Capítulo", href: staffRoutes.chapterDetail(chapter.courseId, chapter.id) },
          {
            label: "Partidas",
            href: staffRoutes.chapterGames(chapter.courseId, chapter.id),
            count: games.length,
          },
        ]}
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffPanel
        title="Colección de partidas"
        meta={`${games.length}`}
        description="Las lecciones de este capítulo eligen de aquí, y corregir una partida arregla todas las lecciones que la usan. Es el único sitio donde se pega un PGN."
      >
        {games.length > 0 ? (
          <ul className="chapter-games__list">
            {games.map((game) => (
              <li key={game.id} className="chapter-games__row">
                <span className="chapter-games__text">
                  <span className="chapter-games__title">{game.title}</span>
                  <span className="chapter-games__meta">
                    {game.detail}
                    {game.detail && " · "}
                    {game.moveCount} jugadas
                    {game.lessonCount > 0 &&
                      ` · en ${game.lessonCount} ${game.lessonCount === 1 ? "lección" : "lecciones"}`}
                  </span>
                </span>

                {/* Sólo se ofrece quitar la que no usa ninguna lección: la clave
                    ajena es SET NULL, así que borrarla no fallaría, las vaciaría
                    en silencio. */}
                {game.lessonCount === 0 && (
                  <form action={deleteChapterGame.bind(null, chapter.courseId, chapter.id)}>
                    <input type="hidden" name="gameId" value={game.id} />
                    <button type="submit" className="chapter-games__remove">
                      Quitar
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="chapter-games__empty">
            Este capítulo todavía no tiene partidas. Pega un PGN para empezar: sus lecciones sólo pueden usar
            partidas de aquí.
          </p>
        )}

        <form
          className="chapter-games__import"
          action={importChapterGames.bind(null, chapter.courseId, chapter.id)}
        >
          <textarea
            name="pgn"
            required
            rows={6}
            className="chapter-games__import-input"
            placeholder="Pega aquí un PGN con una o varias partidas"
            aria-label="PGN a importar"
          />
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Importar PGN
          </button>
        </form>
      </StaffPanel>
    </div>
  );
}
