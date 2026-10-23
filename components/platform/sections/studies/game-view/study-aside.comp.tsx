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
  StudyOrigin,
} from "@/services/studies/studies.types";
import { canReorderStudyGames, canShareStudy, STUDY_GAMES_PAGE_SIZE } from "@/services/studies/study-rules";
import { gameCountLabel, StudyChip } from "../study-chip/study-chip.comp";
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

/** Where a study that is not the viewer's comes from, for its chip. */
function originOf(study: StudyDetail): StudyOrigin | undefined {
  if (study.courseName) return { code: "COURSE", label: study.courseName };
  if (study.sharedByName) return { code: "TEACHER", label: study.sharedByName };
  return undefined;
}

/**
 * The study's side column, in the new design system (2026-10-23, «M4» of
 * the owner's canvas): its name and its kind as a chip with its size, the
 * sliders that open its form for its owner, «Nueva partida» as the extended
 * FAB, its games as the column's rows («Partidas»), and, for a collection's
 * owner, who it is shared with. A study has no page of its own — its URL
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
      <div className="study-aside__head">
        <div className="study-aside__heading">
          <h2 className="study-aside__name">{study.name}</h2>
          <StudyChip
            study={{ kindCode: study.kindCode, kindLabel: study.kindLabel, origin: originOf(study) }}
            suffix={gameCountLabel(study.gameCount)}
          />
        </div>
        {canWrite && <StudySettings study={study} kinds={kinds} />}
      </div>

      {canWrite && <NewGame studyId={study.id} studyName={study.name} results={results} classGames={classGames} />}

      {study.games.length > 0 && (
        <div className="study-aside__games">
          <p className="study-aside__title">Partidas</p>
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
        </div>
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
