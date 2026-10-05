import Link from "next/link";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { GameList } from "@/components/platform/shared/game-list/game-list.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { reorderChapterGames, updateChapterGameDetails } from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption, ChapterGameDetail } from "@/services/staff-courses/staff-courses.types";
import "./chapter-game-aside.comp.css";

interface ChapterGameAsideProps {
  game: ChapterGameDetail;
  /** Results from the catalog, for the record's form. */
  results: CatalogOption[];
}

/**
 * The four short facts, in a grid.
 *
 * All four are ALWAYS rendered, with a dash where there is no value: in a
 * two-by-two grid, hiding one cell displaces the other three, and an
 * incomplete record reads worse than one with declared gaps.
 */
function metaCells(game: ChapterGameDetail): { key: string; value: string }[] {
  return [
    { key: "Fecha", value: game.playedAtLabel ?? "—" },
    { key: "Ronda", value: game.round ?? "—" },
    { key: "ECO", value: game.eco ?? "—" },
    { key: "Resultado", value: game.resultLabel },
  ];
}

/**
 * The column beside a game of the chapter: the chapter's collection, to jump
 * between its games and to go back to it; the game's record, with «Editar»;
 * and the lessons that show this game, which is what makes editing it matter.
 *
 * It is a Server Component: the dialog it mounts and the list are the Client
 * Components, each with its own state.
 */
export function ChapterGameAside({ game, results }: ChapterGameAsideProps) {
  const cells = metaCells(game);

  return (
    <aside className="chapter-game-aside">
      <section className="chapter-game-aside__card">
        {/* The chapter heads its list: there is no trail above the page, so
            this is where it says whose games these are and leads back. */}
        <div className="chapter-game-aside__head">
          <div className="chapter-game-aside__head-row">
            <h2 className="chapter-game-aside__chapter">{game.chapterName}</h2>
            <span className="chapter-game-aside__count">{game.siblings.length}</span>
          </div>
          <p className="chapter-game-aside__course">
            Capítulo {game.chapterOrder} · {game.courseName}
          </p>
          <Link href={staffRoutes.chapterGames(game.courseId, game.chapterId)} className="chapter-game-aside__back">
            Ver la colección
          </Link>
        </div>

        {/* Every game of a collection is the staff's to put in order. */}
        <GameList
          games={game.siblings.map((sibling) => ({
            id: sibling.id,
            name: sibling.label,
            resultLabel: sibling.resultLabel,
            href: sibling.href,
          }))}
          currentId={game.id}
          onReorder={reorderChapterGames.bind(null, game.courseId, game.chapterId)}
        />
      </section>

      {/* The record reads top to bottom: what it is called here, where it was
          played, when and how it ended, and at the foot where it came from. */}
      <section className="chapter-game-aside__card">
        <div className="chapter-game-aside__record-head">
          <div className="chapter-game-aside__head-row">
            <p className="chapter-game-aside__label">Datos de la partida</p>
            {/* The whole record, without going field by field: the game carries
                every field of the form, and listing them here is how one of
                them would get lost and be erased on saving. */}
            <EditGame
              action={updateChapterGameDetails.bind(null, game.courseId, game.chapterId, game.id)}
              results={results}
              values={game}
              titleHint="Cómo se identifica esta partida en la colección del capítulo. Si lo dejas vacío se usan los dos jugadores."
            />
          </div>

          {game.event && <p className="chapter-game-aside__event">{game.event}</p>}
          {game.site && <p className="chapter-game-aside__site">{game.site}</p>}
        </div>

        <dl className="chapter-game-aside__meta">
          {cells.map((cell) => (
            <div key={cell.key} className="chapter-game-aside__meta-cell">
              <dt className="chapter-game-aside__meta-key">{cell.key}</dt>
              <dd className="chapter-game-aside__meta-value">{cell.value}</dd>
            </div>
          ))}
        </dl>

        <div className="chapter-game-aside__foot">{game.sourceLabel}</div>
      </section>

      <section className="chapter-game-aside__card chapter-game-aside__card_variant_lessons">
        <p className="chapter-game-aside__label">Lecciones que la usan</p>
        {game.lessons.length > 0 ? (
          <>
            <ul className="chapter-game-aside__lessons">
              {game.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={lesson.href} className="chapter-game-aside__lesson">
                    {lesson.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="chapter-game-aside__note">
              Lo que cambies aquí es lo que ven sus alumnos. Si cambias jugadas, sus ejercicios quedan por revisar.
            </p>
          </>
        ) : (
          <p className="chapter-game-aside__note">Ninguna todavía. Se enlaza desde la lección.</p>
        )}
      </section>
    </aside>
  );
}
