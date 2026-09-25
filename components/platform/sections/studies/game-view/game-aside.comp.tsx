import Link from "next/link";
import { DeleteStudy } from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { EditStudy } from "@/components/platform/sections/studies/study-detail/edit-study.comp";
import { NewGame } from "@/components/platform/sections/studies/study-detail/new-game.comp";
import { ShareCollection } from "@/components/platform/sections/studies/study-detail/share-collection.comp";
import type {
  ClassGameItem,
  GameView,
  StudentOption,
  StudyDetail,
  StudyKindOption,
} from "@/services/studies/studies.types";
import { canShareStudy } from "@/services/studies/study-rules";
import { DeleteGame } from "./delete-game.comp";
import { EditGame } from "./edit-game.comp";
import { GameList } from "./game-list.comp";
import "./game-aside.comp.css";

interface GameAsideProps {
  game: GameView;
  /** The study the game belongs to, with the page of games around it. */
  study: StudyDetail;
  /** Results from the catalog, for the game modals. Empty when nobody here can write. */
  results: StudyKindOption[];
  /** Games seen in class that can be copied. Empty = that tab of "Nueva partida" does not appear. */
  classGames: ClassGameItem[];
  /** Kinds the study can change to. Empty when it is not the viewer's. */
  kinds: StudyKindOption[];
  /** Students to hand a collection to. Empty unless the viewer owns a collection. */
  students: StudentOption[];
  /** The URL of the current game listing another page of the study's games. */
  pageHref: (page: number) => string;
}

/**
 * The four short facts, in a grid.
 *
 * All four are ALWAYS rendered, with a dash where there is no value: in a
 * two-by-two grid, hiding one cell displaces the other three, and an
 * incomplete record reads worse than one with declared gaps.
 */
function metaCells(game: GameView): { key: string; value: string }[] {
  return [
    { key: "Fecha", value: game.playedAtLabel ?? "—" },
    { key: "Ronda", value: game.round ?? "—" },
    { key: "ECO", value: game.eco ?? "—" },
    { key: "Resultado", value: game.resultLabel },
  ];
}

/**
 * The column beside a game. A study has no page of its own — its URL
 * redirects to the first game — so this is where the study lives: its name,
 * its owner's actions, its games to jump between and, for a collection's
 * owner, who it is shared with. Under it, the game's record.
 *
 * It receives data and decides for itself what to show, with the same
 * permission table the server actions apply (`services/studies/study-rules`):
 * the page only loads and hands over. It is a Server Component: the modals
 * it mounts are Client Components with their own state, and the list, the
 * one piece here with state, is `GameList`.
 */
export function GameAside({ game, study, results, classGames, kinds, students, pageHref }: GameAsideProps) {
  const canWrite = study.permissions.canEditGames;
  const canShare = canShareStudy(study);
  // Reordering needs the whole list in hand: with more than one page the
  // order is read-only.
  const canReorder = canWrite && study.pageCount === 1;
  const cells = metaCells(game);

  return (
    <aside className="game-aside">
      <section className="game-aside__card game-aside__card_variant_list">
        {/* The study heads its list: it has no page of its own, so this is
            where it is named and, for its owner, edited or deleted. */}
        <div className="game-aside__study">
          <div className="game-aside__card-head">
            <h2 className="game-aside__study-name">{study.name}</h2>
            <span className="game-aside__count">{study.gameCount}</span>
          </div>
          {canWrite && (
            <div className="game-aside__study-tools">
              <EditStudy
                id={study.id}
                name={study.name}
                description={study.description}
                kindCode={study.kindCode}
                kindLabel={study.kindLabel}
                kinds={kinds}
                canChangeKind={study.permissions.canChangeKind}
                size="inline"
              />
              {study.permissions.canDelete && (
                <DeleteStudy
                  id={study.id}
                  name={study.name}
                  gameCount={study.gameCount}
                  citedGameCount={study.citedGameCount}
                  trigger="inline"
                />
              )}
            </div>
          )}
        </div>

        <GameList studyId={study.id} siblings={study.games} currentId={game.id} canReorder={canReorder} />

        {study.pageCount > 1 && (
          <nav className="game-aside__pages" aria-label="Páginas de partidas">
            {study.page > 1 ? (
              <Link href={pageHref(study.page - 1)} className="game-aside__page-link">
                ← Anteriores
              </Link>
            ) : (
              <span className="game-aside__page-link game-aside__page-link_state_disabled">← Anteriores</span>
            )}
            <span className="game-aside__page-status">
              Página {study.page} de {study.pageCount}
            </span>
            {study.page < study.pageCount ? (
              <Link href={pageHref(study.page + 1)} className="game-aside__page-link">
                Siguientes →
              </Link>
            ) : (
              <span className="game-aside__page-link game-aside__page-link_state_disabled">Siguientes →</span>
            )}
          </nav>
        )}

        {canWrite && (
          <div className="game-aside__new">
            <NewGame studyId={study.id} studyName={study.name} results={results} classGames={classGames} />
          </div>
        )}
      </section>

      {/* The record reads top to bottom: where it was played, when and how it
          ended, and at the foot where the game came from. */}
      <section className="game-aside__card game-aside__card_variant_meta">
        <div className="game-aside__meta-head">
          <div className="game-aside__card-head">
            <p className="game-aside__label">Datos de la partida</p>
            {game.canEdit && (
              /* The whole record, without going field by field: `GameView` already
                 contains every field of `GameFieldValues`, and listing them here is
                 how the title and the federation got lost once — the form asked for
                 them and this list did not pass them, so saving erased them. */
              <EditGame studyId={game.studyId} gameId={game.id} results={results} values={game} />
            )}
          </div>

          {game.event && <p className="game-aside__event">{game.event}</p>}
          {game.site && <p className="game-aside__site">{game.site}</p>}
        </div>

        <dl className="game-aside__meta">
          {cells.map((cell) => (
            <div key={cell.key} className="game-aside__meta-cell">
              <dt className="game-aside__meta-key">{cell.key}</dt>
              <dd className="game-aside__meta-value">{cell.value}</dd>
            </div>
          ))}
        </dl>

        {/* Where it came from and, for the owner, deleting it: the moves are edited
            on the board itself, so nothing else is left here. */}
        <div className="game-aside__meta-foot">
          <span className="game-aside__source">{game.sourceLabel}</span>
          {game.canEdit && (
            <DeleteGame
              studyId={game.studyId}
              gameId={game.id}
              name={game.title ?? `${game.white} – ${game.black}`}
              classBlockCount={game.classBlockCount}
              size="inline"
              label="Borrar"
            />
          )}
        </div>
      </section>

      {/* Who a collection reaches: a card of its own, for the owner only. */}
      {canShare && <ShareCollection studyId={study.id} shares={study.shares} students={students} layout="compact" />}
    </aside>
  );
}
