import { NewGame } from "@/components/platform/sections/studies/study-detail/new-game.comp";
import type { GameListItem } from "@/components/platform/shared/game-list/game-list.comp";
import { StudentSharePanel } from "@/components/platform/shared/student-share-panel/student-share-panel.comp";
import {
  clearGameAnnotations,
  clearGameVariations,
  deleteStudyGame,
  reorderStudyGames,
  shareStudyWithStudent,
  unshareStudyWithStudent,
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
import { gameCountLabel } from "../study-chip/study-chip.comp";
import { StudyGames } from "./study-games.comp";
import { StudySettings } from "./study-settings.comp";
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
 * A game as the list names it: the title the student gave it — without it,
 * `label` already falls back to the round, the event or its position within
 * the study —, its number in the study and its result, on one line.
 */
function listItem(game: StudyGameItem, index: number): GameListItem {
  return {
    id: game.id,
    number: index + 1,
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

/** Under the study's name: where it comes from or its kind, and how many games. */
function metaOf(study: StudyDetail): string {
  const source = study.courseName ?? study.sharedByName ?? study.kindLabel;
  return `${source} · ${gameCountLabel(study.gameCount)}`;
}

/**
 * The study's side column, in the new design system (2026-10-23, «M4» of
 * the owner's canvas, then its choice «B» the same day): «Nueva partida» as
 * the extended FAB at the top; the study's name heading its games, with
 * where it comes from or its kind and how many games under it, and the
 * sliders that open its form for its owner; its games as a numbered index,
 * one line each, and the game on the board at its foot with «Configurar»;
 * and, for a collection's owner, who it is shared with. A study has no page of its own — its URL
 * redirects to a game — so this is where it lives.
 *
 * It is mounted by the LAYOUT of the game pages and knows nothing of the game
 * on the board: going from one game to another renders the page again and not
 * this, so the list holds still — its scroll, its page, a row being dragged.
 * Which row is the current one is read from the address by the list's own
 * leaf (`StudyGames`). The empty study's page mounts it too, with no games.
 *
 * It receives data and decides for itself what to show, with the same
 * permission table the server actions apply (`services/studies/study-rules`).
 * A Server Component: the popups it mounts are Client Components with their
 * own state, and so is the list.
 */
export function StudyAside({ study, results, classGames, kinds, students }: StudyAsideProps) {
  const canWrite = study.permissions.canEditGames;
  const canShare = canShareStudy(study);
  const canReorder = canReorderStudyGames(study);

  return (
    <aside className="study-aside" aria-label="El estudio">
      {canWrite && <NewGame studyId={study.id} studyName={study.name} results={results} classGames={classGames} />}

      <div className="study-aside__head">
        <div className="study-aside__heading">
          <h2 className="study-aside__name">{study.name}</h2>
          <p className="study-aside__meta">{metaOf(study)}</p>
        </div>
        {canWrite && <StudySettings study={study} kinds={kinds} />}
      </div>

      {study.games.length > 0 && (
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
      )}

      {/* Who a collection reaches: for the owner only, at the foot of the column. */}
      {canShare && (
        <div className="study-aside__share">
          <StudentSharePanel
            subject="collection"
            shares={study.shares}
            students={students}
            share={shareStudyWithStudent.bind(null, study.id)}
            unshare={unshareStudyWithStudent.bind(null, study.id)}
            layout="compact"
          />
        </div>
      )}
    </aside>
  );
}
