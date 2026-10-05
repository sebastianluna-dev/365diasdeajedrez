import { DeleteStudy } from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { EditStudy } from "@/components/platform/sections/studies/study-detail/edit-study.comp";
import { NewGame } from "@/components/platform/sections/studies/study-detail/new-game.comp";
import { ShareCollection } from "@/components/platform/sections/studies/study-detail/share-collection.comp";
import type { GameListItem } from "@/components/platform/shared/game-list/game-list.comp";
import {
  clearGameAnnotations,
  clearGameVariations,
  deleteStudyGame,
  reorderStudyGames,
  updateGameSettings,
} from "@/services/studies/studies.actions";
import type {
  ClassGameItem,
  StudentOption,
  StudyDetail,
  StudyGameItem,
  StudyKindOption,
} from "@/services/studies/studies.types";
import { canReorderStudyGames, canShareStudy, STUDY_GAMES_PAGE_SIZE } from "@/services/studies/study-rules";
import { StudyGames } from "./study-games.comp";
import "./study-aside.comp.css";

interface StudyAsideProps {
  /** The study, with every one of its games. */
  study: StudyDetail;
  /** Results from the catalog, for "Nueva partida". Empty when nobody here can write. */
  results: StudyKindOption[];
  /** Games seen in class that can be copied. Empty = that tab of "Nueva partida" does not appear. */
  classGames: ClassGameItem[];
  /** Kinds the study can change to. Empty when it is not the viewer's. */
  kinds: StudyKindOption[];
  /** Students to hand a collection to. Empty unless the viewer owns a collection. */
  students: StudentOption[];
}

/**
 * A game as the list names it: the title the student gave it heads the row —
 * without it, `label` already falls back to the round, the event or its
 * position within the study — and who played it is the second line.
 */
function listItem(game: StudyGameItem): GameListItem {
  return {
    id: game.id,
    name: game.title ?? game.label,
    players: `${game.white} — ${game.black}`,
    title: game.title,
    orientationCode: game.orientationCode,
    analysisModeCode: game.analysisModeCode,
    pinnedComment: game.pinnedComment,
    citedInClass: game.citedInClass,
    resultLabel: game.resultLabel,
    href: game.href,
  };
}

/**
 * The study, beside its games' boards. A study has no page of its own — its
 * URL redirects to the first game — so this is where it lives: its name, its
 * owner's actions, its games to jump between and, for a collection's owner,
 * who it is shared with.
 *
 * It is mounted by the LAYOUT of the game pages and knows nothing of the game
 * on the board: going from one game to another renders the page again and not
 * this, so the list holds still — its scroll, its page, a row being dragged.
 * What is about the current game is elsewhere: its record is the page's
 * (`GameRecord`), and which row is the current one is read from the address
 * by the list's own leaf (`StudyGames`).
 *
 * It receives data and decides for itself what to show, with the same
 * permission table the server actions apply (`services/studies/study-rules`):
 * the layout only loads and hands over. It is a Server Component: the modals
 * it mounts are Client Components with their own state, and so is the list.
 */
export function StudyAside({ study, results, classGames, kinds, students }: StudyAsideProps) {
  const canWrite = study.permissions.canEditGames;
  const canShare = canShareStudy(study);
  const canReorder = canReorderStudyGames(study);

  return (
    <aside className="study-aside">
      <section className="study-aside__card">
        {/* The study heads its list: it has no page of its own, so this is
            where it is named and, for its owner, edited or deleted. */}
        <div className="study-aside__head">
          <div className="study-aside__title">
            <h2 className="study-aside__name">{study.name}</h2>
            <span className="study-aside__count">{study.gameCount}</span>
          </div>
          {canWrite && (
            <div className="study-aside__tools">
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

        <StudyGames
          games={study.games.map(listItem)}
          pageSize={STUDY_GAMES_PAGE_SIZE}
          onReorder={canReorder ? reorderStudyGames.bind(null, study.id) : undefined}
          settings={
            canWrite
              ? {
                  save: updateGameSettings.bind(null, study.id),
                  clearAnnotations: clearGameAnnotations.bind(null, study.id),
                  clearVariations: clearGameVariations.bind(null, study.id),
                  remove: deleteStudyGame.bind(null, study.id),
                }
              : undefined
          }
        />

        {canWrite && (
          <div className="study-aside__new">
            <NewGame studyId={study.id} studyName={study.name} results={results} classGames={classGames} />
          </div>
        )}
      </section>

      {/* Who a collection reaches: a card of its own, for the owner only. */}
      {canShare && <ShareCollection studyId={study.id} shares={study.shares} students={students} layout="compact" />}
    </aside>
  );
}
