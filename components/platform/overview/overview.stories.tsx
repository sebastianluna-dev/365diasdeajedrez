import { type ComponentProps, type CSSProperties, Fragment, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { AdventureCover } from "@/components/adventure/cover/adventure-cover/adventure-cover.comp";
import { JourneyMiniature } from "@/components/adventure/cover/journey-miniature/journey-miniature.comp";
import { NotebookCard } from "@/components/adventure/cover/notebook-card/notebook-card.comp";
import { Ticket } from "@/components/adventure/cover/ticket/ticket.comp";
import { Keepsake } from "@/components/adventure/keepsakes/keepsake/keepsake.comp";
import { AdventureMap } from "@/components/adventure/map/adventure-map/adventure-map.comp";
import { NotePage } from "@/components/adventure/note-page/note-page/note-page.comp";
import { PaperFrame } from "@/components/adventure/paper-frame/paper-frame/paper-frame.comp";
import { RivalCard } from "@/components/adventure/rival-card/rival-card/rival-card.comp";
import { EncounterStamp } from "@/components/adventure/stamp/encounter-stamp/encounter-stamp.comp";
import { AdventureShelf } from "@/components/adventure/shelf/adventure-shelf/adventure-shelf.comp";
import { NotebookSpine } from "@/components/adventure/shelf/notebook-spine/notebook-spine.comp";
import { OpenNotebook } from "@/components/adventure/shelf/open-notebook/open-notebook.comp";
import { BotScoreboard } from "@/components/chess/bot-scoreboard/bot-scoreboard.comp";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ChessMoveQualityIcon } from "@/components/chess/chess-move-quality-icon.comp";
import { EnginePanel } from "@/components/chess/game-viewer/engine-panel.comp";
import { GameReviewChart } from "@/components/chess/game-viewer/game-review-chart.comp";
import { GameOverActions } from "@/components/chess/game-viewer/game-over-actions.comp";
import { GameReview } from "@/components/chess/game-viewer/game-review.comp";
import { GameTools } from "@/components/chess/game-viewer/game-tools.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { MoveContextMenu } from "@/components/chess/game-viewer/move-context-menu.comp";
import { MoveTable } from "@/components/chess/game-viewer/move-table.comp";
import { PiecePlacementBoard } from "@/components/chess/piece-placement-board/piece-placement-board.comp";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { AbandonPopup } from "@/components/platform/sections/play/live-game/abandon-popup/abandon-popup.comp";
import { LiveGameBanner } from "@/components/platform/sections/play/live-game/live-game-banner/live-game-banner.comp";
import { BotCard } from "@/components/platform/sections/play/lobby/bot-card/bot-card.comp";
import { BotSheet } from "@/components/platform/sections/play/lobby/bot-sheet/bot-sheet.comp";
import { OpenGameNotice } from "@/components/platform/sections/play/lobby/open-game-notice/open-game-notice.comp";
import { BotLevelCard } from "@/components/platform/sections/profile/bot-level-card/bot-level-card.comp";
import { GamesSummaryCard } from "@/components/platform/sections/profile/games-summary-card/games-summary-card.comp";
import { LevelSparkline } from "@/components/platform/sections/profile/level-sparkline/level-sparkline.comp";
import { PlayedGamesTimeline } from "@/components/platform/sections/profile/played-games-timeline/played-games-timeline.comp";
import { StudyStreakCard } from "@/components/platform/sections/profile/study-streak-card/study-streak-card.comp";
import { PlayedGameCard } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { MoveTree } from "@/components/chess/game-viewer/move-tree.comp";
import { MoveNotes } from "@/components/chess/game-viewer/move-notes.comp";
import { PlayerStrip } from "@/components/chess/game-viewer/player-strip.comp";
import { MoveLinePreview } from "@/components/chess/move-line-preview/move-line-preview.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { ArrowRightArrowLeftIcon } from "@/components/icons/arrow-right-arrow-left-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CaretRightIcon } from "@/components/icons/caret-right-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClipboardIcon } from "@/components/icons/clipboard-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { ArrowRightFromBracketIcon } from "@/components/icons/arrow-right-from-bracket-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { ArrowsRotateIcon } from "@/components/icons/arrows-rotate-icon.comp";
import { ExpandIcon } from "@/components/icons/expand-icon.comp";
import { SlidersIcon } from "@/components/icons/sliders-icon.comp";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { HeartIcon } from "@/components/icons/heart-icon.comp";
import { ImageIcon } from "@/components/icons/image-icon.comp";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { ForwardStepIcon } from "@/components/icons/forward-step-icon.comp";
import { BackwardStepIcon } from "@/components/icons/backward-step-icon.comp";
import { LogoMarkIcon } from "@/components/icons/logo-mark-icon.comp";
import { BarsIcon } from "@/components/icons/bars-icon.comp";
import { MoonIcon } from "@/components/icons/moon-icon.comp";
import { EllipsisIcon } from "@/components/icons/ellipsis-icon.comp";
import { CommentIcon } from "@/components/icons/comment-icon.comp";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { mdFab } from "@/lib/material/material-classes";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { ArrowRightToLineIcon } from "@/components/icons/arrow-right-to-line-icon.comp";
import { VolumeXmarkIcon } from "@/components/icons/volume-xmark-icon.comp";
import { VolumeLowIcon } from "@/components/icons/volume-low-icon.comp";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { PLATFORM_CSS } from "@/components/platform/foundations/platform-stylesheets.const";
import { FROM_2XL, FROM_2XL_PROPERTIES, TYPE_STEPS } from "@/components/platform/foundations/scales.const";
import { useSchemeOnScreen } from "@/components/platform/foundations/use-scheme-on-screen.hook";
import { ClassAheadSection } from "@/components/platform/sections/classes/class-detail/class-ahead.section";
import { ClassReviewSection } from "@/components/platform/sections/classes/class-detail/class-review.section";
import { ClassGameSave } from "@/components/platform/shared/class-game-save/class-game-save.comp";
import { PaidClassesCard } from "@/components/platform/shared/paid-classes-card/paid-classes-card.comp";
import { PastClassCard } from "@/components/platform/shared/past-class-card/past-class-card.comp";
import { CourseCard } from "@/components/platform/sections/courses/course-card.comp";
import { LevelScale } from "@/components/platform/sections/courses/course-info/level-scale.comp";
import { LessonPracticeList } from "@/components/platform/sections/courses/lesson-view/lesson-practice-list.comp";
import { LessonSkeleton } from "@/components/platform/sections/courses/lesson-view/lesson-skeleton.comp";
import { OutlineList } from "@/components/platform/sections/courses/lesson-view/outline-list.comp";
import { MyCourseCard } from "@/components/platform/sections/courses/my-courses/my-course-card.comp";
import { StatsCards } from "@/components/platform/sections/dashboard/activity-stats/stats-cards.comp";
import { ExplorerGames } from "@/components/platform/sections/explorer/explorer-games.comp";
import { ExplorerNextMoves } from "@/components/platform/sections/explorer/explorer-next-moves.comp";
import { PlatformAppsMenu } from "@/components/platform/sections/shell/platform-apps-menu.comp";
import { SaveToStudyPopup } from "@/components/platform/shared/save-to-study-popup/save-to-study-popup.comp";
import { PlayVsEngine } from "@/components/platform/sections/tools/analysis-board/play-vs-engine/play-vs-engine.comp";
import { PositionInput } from "@/components/platform/sections/tools/analysis-board/position-input/position-input.comp";
import { AuthorAvatar } from "@/components/platform/sections/staff/courses/authors-manager/author-avatar.comp";
import { CourseSourceForm } from "@/components/platform/sections/staff/courses/course-sources/course-source-form.comp";
import { NewCourseForm } from "@/components/platform/sections/staff/courses/new-course/new-course-form.comp";
import { StaffEditorHead } from "@/components/platform/sections/staff/courses/staff-editor.comp";
import { StaffPanel } from "@/components/platform/sections/staff/courses/staff-panel.comp";
import { StaffTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.comp";
import { PlatformTabPanel, PlatformTabs } from "@/components/platform/shared/platform-tabs/platform-tabs.comp";
import { MovePathPicker } from "@/components/platform/shared/move-path-picker/move-path-picker.comp";
import { ExerciseAuthoring } from "@/components/platform/shared/exercise-authoring/exercise-authoring.comp";
import { DeleteExercise } from "@/components/platform/shared/delete-exercise/delete-exercise.comp";
import { ExerciseAttemptRow } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.comp";
import { ExercisePicker } from "@/components/platform/shared/exercise-picker/exercise-picker.comp";
import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { SeriesProgressTable } from "@/components/platform/shared/series-progress-table/series-progress-table.comp";
import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { StudentSharePanel } from "@/components/platform/shared/student-share-panel/student-share-panel.comp";
import { AddSeriesExercisesButton } from "@/components/platform/shared/add-series-exercises-popup/add-series-exercises-popup.comp";
import { NewSeriesButton } from "@/components/platform/shared/series-data-popup/series-data-popup.comp";
import { courseTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.const";
import { ClassAgenda } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import { ClassDateTile } from "@/components/platform/shared/class-date-tile/class-date-tile.comp";
import { ClassRow } from "@/components/platform/shared/class-row/class-row.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassTicket } from "@/components/platform/shared/class-ticket/class-ticket.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { CopyLinkButton } from "@/components/platform/shared/copy-link-button/copy-link-button.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import {
  PlatformSettingsGroup,
  PlatformSettingsPanel,
} from "@/components/platform/shared/platform-settings-panel/platform-settings-panel.comp";
import { SETTINGS_ATTRIBUTE } from "@/components/platform/shared/platform-settings-panel/settings-panel-state";
import { PlatformSettingsToggle } from "@/components/platform/shared/platform-settings-toggle/platform-settings-toggle.comp";
import { CourseSettingsArt } from "@/components/platform/sections/courses/course-study/course-settings-art.comp";
import { ClassSlotFields } from "@/components/platform/shared/class-slot-fields/class-slot-fields.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { ScheduleSeatPopup } from "@/components/platform/shared/schedule-seat-popup/schedule-seat-popup.comp";
import { AddStudentsButton } from "@/components/platform/sections/staff/classes/add-students-popup/add-students-popup.comp";
import { ChangeAttendanceButton } from "@/components/platform/sections/staff/classes/change-attendance-popup/change-attendance-popup.comp";
import { ChangeTeacherButton } from "@/components/platform/sections/staff/classes/change-teacher-popup/change-teacher-popup.comp";
import { ClassSeatRow } from "@/components/platform/sections/staff/classes/class-seat-row/class-seat-row.comp";
import { NewClassForm } from "@/components/platform/sections/staff/classes/new-class-form/new-class-form.comp";
import { RescheduleClassButton } from "@/components/platform/sections/staff/classes/reschedule-class-popup/reschedule-class-popup.comp";
import { RescheduleSeatButton } from "@/components/platform/sections/staff/classes/reschedule-seat-popup/reschedule-seat-popup.comp";
import { AttendanceRow } from "@/components/platform/shared/attendance-row/attendance-row.comp";
import { ClassRowAction } from "@/components/platform/shared/class-row-action/class-row-action.comp";
import { MeetingLinkButton } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.comp";
import { AfterNotesButton } from "@/components/platform/sections/teacher/classes/after-notes-popup/after-notes-popup.comp";
import {
  BlockPopup,
  type BlockPopupHandle,
} from "@/components/platform/sections/teacher/classes/class-block-editor/block-popup.comp";
import { ClassCalendar } from "@/components/platform/sections/teacher/class-calendar/class-calendar.comp";
import {
  CALENDAR_SAMPLE_CLASSES,
  CALENDAR_SAMPLE_NOW,
  CALENDAR_SAMPLE_ZONE,
} from "@/components/platform/sections/teacher/class-calendar/class-calendar.sample";
import { ClassPageEditor } from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.comp";
import {
  EDITOR_SAMPLE_BLOCKS,
  EDITOR_SAMPLE_OPTIONS,
} from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.sample";
import { ClassBlockList } from "@/components/platform/sections/teacher/classes/class-block-list/class-block-list.comp";
import { ClassExerciseProgress } from "@/components/platform/sections/teacher/classes/class-exercise-progress/class-exercise-progress.comp";
import { ExerciseReviewBar } from "@/components/platform/sections/staff/exercises/exercise-review-bar/exercise-review-bar.comp";
import { SeriesPublishSwitch } from "@/components/platform/sections/staff/exercises/series-publish-switch/series-publish-switch.comp";
import { AddLibraryExercisesButton } from "@/components/platform/sections/staff/courses/add-library-exercises-popup/add-library-exercises-popup.comp";
import { PracticeFilters } from "@/components/platform/sections/exercises/practice-filters/practice-filters.comp";
import { TopicButton } from "@/components/platform/sections/teacher/classes/topic-popup/topic-popup.comp";
import { FinalizeClassButton } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.comp";
import { MeetingCountdown } from "@/components/platform/shared/meeting-countdown/meeting-countdown.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PaymentCard } from "@/components/platform/sections/staff/payments/payment-card/payment-card.comp";
import { popupFormDone } from "@/services/shared/form-state";
import type { StaffPaymentView } from "@/services/staff-payments/staff-payments.types";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_PHASE,
} from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  STUDENT_BALANCE,
  STUDENT_PAST_CARD,
  STUDENT_WHATSAPP,
  studentCard,
  studentDetail,
  studentJoin,
} from "@/lib/testing/fixtures/student-classes";
import { SyllabusList } from "@/components/platform/sections/staff/courses/syllabus-list/syllabus-list.comp";
import { TempPasswordNotice } from "@/components/platform/sections/staff/students/temp-password-notice.comp";
import { NewStudyForm } from "@/components/platform/sections/studies/studies-list/new-study/new-study-form.comp";
import { ActivityList } from "@/components/platform/shared/activity-list/activity-list.comp";
import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";
import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { GameFields } from "@/components/platform/shared/game-fields/game-fields.comp";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";
import { OptionalMark } from "@/components/platform/shared/optional-mark/optional-mark.comp";
import { GameList } from "@/components/platform/shared/game-list/game-list.comp";
import { GameSettings } from "@/components/platform/shared/game-settings/game-settings.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformError } from "@/components/platform/shared/platform-error/platform-error.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator/progress-indicator.comp";
import { StudyStreak } from "@/components/platform/shared/study-streak/study-streak.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { buildPlatformApps } from "@/constants/platform/nav-items.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { gameMoves } from "@/lib/chess/game-moves";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import {
  FIXTURE_BOT,
  FIXTURE_STUDENT,
  FIXTURE_TEAM_BOT,
  fixtureBotView,
  fixturePlayedGames,
} from "@/lib/testing/fixtures/bots";
import { staffRoutes } from "@/lib/platform-routes";
import { ADVENTURE_ART, COMING_ADVENTURES } from "@/lib/adventure/adventures";
import { CUADERNO_DEL_VIAJERO } from "@/lib/adventure/adventures/cuaderno-del-viajero";
import { fixtureAdventureProgress } from "@/lib/testing/fixtures/adventure";
import { readTokens, type Theme, tokenContrast } from "@/lib/platform-tokens";
import type { CourseLevelItem } from "@/services/courses/courses.types";
import { formatEloRange } from "@/services/courses/level-rules";
import type { DashboardStats } from "@/services/dashboard/dashboard.types";
import { GAME_ORIGIN } from "@/services/shared/game-origin";
import "@/components/platform/sections/courses/lesson-view/lesson-outline.comp.css";
import "@/components/platform/sections/staff/courses/course-sources/course-source-dialog.comp.css";
import "@/components/platform/sections/staff/courses/new-course/new-course.comp.css";
import "@/components/platform/sections/studies/studies-list/new-study/new-study.comp.css";
import "./overview.css";

/**
 * A tile, drawn as a frame on a design canvas: the piece's name, its size and
 * a link to its Docs page above, and below them the frame, of a fixed width
 * and height, filled with the page's background, with the piece in it. A
 * piece that in the app lives inside a white panel or bar, and writes its
 * quieter text in the grey made for white, is given that `surface`.
 */
/** The exercise editor's tile: a new exercise on the standard start. */
const OVERVIEW_NEW_EXERCISE: ComponentProps<typeof ExerciseAuthoring>["exercise"] = {
  id: null,
  statusCode: null,
  solutionPgn: '[SetUp "1"]\n[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]\n\n*',
  kind: "SEQUENCE",
  mateIn: null,
  title: "",
  prompt: null,
  difficulty: 1200,
  topicCodes: [],
  hints: [],
  explanation: null,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  sourceGameId: null,
};

const OVERVIEW_EXERCISE_CATALOGS: ComponentProps<typeof ExerciseAuthoring>["catalogs"] = {
  kinds: [
    { code: "SEQUENCE", label: "Secuencia" },
    { code: "MATE_IN", label: "Mate en N" },
  ],
  topics: [
    { code: "TACTICS", label: "Táctica", parentCode: null },
    { code: "FORK", label: "Ataque doble", parentCode: "TACTICS" },
  ],
  levels: [{ slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true }],
};

/** Opens the settings panel for the sheet: it is drawn only while the root says so. */
function OpenSettings() {
  if (typeof document !== "undefined") document.documentElement.setAttribute(SETTINGS_ATTRIBUTE, "open");
  return null;
}

function Tile({
  name,
  docs,
  width,
  height,
  surface = false,
  children,
}: {
  name: string;
  docs: string;
  /** The frame's size in px, fixed: what the piece shows has to fit in it. */
  width: number;
  height: number;
  surface?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="overview__tile" style={{ width }} aria-label={name}>
      <div className="overview__tile-head">
        <h3 className="overview__tile-name">{name}</h3>
        <span className="overview__tile-size">
          {width} × {height}
        </span>
        {/* `_top`: the link leaves the preview's frame and opens the page in Storybook itself. */}
        <a className="overview__tile-link" href={`./?path=/docs/${docs}--docs`} target="_top">
          Docs →
        </a>
      </div>
      <div className="overview__frame" style={{ height }}>
        {surface ? <div className="overview__surface">{children}</div> : children}
      </div>
    </section>
  );
}

/** A group of frames on the canvas, under its name, as a section of a design file. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overview__section" aria-label={title}>
      <h2 className="overview__section-title">{title}</h2>
      <div className="overview__frames">{children}</div>
    </section>
  );
}

/** The class every tile of the classes' pieces shows: the Najdorf of the demo, today at noon, with its link open. */
const OVERVIEW_CLASS_ROW: ClassRowData = {
  id: "c2",
  href: "/administracion/clases/c2",
  title: "Repaso de la Najdorf: tus dudas",
  phase: CLASS_PHASE.OPEN,
  startIso: cdmx("2026-10-14", "12:00").toISOString(),
  durationMin: 60,
  timeZone: CLASSES_TIME_ZONE,
  nowIso: CLASSES_NOW.toISOString(),
  people: "GM Profesor Demo · Alumno Demo · Individual",
  chips: [{ label: "Sin enlace", icon: "no-link", tone: "warning" }],
  action: { kind: "link", label: "Agregar enlace", href: "/administracion/clases/c2" },
};

/** The October payment of the demo, for the payments' tiles. */
const OVERVIEW_PAYMENT: StaffPaymentView = {
  id: "pay-1",
  paidOnIso: "2026-10-01T00:00:00.000Z",
  paidOnLabel: "jue 1 oct 2026",
  amount: "1400.00",
  currencyCode: "MXN",
  amountLabel: "$1,400.00 MXN",
  perClassLabel: "$350.00 por clase",
  classCount: 4,
  reference: "Transferencia 8841",
  note: null,
  recordedByName: "Staff Demo",
  seats: [
    {
      classId: "c1",
      href: "/administracion/clases/c1",
      ordinal: 1,
      title: "Ataques al rey en el centro",
      startIso: cdmx("2026-10-07", "12:00").toISOString(),
      durationMin: 60,
      phase: CLASS_PHASE.DONE,
      attended: true,
      isGroup: false,
    },
    {
      classId: "c2",
      href: "/administracion/clases/c2",
      ordinal: 2,
      title: "Repaso de la Najdorf: tus dudas",
      startIso: cdmx("2026-10-14", "12:00").toISOString(),
      durationMin: 60,
      phase: CLASS_PHASE.OPEN,
      attended: null,
      isGroup: false,
    },
  ],
  taken: 1,
  scheduled: 1,
  toSchedule: 2,
  returned: 0,
  allTaken: false,
  canDelete: false,
  deleteReason: "Este pago ya cubre clases dadas: corrígelo con «Editar pago».",
  seatsLeftUnpaid: 2,
  minClassCount: 2,
};
const OVERVIEW_TEACHERS = [{ id: "t-1", displayName: "GM Profesor Demo" }];
const OVERVIEW_RHYTHM = { teacherId: "t-1", firstDate: "2026-10-21", time: "12:00", durationMin: 60 };
const OVERVIEW_STUDENTS = [
  {
    id: "u-d",
    displayName: "Alumno Demo",
    email: "alumno.demo@365diasdeajedrez.com",
    teacherId: "t-1",
    teacherName: "GM Profesor Demo",
    toSchedule: 2,
    oldestPaymentLabel: "pago del jue 1 oct",
    hasPayments: true,
  },
  {
    id: "u-l",
    displayName: "Lucía Herrera",
    email: "lucia.herrera@ejemplo.com",
    teacherId: null,
    teacherName: null,
    toSchedule: 0,
    oldestPaymentLabel: null,
    hasPayments: false,
  },
];
const OVERVIEW_MEETING = {
  meetingUrl: null,
  visibleFromIso: null,
  startIso: cdmx("2026-10-14", "17:00").toISOString(),
  durationMin: 60,
};
const OVERVIEW_CLASS = {
  id: "c4",
  title: "Clase de Valentina Cruz",
  startIso: cdmx("2026-10-14", "19:00").toISOString(),
  durationMin: 60,
  timeZone: CLASSES_TIME_ZONE,
  nowIso: CLASSES_NOW.toISOString(),
  teacher: { id: "t-1", displayName: "GM Profesor Demo", isActive: true },
};
const OVERVIEW_SEAT_ACTIONS = {
  removeClassParticipant: async () => undefined,
  changeAttendanceAsStaff: async () => popupFormDone("attendanceChanged", ["u-v"]),
  rescheduleStudentSeat: async () => popupFormDone("seatRescheduled", [29_900_000, 60]),
  registerPayment: async () => popupFormDone("paymentRegistered", [1, 1, 0]),
  loadPaymentContext: async () => null,
  loadTeacherBusy: async () => [],
};
const OVERVIEW_JOIN = {
  phase: CLASS_PHASE.OPEN,
  meetingUrl: "https://zoom.us/j/11111111111",
  hasLink: true,
  providerLabel: "Zoom",
  startIso: cdmx("2026-10-14", "12:00").toISOString(),
  endIso: cdmx("2026-10-14", "13:00").toISOString(),
  visibleFromIso: cdmx("2026-10-14", "11:30").toISOString(),
  untilIso: cdmx("2026-10-14", "13:30").toISOString(),
  nowIso: CLASSES_NOW.toISOString(),
  timeZone: CLASSES_TIME_ZONE,
};
const OVERVIEW_FINALIZE = {
  classId: "c6",
  classTitle: "Defensa Caro-Kann: ideas",
  whenLine: "lun 12 oct · 17:00–18:00 · Diego Salas",
  isGroup: false,
  teacherName: "GM Profesor Demo",
  students: [{ id: "u-s", displayName: "Diego Salas", mark: { attended: null } }],
  summary: null,
  recordingUrl: null,
};
const OVERVIEW_PGN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *";
/** What an exercise block or a series may pick from: two of the demo teacher's exercises. */
const OVERVIEW_PICKABLE = [
  { id: "ex000001", title: "Mate del pasillo", facts: "Mate en 1 · 900", topics: "Táctica" },
  { id: "ex000002", title: "El mate de Philidor", facts: "Mate en 2 · 1400", topics: "Táctica" },
];

/** A host for the exercise picker's tile: it keeps the ticked set, one of them no longer pickable. */
function ExercisePickerHost() {
  const [chosen, setChosen] = useState<string[]>(["ex000002", "ex000009"]);
  return (
    <ExercisePicker
      name="exercises"
      exercises={OVERVIEW_PICKABLE}
      unavailable={[{ id: "ex000009", title: "El molino", facts: "Secuencia · 1500", topics: "Táctica" }]}
      value={chosen}
      onValueChange={setChosen}
      label="Ejercicios"
    />
  );
}

/** A host for the block popup's tile: a button that opens it. */
function BlockPopupTrigger() {
  const popup = useRef<BlockPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button"
        onClick={(event) =>
          popup.current?.open(event, { kind: CLASS_BLOCK_KIND.TEXT, visibility: CLASS_BLOCK_VISIBILITY.BEFORE })
        }
      >
        Agregar un bloque
      </button>
      <BlockPopup
        ref={popup}
        classId="c2"
        options={{ games: [], exercises: OVERVIEW_PICKABLE }}
        groupSize={1}
        endHour="13:00"
        studentLabel="Alumno Demo"
        addClassBlock={async () => popupFormDone("blockAdded")}
        updateClassBlock={async () => popupFormDone("blockSaved")}
        fetchReferencePgn={async () => OVERVIEW_PGN}
      />
    </>
  );
}
const OVERVIEW_PAYMENT_ACTIONS = {
  scheduleSeat: async () => popupFormDone("seatScheduled", [0, 60]),
  deletePayment: async () => undefined,
  updatePayment: async () => popupFormDone("paymentUpdated"),
  registerPayment: async () => popupFormDone("paymentRegistered", [4, 3, 1]),
  loadPaymentContext: async () => null,
  loadTeacherBusy: async () => [],
};

const SWATCHES = [
  "accent",
  "accent-soft",
  "text",
  "text-muted",
  "surface",
  "bg",
  "success-ink",
  "danger",
  "warning-ink",
  "progress",
];

const TYPE_SAMPLE = [
  "--platform-type-2xs",
  "--platform-type-sm",
  "--platform-type-lg",
  "--platform-type-xl",
  "--platform-type-2xl",
  "--platform-type-3xl",
];

const SPACE_SAMPLE = [
  "--platform-space-1",
  "--platform-space-2",
  "--platform-space-3",
  "--platform-space-4",
  "--platform-space-6",
  "--platform-space-8",
  "--platform-space-12",
];

const LEVELS = [
  { value: "inicial", label: "Inicial" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

/** Stands in for a server action: it settles at once, so nothing is left pending. */
const settles = async () => {};

const RESULTS = [
  { code: GAME_RESULT.WHITE_WINS, label: "1-0" },
  { code: GAME_RESULT.BLACK_WINS, label: "0-1" },
  { code: GAME_RESULT.DRAW, label: "1/2-1/2" },
  { code: GAME_RESULT.ONGOING, label: "*" },
];

const LUCENA = "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1";

/** The opening of the Opera game, as a list of lessons shows a game: what MoveLinePreview previews. */
const OVERVIEW_LINE = gameMoves("1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 1-0")!;

/**
 * The address the sheet is drawn at: a staff member on a course's syllabus, so
 * the staff menu lights «Cursos» and the record's tabs light «Temario». The
 * pieces that light what matches the address read this one.
 */
const SHEET_PATH = staffRoutes.courseSyllabus("4812");

/** Every icon but the wordmark, which paints nothing without the site's logo around it (see its gallery). */
const ICONS = [
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowRightArrowLeftIcon,
  CalendarIcon,
  CaretRightIcon,
  CheckIcon,
  AngleRightIcon,
  CircleCheckIcon,
  ClipboardIcon,
  XmarkIcon,
  ArrowRightFromBracketIcon,
  FireIcon,
  ArrowsRotateIcon,
  ExpandIcon,
  SlidersIcon,
  GripDotsVerticalIcon,
  HeartIcon,
  ImageIcon,
  CircleInfoIcon,
  ForwardStepIcon,
  BackwardStepIcon,
  LogoMarkIcon,
  BarsIcon,
  MoonIcon,
  EllipsisIcon,
  CommentIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightToLineIcon,
  VolumeXmarkIcon,
  VolumeLowIcon,
  TrashCanIcon,
  UserIcon,
  WhatsappIcon,
];

/** Morphy against the Duke of Brunswick and Count Isouard, Paris 1858: the "Opera game", in the public domain. */
const OPERA_GAME =
  "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0";

/** The Opera game's opening, annotated: a comment, a sign and a variation. */
const OPERA_OPENING =
  "1. e4 e5 2. Nf3 d6 { La defensa Philidor: sólida, pero pasiva. } 3. d4 Bg4 $6 { Clava el caballo, pero entrega la pareja de alfiles. } ( 3... exd4 4. Nxd4 Nf6 ) 4. dxe5 Bxf3 5. Qxf3 dxe5 *";
const OPERA_OPENING_TREE = parsePgnTree(OPERA_OPENING);

/**
 * The same game with the engine's reading after every move, as a review
 * leaves it in the PGN: the figures were taken from the bundled engine.
 */
const OPERA_REVIEWED =
  "{ [%eval 0.35] } 1. e4 { [%eval 0.30] } e5 { [%eval 0.30] } 2. Nf3 { [%eval 0.43] } d6 { [%eval 0.49] } 3. d4 { [%eval 0.59] } Bg4 { [%eval 0.88] } 4. dxe5 { [%eval 0.89] } Bxf3 { [%eval 1.45] } 5. Qxf3 { [%eval 1.25] } dxe5 { [%eval 1.24] } 6. Bc4 { [%eval 1.14] } Nf6 { [%eval 2.23] } 7. Qb3 { [%eval 2.30] } Qe7 { [%eval 2.02] } 8. Nc3 { [%eval 1.93] } c6 { [%eval 1.78] } 9. Bg5 { [%eval 1.91] } b5 { [%eval 2.61] } 10. Nxb5 { [%eval 2.52] } cxb5 { [%eval 4.62] } 11. Bxb5+ { [%eval 4.84] } Nbd7 { [%eval 5.02] } 12. O-O-O { [%eval 5.17] } Rd8 { [%eval 5.50] } 13. Rxd7 { [%eval 5.59] } Rxd7 { [%eval 5.98] } 14. Rd1 { [%eval 6.03] } Qe6 { [%eval 8.02] } 15. Bxd7+ { [%eval 3.08] } Nxd7 { [%eval #2] } 16. Qb8+ { [%eval #1] } Nxb8 { [%eval #1] } 17. Rd8# { [%eval #1] } 1-0";

/** The six levels as the seed writes them. */
const LEVEL_SCALE: CourseLevelItem[] = (
  [
    ["iniciacion", "Iniciación", 0, 799],
    ["principiante", "Principiante", 800, 1199],
    ["intermedio", "Intermedio", 1200, 1599],
    ["avanzado", "Avanzado", 1600, 1999],
    ["experto", "Experto", 2000, 2199],
    ["maestro", "Maestro", 2200, null],
  ] as const
).map(([slug, name, eloMin, eloMax]) => ({
  slug,
  name,
  description: "",
  eloRange: formatEloRange({ eloMin, eloMax }),
  eloMin,
  eloMax,
}));

/** A student's counts for one period of the dashboard's statistics. */
const statsRange = (counts: number[], topics: [string, number][]) => ({
  totals: [
    "Lecciones completadas",
    "Cursos completados",
    "Clases asistidas",
    "Partidas analizadas",
    "Ejercicios superados",
  ].map((label, index) => ({ label, count: counts[index] ?? 0 })),
  topics: topics.map(([label, count]) => ({ label, count })),
});

const STATS: DashboardStats = {
  week: statsRange(
    [4, 0, 1, 2, 7],
    [
      ["Táctica", 6],
      ["Finales", 3],
      ["Aperturas", 2],
    ],
  ),
  month: statsRange(
    [15, 1, 4, 6, 23],
    [
      ["Táctica", 18],
      ["Finales", 9],
      ["Aperturas", 7],
    ],
  ),
  year: statsRange(
    [112, 3, 31, 40, 186],
    [
      ["Táctica", 131],
      ["Finales", 74],
      ["Aperturas", 58],
    ],
  ),
  all: statsRange(
    [148, 4, 39, 52, 241],
    [
      ["Táctica", 170],
      ["Finales", 96],
      ["Aperturas", 77],
    ],
  ),
};

/** A day and a bit from when the sheet loads: the props take no clock, so the countdown runs on the real one. */

/** The tokens of platform.css, read the way the foundations read them. */
const TOKENS = readTokens(PLATFORM_CSS);

/** A token's full name from the short one the pairs are written with. */
const tokenName = (name: string) => ["--platform", name].join("-");

/** A few of the pairs the contrast rule allows, as token names without `--platform-`. */
const PAIRS = [
  ["text", "surface"],
  ["text-muted", "bg"],
  ["accent-ink", "accent-soft"],
  ["success-ink", "success-soft"],
] as const;

const LG = "--platform-type-lg";
const LG_PX = TYPE_STEPS.find(({ token }) => token === LG)?.px;

/** A piece of a screen drawn at whichever scale its custom properties set. */
function ScaleSample({ label, px, style }: { label: string; px: number | undefined; style?: CSSProperties }) {
  return (
    <div className="overview__stack" style={style}>
      <span className="overview__caption">{label}</span>
      <span style={{ fontSize: `var(${LG})` }}>Siguiente lección · {px}px</span>
      <button type="button" className="platform-button platform-button_size_sm">
        Aprender
      </button>
    </div>
  );
}

/** Plays the page's entrance again: `.platform-page` animates every time it mounts. */
function MotionReplay() {
  const [plays, setPlays] = useState(0);
  return (
    <div className="overview__stack">
      <div key={plays} className="platform-page">
        <span className="platform-tag platform-tag_variant_accent">Entrada de una página · 220 ms</span>
      </div>
      <span className="overview__caption">Un menú entra en 160 ms y sale en 120; un diálogo, 160 y 200.</span>
      <div>
        <button
          type="button"
          className="platform-button platform-button_size_sm"
          onClick={() => setPlays((count) => count + 1)}
        >
          Reproducir
        </button>
      </div>
    </div>
  );
}

/**
 * A section's form in its own popup, opened by the button its screen shows:
 * the wrapper's block, the popup's name and width, and a fresh form on every
 * closing, as the section mounts it — with a stub in place of the server
 * action.
 */
function SectionDialog({
  block,
  label,
  buttonClassName,
  title,
  size,
  form,
}: {
  block: string;
  label: string;
  buttonClassName: string;
  title: string;
  size: "sm" | "md" | "lg";
  form: (close: () => void) => ReactNode;
}) {
  // The handle is kept in state, not in a ref: the form is handed its close
  // while rendering, and a ref is not read during a render.
  const [popup, setPopup] = useState<PlatformPopupHandle | null>(null);
  const [opening, setOpening] = useState(0);
  const close = () => popup?.close();
  return (
    <div className={block}>
      <button type="button" className={buttonClassName} onClick={(event) => popup?.open(event)}>
        {label}
      </button>
      <PlatformPopup ref={setPopup} title={title} size={size} onClose={() => setOpening((count) => count + 1)}>
        <Fragment key={opening}>{form(close)}</Fragment>
      </PlatformPopup>
    </div>
  );
}

/**
 * The move menu behind a trigger. Mounted open, it would take the focus as it
 * mounts and the sheet would scroll down to it on load. `contain: layout`
 * makes the box the containing block of the menu, which is `position: fixed`.
 */
function MoveMenuTile() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="overview__menu-frame">
      <button type="button" className="platform-button platform-button_size_sm" onClick={() => setOpen(true)}>
        Abrir el menú de 8. Dxb7
      </button>
      {open && (
        <MoveContextMenu
          target={{ path: "0.1", x: 0, y: 48, label: "8. Dxb7", canPromote: true, canPromoteOneStep: true }}
          onPromoteOneStep={close}
          onPromoteToMainLine={close}
          onComment={close}
          onAnnotate={close}
          onCopyVariation={async () => {}}
          createExerciseHref="#"
          onDelete={close}
          onClose={close}
        />
      )}
    </div>
  );
}

function PopupTrigger() {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        Abrir el popup
      </button>
      <PlatformPopup ref={popup} title="Un popup de la plataforma" size="sm">
        <div className="overview__stack" style={{ padding: "var(--platform-space-6)" }}>
          <p style={{ margin: 0 }}>Lo que hay bajo la franja es del contenido.</p>
          <button
            type="button"
            className="platform-button platform-button_variant_ink"
            onClick={() => popup.current?.close()}
          >
            Cerrar
          </button>
        </div>
      </PlatformPopup>
    </>
  );
}

/** The teacher's tools, as the shell builds them with everything on. */
const TEACHER_APPS = buildPlatformApps(
  { isTeacher: true, isStaff: false },
  { play: true, analysisBoard: true, trainer: true, exercises: "all" },
);

/** The instant the profile's examples are read from, so «hace 5 horas» stays the same. */
const PROFILE_NOW = new Date("2026-10-08T18:00:00Z");

/** A level that climbed over six games, for the profile's tiles. */
const LEVEL_SERIES = [800, 825, 825, 850, 850, 875].map((level, index) => ({
  at: new Date(Date.UTC(2026, 8, index + 1)),
  level,
}));

/** «Guardar en un estudio» and its popup, as a played game and the analysis board mount them. */
function SaveToStudyTrigger() {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        Guardar en un estudio
      </button>
      <SaveToStudyPopup
        ref={popup}
        studies={[{ id: "demoAtaq", name: "Estudio: ataques al rey" }]}
        defaultTitle="Análisis"
        action={() => popup.current?.close()}
        onCancel={() => popup.current?.close()}
      />
    </>
  );
}

/** «Abandonar» and the popup it opens, as a game against a bot mounts them. */
function AbandonTrigger() {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_danger platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        Abandonar
      </button>
      <AbandonPopup
        ref={popup}
        onAbandon={async () => popup.current?.close()}
        onCancel={() => popup.current?.close()}
      />
    </>
  );
}

/** The confirmation, stacked over a popup: the red word at the popup's foot opens it. */
function ConfirmTrigger() {
  const popup = useRef<PlatformPopupHandle>(null);
  const confirm = useRef<PlatformConfirmPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_size_sm"
        onClick={(event) => popup.current?.open(event)}
      >
        Editar el estudio
      </button>
      <PlatformPopup ref={popup} title="Editar el estudio" size="sm">
        <div className="overview__stack" style={{ padding: "var(--platform-space-6)" }}>
          <p style={{ margin: 0 }}>Un formulario, y al pie lo que destruye.</p>
          <button
            type="button"
            className="platform-row-action platform-row-action_variant_danger"
            onClick={() => confirm.current?.open()}
          >
            Eliminar estudio
          </button>
        </div>
      </PlatformPopup>
      <PlatformConfirmPopup
        ref={confirm}
        subject="Finales de torres"
        description="Se elimina el estudio con sus 12 partidas, y con ellas sus variantes, comentarios y flechas."
        acknowledgement={{ name: "confirmDelete", label: "Entiendo que se eliminará todo y que no se puede deshacer." }}
        action={settles}
        confirmLabel="Eliminar estudio"
        onDone={() => popup.current?.close()}
      />
    </>
  );
}

function OverviewPage({ schemeChoice }: { schemeChoice: unknown }) {
  const scheme: Theme = useSchemeOnScreen(schemeChoice);
  return (
    <div className="platform-page overview">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Overview</h1>
        <p className="platform-page__subtitle">Every piece of the platform at a glance, each linked to its own page.</p>
      </header>

      {/* The canvas of a design file: it scrolls both ways inside the window,
          and the sections are laid on it side by side and one under another. */}
      <div className="overview__canvas">
        <div className="overview__board">
          <Section title="Foundations">
            <Tile name="Colours" docs="platform-foundations-colours" width={400} height={136}>
              <div className="overview__row">
                {SWATCHES.map((token) => (
                  <span
                    key={token}
                    className="overview__swatch"
                    title={token}
                    style={{ background: `var(--platform-${token})` }}
                  />
                ))}
              </div>
            </Tile>
            <Tile name="Type" docs="platform-foundations-type" width={400} height={200}>
              <div className="overview__stack">
                <span className="overview__font overview__font_family_display">365 días de ajedrez</span>
                <span className="overview__caption">--platform-font-display · Poppins</span>
                <span className="overview__font">Siguiente lección</span>
                <span className="overview__caption">--platform-font · SF Pro</span>
              </div>
            </Tile>
            <Tile name="Type scale" docs="platform-foundations-type-scale" width={400} height={304}>
              <div className="overview__stack">
                {TYPE_SAMPLE.map((token) => (
                  <span key={token} style={{ fontSize: `var(${token})` }}>
                    Siguiente lección · {token.split("-").pop()}
                  </span>
                ))}
              </div>
            </Tile>
            <Tile name="Spacing scale" docs="platform-foundations-spacing-scale" width={400} height={272}>
              <div className="overview__stack">
                {SPACE_SAMPLE.map((token) => (
                  <span key={token} className="overview__space">
                    <code className="overview__space-name">{token.split("-").pop()}</code>
                    <span className="overview__bar" style={{ width: `var(${token})` }} />
                  </span>
                ))}
              </div>
            </Tile>
            <Tile name="Corners" docs="platform-foundations-corners" width={400} height={176}>
              <div className="overview__row overview__row_align_end">
                <span className="overview__corner overview__corner_radius_8">8px</span>
                <span className="overview__corner overview__corner_radius_4" aria-hidden="true" />
                <span className="overview__corner overview__corner_radius_full">completo</span>
              </div>
              <span className="overview__caption">
                8px casi todo · 4px un control de 20px o menos · completo una píldora
              </span>
            </Tile>
            <Tile name="Text on a surface" docs="platform-foundations-text-on-a-surface" width={400} height={248}>
              <div className="overview__stack">
                {PAIRS.map(([text, background]) => (
                  <span
                    key={`${text}/${background}`}
                    className="overview__pair"
                    style={{ color: `var(--platform-${text})`, background: `var(--platform-${background})` }}
                  >
                    <span>
                      {text} sobre {background}
                    </span>
                    <span>{tokenContrast(TOKENS, tokenName(text), tokenName(background), scheme).toFixed(1)}:1</span>
                  </span>
                ))}
              </div>
            </Tile>
            <Tile name="Motion" docs="platform-foundations-motion" width={400} height={200}>
              <MotionReplay />
            </Tile>
            <Tile name="Large screens" docs="platform-foundations-large-screens" width={400} height={296}>
              <div className="overview__row overview__row_align_start">
                <ScaleSample label="Hasta 1535px" px={LG_PX} />
                <ScaleSample
                  label="Desde 1536px"
                  px={FROM_2XL[LG] ?? LG_PX}
                  style={FROM_2XL_PROPERTIES as CSSProperties}
                />
              </div>
            </Tile>
          </Section>

          <Section title="Icons">
            <Tile name="Icon gallery" docs="icons-gallery" width={400} height={168}>
              <div className="overview__row overview__icons">
                {ICONS.map((Icon) => (
                  <Icon key={Icon.name} className="overview__icon" />
                ))}
              </div>
            </Tile>
            <Tile name="ChessMoveQualityIcon" docs="chess-chessmovequalityicon" width={400} height={88}>
              <div className="overview__row">
                {Object.entries(ChessMoveQualityIcon).map(([quality, Badge]) => (
                  <Badge key={quality} />
                ))}
              </div>
            </Tile>
          </Section>

          <Section title="Layout">
            <Tile name="Page" docs="platform-primitives-page" width={400} height={184}>
              <div className="platform-page__head">
                {/* A paragraph, not a second h1: the display font is what the shell gives every h1. */}
                <p className="platform-page__title overview__page-title">Mis cursos</p>
                <p className="platform-page__subtitle">Continúa donde lo dejaste.</p>
              </div>
            </Tile>
            <Tile name="Card" docs="platform-primitives-card" width={400} height={224}>
              <section className="platform-card" aria-label="Continuar">
                <h4 className="platform-card__title">Continuar</h4>
                <p className="overview__text">Finales de torres · Lección 3: el puente de Lucena</p>
              </section>
            </Tile>
            <Tile name="StaffPanel" docs="platform-sections-staff-courses-staffpanel" width={400} height={400}>
              <StaffPanel
                title="Colección de partidas"
                meta="2"
                description="Las lecciones de este capítulo eligen de aquí."
              >
                <ul className="overview__list">
                  <li className="overview__list-item">
                    <strong>Morphy – Duque de Brunswick y conde Isouard</strong>
                    <span className="overview__caption">París 1858 · 17 jugadas</span>
                  </li>
                  <li className="overview__list-item">
                    <strong>Anderssen – Kieseritzky</strong>
                    <span className="overview__caption">Londres 1851 · 23 jugadas</span>
                  </li>
                </ul>
              </StaffPanel>
            </Tile>
            <Tile
              name="StaffEditorHead"
              docs="platform-sections-staff-courses-staffeditorhead"
              width={880}
              height={192}
            >
              <StaffEditorHead
                title="Fundamentos de la Defensa Siciliana"
                badge={<span className="platform-tag platform-tag_variant_accent">Publicado</span>}
                actions={
                  <Link href="/cursos/fundamentos-de-la-siciliana" className="platform-button">
                    Ver en la plataforma
                  </Link>
                }
              />
            </Tile>
          </Section>

          <Section title="Actions">
            <Tile name="Button" docs="platform-primitives-button" width={400} height={240}>
              <div className="overview__row">
                <button type="button" className="platform-button">
                  Cancelar
                </button>
                <button type="button" className="platform-button platform-button_variant_accent">
                  Aprender
                </button>
                <button type="button" className="platform-button platform-button_variant_ink">
                  Crear
                </button>
                <button type="button" className="platform-button platform-button_variant_danger">
                  Eliminar
                </button>
                <button type="button" className="platform-button platform-button_size_sm">
                  Gestionar
                </button>
                <button type="button" className="platform-button" disabled>
                  Deshabilitado
                </button>
              </div>
            </Tile>
            <Tile name="SubmitButton" docs="platform-shared-submitbutton" width={400} height={120}>
              <form action={settles}>
                <SubmitButton pendingLabel="Creando…">Crear estudio</SubmitButton>
              </form>
            </Tile>
            <Tile name="RowAction" docs="platform-primitives-rowaction" width={400} height={88}>
              <div className="overview__row">
                <button type="button" className="platform-row-action">
                  Editar
                </button>
                <button type="button" className="platform-row-action">
                  Quitar
                </button>
                <button type="button" className="platform-row-action platform-row-action_variant_danger">
                  Eliminar
                </button>
                <button type="button" className="platform-row-action" disabled>
                  Deshabilitado
                </button>
              </div>
            </Tile>
            <Tile name="Tag" docs="platform-primitives-tag" width={400} height={96}>
              <div className="overview__row">
                <span className="platform-tag">Sólo lectura</span>
                <span className="platform-tag platform-tag_variant_accent">Desactualizado</span>
                <span className="platform-tag platform-tag_variant_warning">Por finalizar</span>
                <span className="platform-tag platform-tag_variant_success">Finalizada</span>
                <span className="platform-tag platform-tag_variant_wash">Enlace abierto</span>
                <span className="platform-tag platform-tag_variant_live">En vivo</span>
              </div>
            </Tile>
          </Section>

          <Section title="Forms">
            <Tile name="PlatformForm" docs="platform-shared-platformform" width={400} height={344}>
              <PlatformForm onSubmit={(event) => event.preventDefault()}>
                <PlatformFormField
                  name="name"
                  label="Nombre"
                  messages={{ valueMissing: "Ponle un nombre al estudio." }}
                >
                  <input type="text" maxLength={120} required placeholder="Nacional Abierto 2026" />
                </PlatformFormField>
                <PlatformFormField
                  name="description"
                  label="Descripción"
                  serverError="Ya tienes un estudio con ese nombre."
                >
                  <textarea maxLength={500} rows={2} defaultValue="Las partidas del torneo" />
                </PlatformFormField>
              </PlatformForm>
            </Tile>
            <Tile name="PlatformSelect" docs="platform-shared-platformselect" width={400} height={168}>
              <div className="overview__stack">
                <PlatformSelect aria-label="Nivel" defaultValue="intermedio" options={LEVELS} />
                <PlatformSelect
                  aria-label="Lección"
                  emptyOption="Ninguna"
                  defaultValue=""
                  groups={[
                    {
                      label: "Finales de torres",
                      options: [
                        { value: "lucena", label: "La posición de Lucena" },
                        { value: "philidor", label: "La posición de Philidor" },
                      ],
                    },
                  ]}
                />
              </div>
            </Tile>
            <Tile name="PlatformDatePicker" docs="platform-shared-platformdatepicker" width={400} height={168}>
              <div className="overview__stack">
                <PlatformDatePicker name="playedAt" aria-label="Fecha de la partida" defaultValue="2026-10-02" />
                <PlatformDatePicker name="startsOn" aria-label="Fecha de inicio" />
              </div>
            </Tile>
            <Tile name="PlatformChoiceCards" docs="platform-shared-platformchoicecards" width={400} height={192}>
              <PlatformChoiceCards
                name="kind"
                aria-label="Tipo de estudio"
                defaultValue="STUDY"
                options={[
                  { value: "STUDY", label: "Estudio", description: "Partidas que analizas." },
                  { value: "TOURNAMENT", label: "Torneo", description: "Las de una competición." },
                ]}
              />
            </Tile>
            <Tile name="PlatformCheckCards" docs="platform-shared-platformcheckcards" width={400} height={280}>
              <PlatformCheckCards
                name="topics"
                aria-label="Temas"
                layout="line"
                defaultValue={["TACTICS", "FORK"]}
                options={[
                  { value: "TACTICS", label: "Táctica" },
                  { value: "ENDGAME", label: "Finales" },
                ]}
                groups={[
                  {
                    label: "Táctica",
                    options: [
                      { value: "FORK", label: "Ataque doble" },
                      { value: "PIN", label: "Clavada" },
                      { value: "SKEWER", label: "Enfilada" },
                      { value: "SACRIFICE", label: "Sacrificio" },
                    ],
                  },
                ]}
              />
            </Tile>
            <Tile name="PlatformCheckbox" docs="platform-shared-platformcheckbox" width={400} height={152}>
              <div className="overview__stack">
                <PlatformCheckbox
                  name="isPriority"
                  defaultChecked
                  label="Lección de prioridad"
                  hint="Entra en el recorrido corto de quien estudia con poco tiempo."
                />
                <PlatformCheckbox name="isTrainable" label="Se puede entrenar de memoria" />
              </div>
            </Tile>
            <Tile name="PlatformSwitch" docs="platform-shared-platformswitch" width={400} height={168}>
              <div className="overview__stack">
                <PlatformSwitch label="Sólo lecciones de prioridad" defaultChecked />
                <PlatformSwitch label="Módulo de análisis" hint="Apagado, no gasta batería." />
              </div>
            </Tile>
            <Tile name="PlatformInfoTip" docs="platform-shared-platforminfotip" width={400} height={96}>
              <div className="overview__row">
                <span>Slug del curso</span>
                <PlatformInfoTip label="Sobre el slug" text="Se actualiza al cambiar el nombre." />
              </div>
            </Tile>
            <Tile name="OptionalMark" docs="platform-shared-optionalmark" width={400} height={96}>
              <div className="overview__row">
                <span>Biografía</span>
                <OptionalMark />
              </div>
            </Tile>
            <Tile name="OptionalFields" docs="platform-shared-optionalfields" width={400} height={264}>
              <PlatformForm onSubmit={(event) => event.preventDefault()}>
                <OptionalFields>
                  <PlatformFormField name="event" label="Evento">
                    <input type="text" defaultValue="Nacional Abierto 2026" />
                  </PlatformFormField>
                  <PlatformFormField name="round" label="Ronda">
                    <input type="text" />
                  </PlatformFormField>
                </OptionalFields>
              </PlatformForm>
            </Tile>
            <Tile name="GameFields" docs="platform-shared-gamefields" width={720} height={840}>
              <PlatformForm onSubmit={(event) => event.preventDefault()}>
                <GameFields
                  values={{
                    title: "Una inmortal en Wijk aan Zee",
                    white: "Kasparov, Garry",
                    whiteElo: 2812,
                    whiteTitle: "GM",
                    black: "Topalov, Veselin",
                    blackElo: 2700,
                    blackTitle: "GM",
                    resultCode: GAME_RESULT.WHITE_WINS,
                    playedAtValue: "1999-01-20",
                    event: "Hoogovens",
                  }}
                  results={RESULTS}
                  titleHint="Cómo identificas esta partida dentro del estudio."
                />
              </PlatformForm>
            </Tile>
          </Section>

          <Section title="Feedback">
            <Tile name="PlatformNotice" docs="platform-shared-platformnotice" width={400} height={264}>
              <div className="overview__stack">
                <PlatformNotice message="No se puede eliminar: el curso ya tiene alumnos." />
                <PlatformNotice message="Cuenta creada." variant="success" />
                <PlatformNotice message="Se importaron 498 de 500 partidas." variant="info" />
              </div>
            </Tile>
            <Tile name="EmptyState" docs="platform-shared-emptystate" width={400} height={280}>
              <EmptyState
                title="No tienes clases programadas"
                description="Cuando administración programe una clase contigo, aparecerá aquí."
                actionLabel="Ver mis clases"
                actionHref="/clases"
              />
            </Tile>
            {/* On the white it lives on: the figure's count is in the grey made for white. */}
            <Tile name="ProgressIndicator" docs="platform-shared-progressindicator" surface width={400} height={296}>
              <div className="overview__stack">
                <ProgressIndicator percent={43} detail="3 de 7 lecciones" />
                <ProgressIndicator percent={100} detail="7 de 7 lecciones" layout="stacked" />
                <ProgressIndicator percent={38} detail="9 de 24 lecciones" layout="figure" />
                <ProgressIndicator percent={100} detail="24 de 24 lecciones" layout="figure" tone="success" />
              </div>
            </Tile>
            <Tile name="BoardLoading" docs="platform-shared-boardloading" width={400} height={224}>
              <div className="overview__loading">
                <BoardLoading label="Preparando el tablero…" />
              </div>
            </Tile>
            <Tile name="BoardSkeleton" docs="platform-shared-boardskeleton" width={400} height={400}>
              <BoardSkeleton label="Cargando la partida" />
            </Tile>
            <Tile name="PlatformError" docs="platform-shared-platformerror" width={400} height={272}>
              <PlatformError retry={() => {}} digest="2817393054" />
            </Tile>
            <Tile
              name="TempPasswordNotice"
              docs="platform-sections-staff-students-temppasswordnotice"
              width={400}
              height={288}
            >
              <TempPasswordNotice password="q7Rm-2xKfV_9" message="Cuenta creada." />
            </Tile>
            <Tile
              name="LessonSkeleton"
              docs="platform-sections-courses-lesson-view-lessonskeleton"
              width={960}
              height={408}
            >
              {/* The numbers .lesson-frame hands the lesson's column, with a lower board ceiling for the sheet. */}
              <div
                style={
                  {
                    "--viewer-board-max": "280px",
                    "--viewer-column-gap": "var(--platform-space-6)",
                    "--viewer-panel-trim": "62px",
                  } as CSSProperties
                }
              >
                <LessonSkeleton />
              </div>
            </Tile>
            <Tile
              name="LessonPracticeList"
              docs="platform-sections-courses-lesson-view-lessonpracticelist"
              width={960}
              height={520}
            >
              <LessonPracticeList
                title="Finales de torre: práctica"
                badge="Prioritaria"
                description="Tres posiciones para fijar lo que viste en el capítulo."
                practice={{
                  total: 2,
                  solved: 1,
                  items: [
                    {
                      n: 1,
                      href: "#",
                      title: "El puente de Lucena",
                      facts: "Secuencia · 1200 · Intermedio",
                      startFen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
                      orientation: "white",
                      solved: true,
                    },
                    {
                      n: 2,
                      href: "#",
                      title: "La defensa Philidor",
                      facts: "Secuencia · 1100 · Principiante",
                      startFen: "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1",
                      orientation: "black",
                      solved: false,
                    },
                  ],
                  start: { href: "#", label: "Continuar" },
                }}
                onwards={{
                  skipHref: "#",
                  skipLabel: "Saltar",
                  finishLabel: "Continuar",
                  finish: async () => undefined,
                }}
              />
            </Tile>
          </Section>

          <Section title="Data">
            <Tile name="PlatformTable" docs="platform-shared-platformtable" width={400} height={360}>
              <div className="overview__stack">
                <PlatformTable label="Clases" columns={["Clase", { label: "Alumnos", align: "right" }]} minWidth={240}>
                  <PlatformTableRow>
                    <PlatformTableCell strong>Finales de torres</PlatformTableCell>
                    <PlatformTableCell align="right">6</PlatformTableCell>
                  </PlatformTableRow>
                  <PlatformTableRow>
                    <PlatformTableCell strong>La defensa siciliana</PlatformTableCell>
                    <PlatformTableCell align="right">8</PlatformTableCell>
                  </PlatformTableRow>
                </PlatformTable>
                <PlatformTable
                  label="Próximas clases"
                  columns={["Clase", { label: "Alumnos", align: "right" }]}
                  minWidth={240}
                  emptyLabel="Todavía no hay clases."
                />
              </div>
            </Tile>
            <Tile name="ActivityList" docs="platform-shared-activitylist" width={400} height={256}>
              <ActivityList
                items={[
                  {
                    id: "a1",
                    typeLabel: "Lección completada",
                    subjectName: "Torre activa",
                    topicLabel: "Finales",
                    dateLabel: "1 de octubre, 2026",
                  },
                  {
                    id: "a2",
                    typeLabel: "Clase asistida",
                    subjectName: "Najdorf",
                    dateLabel: "29 de septiembre, 2026",
                  },
                ]}
              />
            </Tile>
            <Tile name="StudyStreak" docs="platform-shared-studystreak" width={400} height={576}>
              <div className="overview__stack">
                <StudyStreak streak={{ days: 3, studiedToday: true }} />
                <StudyStreak streak={{ days: 3, studiedToday: false }} />
              </div>
            </Tile>
            <Tile name="LocalDateTime" docs="platform-shared-localdatetime" width={400} height={88}>
              <LocalDateTime iso="2026-10-06T23:00:00.000Z" fallback="6 de octubre, 2026 · 23:00 h" />
            </Tile>
            <Tile
              name="AuthorAvatar"
              docs="platform-sections-staff-courses-authors-manager-authoravatar"
              width={400}
              height={120}
            >
              <div className="overview__row">
                <AuthorAvatar name="Tomás Herrera" size="large" />
                <AuthorAvatar name="Fernanda Ríos" size="large" />
                <AuthorAvatar name="Tomás Herrera" shape="circle" />
                <AuthorAvatar name="Fernanda Ríos" size="small" />
              </div>
            </Tile>
            <Tile name="ExplorerNextMoves" docs="platform-sections-explorer-explorernextmoves" width={400} height={248}>
              <ExplorerNextMoves
                moves={[
                  { san: "Nc6", uci: "b8c6", count: 148, percentage: 71.8 },
                  { san: "Nf6", uci: "g8f6", count: 37, percentage: 18 },
                  { san: "d6", uci: "d7d6", count: 21, percentage: 10.2 },
                ]}
                onPlay={() => {}}
                isSearching={false}
              />
            </Tile>
            <Tile name="ExplorerGames" docs="platform-sections-explorer-explorergames" width={400} height={448}>
              <ExplorerGames
                games={[
                  {
                    id: "kasparov-anand",
                    white: "Kasparov, Garry",
                    black: "Anand, Viswanathan",
                    whiteElo: 2795,
                    blackElo: 2725,
                    resultLabel: "1-0",
                    event: "Campeonato del mundo PCA 1995",
                    origin: GAME_ORIGIN.EDITOR,
                    originLabel: "Profesorado",
                    seenInClass: true,
                    href: "#",
                  },
                  {
                    id: "steinitz-bardeleben",
                    white: "Steinitz, Wilhelm",
                    black: "von Bardeleben, Curt",
                    resultLabel: "1-0",
                    event: "Hastings 1895",
                    origin: GAME_ORIGIN.COURSE,
                    originLabel: "Curso",
                    seenInClass: false,
                    href: "#",
                  },
                ]}
                totalGames={213}
                isSearching={false}
              />
            </Tile>
            <Tile
              name="LevelScale"
              docs="platform-sections-courses-course-info-levelscale"
              surface
              width={720}
              height={200}
            >
              <LevelScale scale={LEVEL_SCALE} levels={LEVEL_SCALE.slice(2, 4)} />
            </Tile>
            <Tile
              name="StatsCards"
              docs="platform-sections-dashboard-activity-stats-statscards"
              width={880}
              height={320}
            >
              <StatsCards stats={STATS} />
            </Tile>
            <Tile name="SyllabusList" docs="platform-sections-staff-courses-syllabuslist" width={800} height={648}>
              <StaffPanel title="Temario" meta="3 capítulos · 16 lecciones">
                <SyllabusList
                  items={[
                    {
                      id: "1",
                      name: "La estructura de peones decide el plan",
                      facts: "6 lecciones",
                      href: "#",
                      canDelete: true,
                    },
                    {
                      id: "2",
                      name: "El alfil malo y cómo cambiarlo",
                      facts: "4 lecciones",
                      href: "#",
                      badge: "Prioridad",
                      canDelete: true,
                    },
                    {
                      id: "closing",
                      name: "Cierre",
                      facts: "1 lección",
                      href: "#",
                      roleCode: CONTENT_ROLE.CLOSING,
                      canDelete: false,
                      deleteHint: "Sólo se elimina un capítulo mientras el curso está en borrador.",
                    },
                  ]}
                  noun="capítulo"
                  deleteFieldName="chapterId"
                  newPlaceholder="Nombre del nuevo capítulo…"
                  onReorder={settles}
                  createAction={settles}
                  deleteAction={settles}
                />
              </StaffPanel>
            </Tile>
          </Section>

          <Section title="Cards">
            <Tile name="CourseCard" docs="platform-sections-courses-coursecard" width={400} height={320}>
              <CourseCard
                course={{
                  id: "10000004",
                  name: "Planes en el medio juego",
                  slug: "planes-en-el-medio-juego",
                  description:
                    "Casillas débiles, columnas abiertas y el momento de cambiar piezas, con partidas clásicas comentadas.",
                  contentTypes: [{ code: "STRATEGY", label: "Estrategia", shortLabel: "Estrategia", description: "" }],
                  levels: LEVEL_SCALE.slice(2, 4),
                  authorNames: ["Fernanda Ríos"],
                  isAdded: false,
                  isCompleted: false,
                  progress: {
                    statusCode: PROGRESS_STATUS.NOT_STARTED,
                    completedLessons: 0,
                    totalLessons: 24,
                    percent: 0,
                    completedMinutes: 0,
                    totalMinutes: 375,
                    minutesPercent: 0,
                  },
                  continueHref: "#",
                  ctaLabel: "Empezar",
                  href: "#",
                  infoHref: "#",
                }}
              />
            </Tile>
            <Tile name="MyCourseCard" docs="platform-sections-courses-my-courses-mycoursecard" width={440} height={320}>
              <MyCourseCard
                course={{
                  id: "10000007",
                  name: "Las partidas inmortales del siglo XIX",
                  slug: "las-partidas-inmortales-del-siglo-xix",
                  thumbnail: "/pieces/w-knight.svg",
                  contentTypes: [],
                  levels: [],
                  authorNames: ["Mateo Vidal"],
                  isAdded: true,
                  isCompleted: false,
                  progress: {
                    statusCode: PROGRESS_STATUS.IN_PROGRESS,
                    completedLessons: 36,
                    totalLessons: 61,
                    percent: 59,
                    completedMinutes: 720,
                    totalMinutes: 1220,
                    minutesPercent: 59,
                  },
                  continueHref: "#",
                  ctaLabel: "Continuar",
                  href: "#",
                  infoHref: "#",
                  learnHref: "#",
                  reviewCount: 12,
                  isReviewUpToDate: false,
                  reviewHref: "#",
                }}
              />
            </Tile>
          </Section>

          <Section title="Navigation">
            <Tile name="StaffTabs" docs="platform-shared-stafftabs" surface width={480} height={160}>
              <StaffTabs tabs={courseTabs({ courseId: "4812", chapterCount: 6, gameCount: 148 })} />
            </Tile>
            <Tile name="PlatformTabs" docs="platform-shared-platformtabs" surface width={480} height={160}>
              <PlatformTabs
                label="Pasos del ejercicio"
                value="position"
                onValueChange={() => undefined}
                tabs={[
                  { value: "position", label: "Posición" },
                  { value: "solution", label: "Solución" },
                  { value: "data", label: "Datos", invalid: true },
                ]}
              >
                <PlatformTabPanel value="position">
                  <p style={{ margin: 0 }}>Coloca las piezas o pega un FEN.</p>
                </PlatformTabPanel>
              </PlatformTabs>
            </Tile>
            <Tile name="OutlineList" docs="platform-sections-courses-lesson-view-outlinelist" width={400} height={304}>
              <nav className="lesson-outline overview__outline" aria-label="Lecciones del capítulo">
                <div>
                  <OutlineList
                    chapter={{
                      id: "capitulo-2",
                      order: 2,
                      name: "Finales de torre",
                      href: "#",
                      lessons: [
                        {
                          id: "lucena",
                          name: "La posición de Lucena",
                          href: "#",
                          statusCode: PROGRESS_STATUS.COMPLETED,
                        },
                        // The lesson on screen is the one whose address is the sheet's.
                        {
                          id: "philidor",
                          name: "La posición de Philidor",
                          href: SHEET_PATH,
                          statusCode: PROGRESS_STATUS.IN_PROGRESS,
                        },
                        {
                          id: "vancura",
                          name: "La defensa Vancura",
                          href: "#",
                          statusCode: PROGRESS_STATUS.NOT_STARTED,
                        },
                      ],
                    }}
                  />
                </div>
              </nav>
            </Tile>
            <Tile name="GameList" docs="platform-shared-gamelist" surface width={400} height={320}>
              <GameList
                games={[
                  {
                    id: "g1",
                    name: "Una celada en la apertura",
                    players: "Fischer — Sherwin",
                    resultLabel: "1-0",
                    href: "#",
                  },
                  { id: "g2", name: "Lombardy — Fischer", resultLabel: "0-1", href: "#" },
                  { id: "g3", name: "La partida del siglo", players: "Byrne — Fischer", resultLabel: "0-1", href: "#" },
                ]}
                currentId="g2"
                onReorder={async () => undefined}
              />
            </Tile>
            <Tile name="GameSettings" docs="platform-shared-gamesettings" surface width={400} height={128}>
              <div className="overview__row">
                <span>Una celada en la apertura</span>
                <GameSettings
                  game={{
                    id: "g1",
                    name: "Una celada en la apertura",
                    title: "Una celada en la apertura",
                    orientationCode: "WHITE",
                  }}
                  isCurrent={false}
                  actions={{
                    save: async () => undefined,
                    clearAnnotations: async () => undefined,
                    clearVariations: async () => undefined,
                    remove: async () => undefined,
                  }}
                />
              </div>
            </Tile>
            <Tile
              name="PlatformAppsMenu"
              docs="platform-sections-shell-platformappsmenu"
              surface
              width={400}
              height={88}
            >
              <PlatformAppsMenu apps={TEACHER_APPS} />
            </Tile>
          </Section>

          <Section title="Classes">
            <Tile name="ClassStatusTag" docs="platform-shared-classstatustag" width={400} height={96}>
              <div className="overview__row">
                <ClassStatusTag phase={CLASS_PHASE.OPEN} audience="staff" />
                <ClassStatusTag phase={CLASS_PHASE.IN_PROGRESS} audience="staff" />
                <ClassStatusTag phase={CLASS_PHASE.AWAITING_CLOSE} audience="teacher" />
                <ClassStatusTag phase={CLASS_PHASE.DONE} audience="student" />
              </div>
            </Tile>
            <Tile name="ClassWhen" docs="platform-shared-classwhen" width={400} height={96}>
              <div className="overview__row">
                <ClassWhen
                  startIso={OVERVIEW_CLASS_ROW.startIso}
                  durationMin={60}
                  timeZone={CLASSES_TIME_ZONE}
                  nowIso={OVERVIEW_CLASS_ROW.nowIso}
                  withZone
                />
              </div>
            </Tile>
            <Tile name="ClassDateTile" docs="platform-shared-classdatetile" width={400} height={112}>
              <div className="overview__row">
                <ClassDateTile startIso={OVERVIEW_CLASS_ROW.startIso} timeZone={CLASSES_TIME_ZONE} isToday />
                <ClassDateTile
                  startIso={cdmx("2026-10-17", "10:00").toISOString()}
                  timeZone={CLASSES_TIME_ZONE}
                  isToday={false}
                  size="sm"
                />
              </div>
            </Tile>
            <Tile name="FilterPills" docs="platform-shared-filterpills" width={480} height={96}>
              <FilterPills
                label="Vista"
                pills={[
                  { label: "Próximas", href: "?vista=proximas", active: true },
                  { label: "Pasadas", href: "?vista=pasadas", count: 12, active: false },
                  { label: "Canceladas", href: "?vista=canceladas", active: false },
                ]}
              />
            </Tile>
            <Tile name="ClassRow" docs="platform-shared-classrow" width={960} height={112}>
              <ClassRow row={OVERVIEW_CLASS_ROW} audience="staff" />
            </Tile>
            <Tile name="ClassAgenda" docs="platform-shared-classagenda" width={960} height={272}>
              <ClassAgenda
                audience="staff"
                emptyLine="No hay clases esta semana."
                foot={{ label: "Ver la semana siguiente", href: "?hasta=2026-10-27" }}
                days={[
                  {
                    key: "2026-10-14",
                    label: "Hoy · miércoles 14 de octubre",
                    isToday: true,
                    rows: [OVERVIEW_CLASS_ROW],
                  },
                ]}
              />
            </Tile>
            <Tile name="PlatformSideNav" docs="platform-shared-platformsidenav" width={280} height={400}>
              <PlatformSideNav
                label="Cursos"
                action={{ label: "Seguir donde iba", href: "#continuar" }}
                groups={[
                  {
                    title: "Tus cursos",
                    links: [
                      { label: "Todos", href: "?", count: 4, icon: "graduation-cap", current: true },
                      { label: "En curso", href: "?estado=en-curso", count: 2, icon: "play" },
                      { label: "Completados", href: "?estado=completados", count: 1, icon: "circle-check" },
                    ],
                  },
                  {
                    title: "Catálogo",
                    links: [
                      { label: "Todo el catálogo", href: "/cursos/catalogo", count: 10, icon: "book-open" },
                      { label: "Principiante", href: "/cursos/catalogo?nivel=principiante", count: 3, level: 1 },
                    ],
                  },
                ]}
              />
            </Tile>
            {/* The settings panel is drawn only while the root says it is open. */}
            <OpenSettings />
            <Tile name="PlatformSettingsPanel" docs="platform-shared-platformsettingspanel" width={360} height={260}>
              <PlatformSettingsPanel title="Ajustes del curso">
                <PlatformSettingsGroup title="Qué aprender">
                  <button
                    type="button"
                    aria-pressed="true"
                    className="platform-settings__option platform-settings__option_state_on"
                  >
                    <span className="platform-settings__ring" aria-hidden="true" />
                    <span className="platform-settings__option-text">
                      <span className="platform-settings__option-label">Todas las lecciones</span>
                      <span className="platform-settings__option-hint">Cada lección del curso, en orden</span>
                    </span>
                    <span className="platform-settings__option-art">
                      <CourseSettingsArt kind="all-lessons" />
                    </span>
                  </button>
                </PlatformSettingsGroup>
              </PlatformSettingsPanel>
            </Tile>
            <Tile name="PlatformSettingsToggle" docs="platform-shared-platformsettingstoggle" width={120} height={80}>
              <div style={{ display: "flex" }}>
                <PlatformSettingsToggle />
              </div>
            </Tile>
            <Tile name="PlatformSearchField" docs="platform-shared-platformsearchfield" width={400} height={96}>
              <PlatformSearchField label="Buscar clase" placeholder="Buscar por tema, alumno o profesor" />
            </Tile>
            <Tile name="PlatformActionsMenu" docs="platform-shared-platformactionsmenu" width={400} height={96}>
              <div className="overview__row overview__row_align_end">
                <PlatformActionsMenu
                  label="Acciones del pago"
                  items={[
                    { label: "Editar pago", onSelect: () => {} },
                    { label: "Eliminar pago", onSelect: () => {}, tone: "danger" },
                  ]}
                />
              </div>
            </Tile>
            <Tile name="CopyLinkButton" docs="platform-shared-copylinkbutton" width={400} height={96}>
              <div className="overview__row">
                <span>https://zoom.us/j/11111111111</span>
                <CopyLinkButton url="https://zoom.us/j/11111111111" label="Copiar el enlace de la reunión" />
              </div>
            </Tile>
            <Tile name="ClassSlotFields" docs="platform-shared-classslotfields" width={560} height={168}>
              {/* Its three fields are `PlatformFormField`s, which live inside a `PlatformForm`. */}
              <PlatformForm onSubmit={(event) => event.preventDefault()}>
                <ClassSlotFields
                  namePrefix="slot.0"
                  defaultValue={{ date: "2026-10-21", time: "19:00", durationMin: 60 }}
                  timeZone={CLASSES_TIME_ZONE}
                />
              </PlatformForm>
            </Tile>
            <Tile name="RegisterPaymentPopup" docs="platform-shared-registerpaymentpopup" width={400} height={96}>
              <RegisterPaymentButton
                fixedStudent={{
                  id: "u-v",
                  displayName: "Valentina Cruz",
                  email: "valentina.demo@365diasdeajedrez.com",
                }}
                teachers={OVERVIEW_TEACHERS}
                groupClasses={[]}
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                registerPayment={OVERVIEW_PAYMENT_ACTIONS.registerPayment}
                loadPaymentContext={OVERVIEW_PAYMENT_ACTIONS.loadPaymentContext}
                loadTeacherBusy={OVERVIEW_PAYMENT_ACTIONS.loadTeacherBusy}
              />
            </Tile>
            <Tile name="ScheduleSeatPopup" docs="platform-shared-scheduleseatpopup" width={400} height={96}>
              <ScheduleSeatPopup
                paymentId="pay-1"
                studentName="Alumno Demo"
                seatLabel="Clase 3 de 4 del pago del jue 1 oct · Profesor: GM Profesor Demo"
                teachers={OVERVIEW_TEACHERS}
                rhythm={OVERVIEW_RHYTHM}
                groupClasses={[]}
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                scheduleSeat={OVERVIEW_PAYMENT_ACTIONS.scheduleSeat}
              />
            </Tile>
            <Tile name="PaymentCard" docs="platform-sections-staff-payments-paymentcard" width={820} height={360}>
              <PaymentCard
                payment={OVERVIEW_PAYMENT}
                student={{ id: "u-demo", displayName: "Alumno Demo", teacherName: "GM Profesor Demo" }}
                teachers={OVERVIEW_TEACHERS}
                groupClasses={[]}
                rhythm={OVERVIEW_RHYTHM}
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                actions={OVERVIEW_PAYMENT_ACTIONS}
              />
            </Tile>
            <Tile name="MeetingLinkPopup" docs="platform-shared-meetinglinkpopup" width={400} height={72}>
              <MeetingLinkButton
                variant="button"
                classId="c3"
                classTitle="Plan de aperturas con blancas"
                current={OVERVIEW_MEETING}
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                setMeeting={async () => popupFormDone("meetingAdded", ["c3"])}
              />
            </Tile>
            <Tile name="ClassRowAction" docs="platform-shared-classrowaction" width={400} height={72}>
              <ClassRowAction
                action={{ kind: "meeting", label: "Agregar", classId: "c3", current: OVERVIEW_MEETING }}
                row={{
                  href: "/administracion/clases/c3",
                  title: "Plan de aperturas con blancas",
                  timeZone: CLASSES_TIME_ZONE,
                  nowIso: CLASSES_NOW.toISOString(),
                }}
                serverActions={{ setMeeting: async () => popupFormDone("meetingAdded", ["c3"]) }}
              />
            </Tile>
            <Tile name="AttendanceRow" docs="platform-shared-attendancerow" width={640} height={200} surface>
              <PlatformForm onSubmit={(event) => event.preventDefault()}>
                <AttendanceRow
                  student={{ id: "u-v", displayName: "Valentina Cruz" }}
                  details={["valentina.demo@365diasdeajedrez.com", "Pago del mar 15 sep · clase 4 de 4"]}
                  mark={{
                    attended: true,
                    markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12",
                    changedLine: "Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «Se le cayó el audio.»",
                  }}
                  mode="read"
                />
              </PlatformForm>
            </Tile>
            <Tile
              name="ClassSeatRow"
              docs="platform-sections-staff-classes-classseatrow"
              width={820}
              height={120}
              surface
            >
              <ClassSeatRow
                seat={{
                  userId: "u-v",
                  displayName: "Valentina Cruz",
                  email: "valentina.demo@365diasdeajedrez.com",
                  coverage: { kind: "paid", paymentId: "p-v", label: "Pago del mar 15 sep · clase 4 de 4" },
                  attended: false,
                  mark: { attended: false, markedLine: "Marcó GM Profesor Demo · mié 14 oct, 20:12" },
                  markedByName: "GM Profesor Demo",
                  isAssigned: true,
                  moved: false,
                  can: { remove: false, register: false, changeAttendance: true, moveSeat: true },
                  moveContext:
                    "Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo",
                }}
                classDetail={OVERVIEW_CLASS}
                teachers={OVERVIEW_TEACHERS}
                groupClasses={[]}
                staffName="Staff Demo"
                actions={OVERVIEW_SEAT_ACTIONS}
              />
            </Tile>
            <Tile name="NewClassForm" docs="platform-sections-staff-classes-newclassform" width={960} height={720}>
              <NewClassForm
                defaults={{
                  format: CLASS_FORMAT.INDIVIDUAL,
                  capacity: null,
                  title: "",
                  description: "",
                  teacherId: "t-1",
                  date: "2026-10-21",
                  time: "12:00",
                  durationMin: 60,
                  meetingUrl: "",
                  studentId: "u-d",
                  duplicateOf: null,
                }}
                teachers={OVERVIEW_TEACHERS}
                students={OVERVIEW_STUDENTS}
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                createClass={async () => popupFormDone("classCreated")}
                loadTeacherBusy={async () => []}
              />
            </Tile>
            <Tile
              name="RescheduleClassPopup"
              docs="platform-sections-staff-classes-rescheduleclasspopup"
              width={400}
              height={72}
            >
              <RescheduleClassButton
                classId="c5"
                classTitle="Taller de finales de torre"
                startIso={cdmx("2026-10-17", "10:00").toISOString()}
                durationMin={90}
                teacherId="t-1"
                teacherName="GM Profesor Demo"
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                rescheduleClass={async () => popupFormDone("classRescheduled")}
                loadTeacherBusy={async () => []}
              />
            </Tile>
            <Tile
              name="ChangeTeacherPopup"
              docs="platform-sections-staff-classes-changeteacherpopup"
              width={400}
              height={72}
            >
              <ChangeTeacherButton
                classId="c5"
                classTitle="Taller de finales de torre"
                current={{ id: "t-1", displayName: "GM Profesor Demo", isActive: true }}
                teachers={OVERVIEW_TEACHERS}
                setClassTeacher={async () => popupFormDone("teacherChanged")}
              />
            </Tile>
            <Tile
              name="AddStudentsPopup"
              docs="platform-sections-staff-classes-addstudentspopup"
              width={400}
              height={72}
            >
              <AddStudentsButton
                classId="c5"
                classTitle="Taller de finales de torre"
                seatsFree={2}
                seatedIds={[]}
                students={OVERVIEW_STUDENTS}
                teacher={{ id: "t-1", displayName: "GM Profesor Demo" }}
                addClassParticipants={async () => popupFormDone("participantsAdded", [1])}
              />
            </Tile>
            <Tile
              name="ChangeAttendancePopup"
              docs="platform-sections-staff-classes-changeattendancepopup"
              width={400}
              height={72}
            >
              <ChangeAttendanceButton
                classId="c4"
                student={{ id: "u-v", displayName: "Valentina Cruz" }}
                context="Clase de Valentina Cruz · mié 14 oct · 19:00–20:00 · GM Profesor Demo marcó «Faltó»"
                attended={false}
                teacherName="GM Profesor Demo"
                staffName="Staff Demo"
                changeAttendance={async () => popupFormDone("attendanceChanged", ["u-v"])}
              />
            </Tile>
            <Tile
              name="RescheduleSeatPopup"
              docs="platform-sections-staff-classes-rescheduleseatpopup"
              width={400}
              height={72}
            >
              <RescheduleSeatButton
                classId="c4"
                student={{ id: "u-v", displayName: "Valentina Cruz" }}
                context="Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo"
                startIso={cdmx("2026-10-14", "19:00").toISOString()}
                durationMin={60}
                teacher={{ id: "t-1", displayName: "GM Profesor Demo", isActive: true }}
                teachers={OVERVIEW_TEACHERS}
                groupClasses={[]}
                hasPayment
                timeZone={CLASSES_TIME_ZONE}
                nowIso={CLASSES_NOW.toISOString()}
                rescheduleStudentSeat={async () => popupFormDone("seatRescheduled", [29_900_000, 60])}
              />
            </Tile>
            <Tile name="MeetingCountdown" docs="platform-shared-meetingcountdown" width={400} height={56}>
              <MeetingCountdown {...OVERVIEW_JOIN} hasLink />
            </Tile>
            <Tile name="MeetingJoinCard" docs="platform-shared-meetingjoincard" width={640} height={132} surface>
              <MeetingJoinCard {...OVERVIEW_JOIN} audience="teacher" density="full" />
            </Tile>
            <Tile name="ClassJoinBar" docs="platform-shared-classjoinbar" width={400} height={96}>
              <MeetingJoinCard {...OVERVIEW_JOIN} audience="student" density="bar" />
            </Tile>
            <Tile name="FinalizeClassPopup" docs="platform-shared-finalizeclasspopup" width={400} height={72}>
              <FinalizeClassButton
                mode="finalize"
                action={async () => popupFormDone("classFinalized")}
                {...OVERVIEW_FINALIZE}
              />
            </Tile>
            <Tile
              name="ClassBlockList"
              docs="platform-sections-teacher-classes-classblocklist"
              width={820}
              height={420}
              surface
            >
              <ClassBlockList
                classId="c2"
                blocks={[
                  {
                    id: "b1",
                    order: 1,
                    kind: CLASS_BLOCK_KIND.TEXT,
                    visibility: CLASS_BLOCK_VISIBILITY.BEFORE,
                    text: "Trae tus dudas",
                    caption: "Trae tus dudas",
                    isMovePathBroken: false,
                  },
                ]}
                views={[
                  {
                    id: "b1",
                    kind: "TEXT",
                    visibility: "BEFORE",
                    title: "Trae tus dudas",
                    isNew: false,
                    text: "Apunta tus dudas.",
                  },
                ]}
                phase={CLASS_PHASE.OPEN}
                editable
                studentLabel="Alumno Demo"
                groupSize={1}
                endHour="13:00"
                options={{ games: [], exercises: OVERVIEW_PICKABLE }}
                actions={{
                  addClassBlock: async () => popupFormDone("blockAdded"),
                  updateClassBlock: async () => popupFormDone("blockSaved"),
                  deleteClassBlock: async () => undefined,
                  reorderClassBlocks: async () => ({ ok: true }),
                  fetchReferencePgn: async () => OVERVIEW_PGN,
                }}
              />
            </Tile>
            <Tile
              name="ClassPageEditor"
              docs="platform-sections-teacher-classes-classpageeditor"
              width={960}
              height={640}
            >
              <ClassPageEditor
                title="La posición de Lucena"
                dateline="Jueves 29 de octubre · 18:00"
                blocks={EDITOR_SAMPLE_BLOCKS}
                options={EDITOR_SAMPLE_OPTIONS}
              />
            </Tile>
            <Tile name="ClassCalendar" docs="platform-sections-teacher-classcalendar" width={1120} height={720}>
              <ClassCalendar
                classes={CALENDAR_SAMPLE_CLASSES}
                timeZone={CALENDAR_SAMPLE_ZONE}
                nowIso={CALENDAR_SAMPLE_NOW}
                defaultView="day"
              />
            </Tile>
            <Tile
              name="BlockPopup"
              docs="platform-sections-teacher-classes-class-block-editor-blockpopup"
              width={400}
              height={72}
            >
              <BlockPopupTrigger />
            </Tile>
            <Tile name="TopicPopup" docs="platform-sections-teacher-classes-topicpopup" width={400} height={72}>
              <TopicButton
                classId="c2"
                topic="Repaso de la Najdorf: tus dudas"
                description={null}
                updateClassTopic={async () => popupFormDone("topicSaved")}
              />
            </Tile>
            <Tile
              name="AfterNotesPopup"
              docs="platform-sections-teacher-classes-afternotespopup"
              width={400}
              height={72}
            >
              <AfterNotesButton
                classId="c1"
                summary="Vimos los tres errores típicos."
                recordingUrl={null}
                updateClassAfterNotes={async () => popupFormDone("afterNotesSaved")}
              />
            </Tile>
            <Tile name="ClassTicket" docs="platform-shared-classticket" width={760} height={264}>
              <ClassTicket card={studentCard()} />
            </Tile>
            <Tile name="PastClassCard" docs="platform-shared-pastclasscard" width={640} height={268}>
              <PastClassCard card={STUDENT_PAST_CARD} />
            </Tile>
            <Tile name="PaidClassesCard" docs="platform-shared-paidclassescard" width={320} height={296}>
              <PaidClassesCard balance={STUDENT_BALANCE} whatsappHref={STUDENT_WHATSAPP} />
            </Tile>
            <Tile name="ClassGameSave" docs="platform-shared-classgamesave" width={400} height={72}>
              <ClassGameSave
                classId="c1"
                blockId="b2"
                title="Paul Morphy – Duque de Brunswick"
                studies={[{ id: "s1", name: "Mis partidas" }]}
                action={async () => {}}
              />
            </Tile>
            <Tile
              name="ClassAheadSection"
              docs="platform-sections-classes-class-detail-classaheadsection"
              width={960}
              height={640}
            >
              <ClassAheadSection classDetail={studentDetail()} />
            </Tile>
            <Tile
              name="ClassReviewSection"
              docs="platform-sections-classes-class-detail-classreviewsection"
              width={960}
              height={640}
            >
              <ClassReviewSection
                classDetail={studentDetail({
                  view: "review",
                  join: studentJoin({ phase: CLASS_PHASE.DONE, meetingUrl: null }),
                  attended: true,
                  summary: "Vimos los tres errores típicos que dejan al rey en el centro.",
                  recordingUrl: "https://zoom.us/rec/demo",
                  blocks: [
                    {
                      id: "b1",
                      kind: "TEXT",
                      visibility: "AFTER",
                      title: "Para la próxima",
                      text: "Resuelve los ejercicios.",
                    },
                  ],
                })}
                saveGame={{ studies: [{ id: "s1", name: "Mis partidas" }], action: async () => {} }}
              />
            </Tile>
          </Section>

          <Section title="Overlays">
            <Tile name="PlatformPopup" docs="platform-shared-platformpopup" width={400} height={112}>
              <PopupTrigger />
            </Tile>
            <Tile name="PlatformConfirmPopup" docs="platform-shared-platformconfirmpopup" width={400} height={112}>
              <ConfirmTrigger />
            </Tile>
            <Tile name="EditGame" docs="platform-shared-editgame" width={400} height={88}>
              <EditGame
                action={settles}
                values={{ white: "Kasparov, Garry", black: "Topalov, Veselin", resultCode: GAME_RESULT.WHITE_WINS }}
                results={RESULTS}
                titleHint="Cómo identificas esta partida dentro del estudio."
              />
            </Tile>
            <Tile name="NewStudy" docs="platform-sections-studies-studies-list-newstudy" width={400} height={136}>
              <SectionDialog
                block="new-study"
                label="Nuevo estudio"
                buttonClassName={`${mdFab("primary-container")} new-study__fab`}
                title="Nuevo estudio"
                size="md"
                form={(close) => (
                  <NewStudyForm
                    kinds={[
                      { code: "STUDY", label: "Estudio" },
                      { code: "TOURNAMENT", label: "Torneo" },
                    ]}
                    action={settles}
                    onClose={close}
                    onSubmit={close}
                  />
                )}
              />
            </Tile>
            <Tile name="NewCourse" docs="platform-sections-staff-courses-newcourse" width={400} height={120}>
              <SectionDialog
                block="new-course"
                label="Nuevo curso"
                buttonClassName="platform-button"
                title="Nuevo curso"
                size="lg"
                form={(close) => (
                  <NewCourseForm
                    contentTypes={[
                      {
                        code: "OPENINGS",
                        label: "Aperturas",
                        shortLabel: "Aperturas",
                        description: "Principios, repertorio, variantes y planes típicos al comenzar la partida.",
                      },
                      {
                        code: "ENDGAMES",
                        label: "Finales",
                        shortLabel: "Finales",
                        description: "Técnica y posiciones teóricas con pocas piezas.",
                      },
                    ]}
                    action={settles}
                    onClose={close}
                    onSubmit={close}
                  />
                )}
              />
            </Tile>
            <Tile name="MoveContextMenu" docs="chess-game-viewer-movecontextmenu" width={400} height={400}>
              <MoveMenuTile />
            </Tile>
            <Tile
              name="CourseSourceForm"
              docs="platform-sections-staff-courses-course-sources-coursesourceform"
              width={400}
              height={112}
            >
              <SectionDialog
                block="course-source-dialog"
                label="Agregar fuente"
                buttonClassName="platform-button platform-button_size_sm"
                title="Nueva fuente"
                size="lg"
                form={(close) => (
                  <CourseSourceForm
                    sourceTypes={[
                      { code: "BOOK", label: "Libro" },
                      { code: "DIGITAL_COURSE", label: "Curso digital" },
                      { code: "VIDEO", label: "Vídeo o serie de vídeos" },
                    ]}
                    action={settles}
                    onClose={close}
                    onSubmit={close}
                  />
                )}
              />
            </Tile>
          </Section>

          <Section title="Play">
            <Tile name="OpenGameNotice" docs="platform-sections-play-lobby-opengamenotice" width={400} height={136}>
              <OpenGameNotice
                game={{
                  id: "AbC12345",
                  rival: {
                    kind: "bot",
                    botId: 4,
                    name: FIXTURE_BOT.name,
                    slug: FIXTURE_BOT.slug,
                    elo: FIXTURE_BOT.elo,
                    avatar: FIXTURE_BOT.avatar,
                    title: null,
                  },
                  color: "white",
                  plyCount: 12,
                }}
              />
            </Tile>
            <Tile name="BotCard" docs="platform-sections-play-lobby-botcard" width={400} height={216}>
              <div className="overview__bot-cards">
                <BotCard
                  bot={fixtureBotView()}
                  score={{ botId: 4, wins: 2, losses: 1, draws: 0, open: 0 }}
                  onPick={() => undefined}
                />
                <BotCard bot={FIXTURE_TEAM_BOT} score={null} onPick={() => undefined} />
              </div>
            </Tile>
            <Tile name="BotSheet" docs="platform-sections-play-lobby-botsheet" width={400} height={344}>
              <BotSheet
                bot={fixtureBotView()}
                you={FIXTURE_STUDENT}
                score={{ botId: 4, wins: 2, losses: 1, draws: 1, open: 0 }}
              />
            </Tile>
            <Tile name="AbandonPopup" docs="platform-sections-play-live-game-abandonpopup" width={400} height={112}>
              <AbandonTrigger />
            </Tile>
            <Tile name="LiveGameBanner" docs="platform-sections-play-live-game-livegamebanner" width={400} height={112}>
              <LiveGameBanner kind="stale" onReload={() => undefined} />
            </Tile>
            <Tile
              name="PositionInput"
              docs="platform-sections-tools-analysis-board-positioninput"
              width={256}
              height={320}
            >
              <PositionInput onLoad={() => undefined} />
            </Tile>
            <Tile
              name="PlayVsEngine"
              docs="platform-sections-tools-analysis-board-playvsengine"
              width={256}
              height={320}
            >
              <div className="overview__stack">
                <PlayVsEngine sideToMove="white" playing={null} onStart={() => undefined} onStop={() => undefined} />
                <PlayVsEngine
                  sideToMove="white"
                  playing={{ color: "white", status: "your-turn", end: null, failed: false }}
                  onStart={() => undefined}
                  onStop={() => undefined}
                />
              </div>
            </Tile>
            <Tile name="SaveToStudyPopup" docs="platform-shared-savetostudypopup" width={400} height={112}>
              <SaveToStudyTrigger />
            </Tile>
            <Tile name="PlayedGameCard" docs="platform-shared-playedgamecard" width={400} height={320}>
              <div className="overview__bot-cards">
                {fixturePlayedGames(PROFILE_NOW)
                  .slice(1, 3)
                  .map((game) => (
                    <PlayedGameCard key={game.id} game={game} now={PROFILE_NOW} />
                  ))}
              </div>
            </Tile>
            <Tile name="BotLevelCard" docs="platform-sections-profile-botlevelcard" width={400} height={216}>
              <BotLevelCard level={{ level: 875, sampleSize: 10, series: LEVEL_SERIES }} isOwn />
            </Tile>
            <Tile name="LevelSparkline" docs="platform-sections-profile-levelsparkline" width={400} height={96}>
              <div style={{ width: 240 }}>
                <LevelSparkline points={LEVEL_SERIES} />
              </div>
            </Tile>
            <Tile name="GamesSummaryCard" docs="platform-sections-profile-gamessummarycard" width={400} height={160}>
              <GamesSummaryCard record={{ wins: 5, losses: 3, draws: 1, open: 1 }} />
            </Tile>
            <Tile name="StudyStreakCard" docs="platform-sections-profile-studystreakcard" width={400} height={160}>
              <StudyStreakCard
                streak={{ streak: { days: 21, studiedToday: true }, daysThisWeek: 4, minutesThisWeek: 95 }}
                isOwn
              />
            </Tile>
            <Tile
              name="PlayedGamesTimeline"
              docs="platform-sections-profile-playedgamestimeline"
              width={400}
              height={360}
            >
              <PlayedGamesTimeline
                page={{ games: fixturePlayedGames(PROFILE_NOW).slice(0, 3), page: 1, pageCount: 1, total: 3 }}
                isOwn
                filtered={false}
                hrefOf={() => "/perfil/ana-torres/partidas"}
                now={PROFILE_NOW}
              />
            </Tile>
          </Section>

          <Section title="Exercises">
            <Tile name="ExerciseAuthoring" docs="platform-shared-exerciseauthoring" width={960} height={760}>
              <ExerciseAuthoring
                exercise={OVERVIEW_NEW_EXERCISE}
                catalogs={OVERVIEW_EXERCISE_CATALOGS}
                games={[]}
                permissions={{ contentLocked: null, canDuplicate: false }}
                buttons={[
                  {
                    intent: "draft",
                    label: "Guardar borrador",
                    pendingLabel: "Guardando…",
                    accent: false,
                    needsReadiness: false,
                  },
                  {
                    intent: "ready",
                    label: "Guardar y marcar como listo",
                    pendingLabel: "Guardando…",
                    accent: true,
                    needsReadiness: true,
                  },
                ]}
                save={async (state) => state}
                fetchGamePgn={async () => null}
              />
            </Tile>
            <Tile name="ExerciseCard" docs="platform-shared-exercisecard" width={560} height={200}>
              <ExerciseCard
                exercise={{
                  id: "ex000002",
                  href: "#",
                  title: "La dama que se entrega",
                  startFen: "r1b2k1r/ppp1bppp/8/1B1Q4/5q2/2P5/PPP2PPP/R3R1K1 w - - 1 1",
                  orientation: "white",
                  statusCode: "READY",
                  statusLabel: "Listo",
                  kindLabel: "Mate en 2",
                  difficulty: 1400,
                  levelName: "Intermedio",
                  playerMoves: 2,
                  topicLabels: ["Táctica", "Desviación", "Sacrificio"],
                  allowed: { duplicate: true, archive: true, restore: false, delete: true, propose: true },
                }}
                actions={{
                  duplicate: async () => undefined,
                  archive: async () => undefined,
                  restore: async () => undefined,
                  delete: async () => undefined,
                  propose: async () => undefined,
                }}
              />
            </Tile>
            <Tile name="DeleteExercise" docs="platform-shared-deleteexercise" width={240} height={80}>
              <DeleteExercise title="La dama que se entrega" action={async () => undefined} />
            </Tile>
            <Tile name="ExerciseSolver" docs="platform-shared-exercisesolver" width={960} height={600}>
              <ExerciseSolver
                exercise={{
                  id: "dmEjer02",
                  title: "El mate de Philidor",
                  prompt: null,
                  kind: "MATE_IN",
                  mateIn: 2,
                  solutionPgn: `[SetUp "1"]\n[FEN "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1"]\n\n1. Qg8+ Rxg8 2. Nf7# *`,
                  hints: [],
                  explanation: null,
                  difficulty: 1400,
                }}
                mode="solve"
                context={{ attempt: { kind: "SERIES", seriesId: "dmSerie1" }, position: "2 / 5" }}
              />
            </Tile>
            <Tile name="ExerciseAttemptRow" docs="platform-shared-exerciseattemptrow" width={640} height={120}>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <ExerciseAttemptRow
                  attempt={{
                    id: "a-1",
                    title: "Mate del pasillo",
                    href: "#",
                    atIso: "2026-10-15T20:12:00.000Z",
                    atLabel: "15 de octubre, 2026",
                    outcome: "failed",
                    outcomeLabel: "Fallado",
                    whereLabel: "Serie: Táctica de la semana",
                    durationLabel: "42 s",
                    mistake: {
                      fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
                      orientation: "white",
                      playedLabel: "Td7",
                      expectedLabel: "Td8#",
                      arrows: [
                        { from: "d1", to: "d7", tone: "danger" },
                        { from: "d1", to: "d8", tone: "success" },
                      ],
                    },
                  }}
                />
              </ul>
            </Tile>
            <Tile name="SeriesProgressTable" docs="platform-shared-seriesprogresstable" width={640} height={300}>
              <SeriesProgressTable
                progress={{
                  items: [
                    { exerciseId: "ex1", n: 1, title: "Mate del pasillo" },
                    { exerciseId: "ex2", n: 2, title: "El mate de Philidor" },
                    { exerciseId: "ex3", n: 3, title: "El tenedor de caballo" },
                  ],
                  students: [
                    {
                      userId: "u-d",
                      displayName: "Alumno Demo",
                      href: "#",
                      cells: [
                        { state: "solved", attempts: 1 },
                        { state: "failed", attempts: 2 },
                        { state: "untried", attempts: 0 },
                      ],
                      solved: 1,
                    },
                    {
                      userId: "u-v",
                      displayName: "Valentina Cruz",
                      href: "#",
                      cells: [
                        { state: "solved", attempts: 1 },
                        { state: "solved", attempts: 1 },
                        { state: "solved", attempts: 3 },
                      ],
                      solved: 3,
                    },
                  ],
                  completed: 1,
                }}
              />
            </Tile>
            <Tile name="StudentSharePanel" docs="platform-shared-studentsharepanel" width={560} height={344}>
              <StudentSharePanel
                subject="series"
                shares={[
                  {
                    userId: "u-d",
                    displayName: "Alumno Demo",
                    email: "alumno.demo@365diasdeajedrez.com",
                    sharedAtLabel: "12 de octubre de 2026",
                  },
                ]}
                students={[
                  { id: "u-d", displayName: "Alumno Demo", email: "alumno.demo@365diasdeajedrez.com" },
                  { id: "u-v", displayName: "Valentina Cruz", email: "valentina.demo@365diasdeajedrez.com" },
                ]}
                share={async () => undefined}
                unshare={async () => undefined}
              />
            </Tile>
            <Tile name="SeriesDataPopup" docs="platform-shared-seriesdatapopup" width={400} height={72}>
              <NewSeriesButton save={async () => popupFormDone("seriesSaved")} />
            </Tile>
            <Tile name="AddSeriesExercisesPopup" docs="platform-shared-addseriesexercisespopup" width={400} height={72}>
              <AddSeriesExercisesButton
                seriesId="se000001"
                exercises={OVERVIEW_PICKABLE}
                itemCount={3}
                addExercisesToSeries={async () => popupFormDone("seriesExercisesAdded")}
              />
            </Tile>
            <Tile name="ExercisePicker" docs="platform-shared-exercisepicker" width={480} height={240} surface>
              <ExercisePickerHost />
            </Tile>
            <Tile
              name="ClassExerciseProgress"
              docs="platform-sections-teacher-classes-classexerciseprogress"
              width={560}
              height={168}
              surface
            >
              <ClassExerciseProgress
                progress={{
                  blockId: "b5",
                  seatCount: 3,
                  exercises: [
                    {
                      exerciseId: "ex000001",
                      n: 1,
                      title: "Mate del pasillo",
                      facts: "Mate en 1 · 900",
                      solvedCount: 2,
                      label: "2 de 3 lo resolvieron",
                      attempts: [],
                      untried: ["Diego Salas"],
                    },
                    {
                      exerciseId: "ex000002",
                      n: 2,
                      title: "El mate de Philidor",
                      facts: "Mate en 2 · 1400",
                      solvedCount: 0,
                      label: "0 de 3 lo resolvieron",
                      attempts: [],
                      untried: ["Alumno Demo", "Mateo Ríos", "Diego Salas"],
                    },
                  ],
                }}
              />
            </Tile>
            <Tile
              name="ExerciseReviewBar"
              docs="platform-sections-staff-exercises-exercisereviewbar"
              width={720}
              height={96}
            >
              <ExerciseReviewBar
                title="El mate de Philidor"
                review={{
                  statusCode: "IN_REVIEW",
                  statusLabel: "En revisión",
                  owner: "teacher",
                  authorLabel: "Profesor Demo",
                  submittedLabel: "Propuesto el 14 de octubre, 2026",
                  reviewedLabel: null,
                  reviewNote: null,
                  canApprove: true,
                  canReturn: true,
                  canRemove: false,
                  canRestore: false,
                }}
                actions={{
                  approve: async () => undefined,
                  returnWithNote: async () => popupFormDone("exerciseReturned"),
                  remove: async () => undefined,
                  restore: async () => undefined,
                }}
              />
            </Tile>
            <Tile
              name="SeriesPublishSwitch"
              docs="platform-sections-staff-exercises-seriespublishswitch"
              width={360}
              height={96}
            >
              <SeriesPublishSwitch
                seriesId="se000009"
                published
                publishedLabel="Publicada el 14 de octubre, 2026"
                itemCount={4}
                action={async () => undefined}
              />
            </Tile>
            <Tile
              name="AddLibraryExercisesPopup"
              docs="platform-sections-staff-courses-addlibraryexercisespopup"
              width={400}
              height={72}
            >
              <AddLibraryExercisesButton
                exercises={OVERVIEW_PICKABLE}
                addToLesson={async () => popupFormDone("lessonExercisesCopied")}
              />
            </Tile>
            <Tile name="PracticeFilters" docs="platform-sections-exercises-practicefilters" width={640} height={72}>
              <PracticeFilters
                filters={{
                  topics: [
                    { code: "TACTICS", label: "Táctica", parentCode: null },
                    { code: "FORK", label: "Horquilla", parentCode: "TACTICS" },
                  ],
                  levels: [{ slug: "intermedio", name: "Intermedio", range: "1200–1599" }],
                  libraryEmpty: false,
                }}
                choice={{ topicCode: "TACTICS", levelSlug: "intermedio" }}
                variant="home"
                accent
              />
            </Tile>
            <Tile name="MovePathPicker" docs="platform-shared-movepathpicker" width={960} height={640}>
              <MovePathPicker
                referenceId="g1x2y3z4"
                hint="Ve a la jugada desde la que empieza el ejercicio y pulsa «Usar esta posición»."
                value=""
                onChange={() => undefined}
                fetchPgn={async () => "1. e4 e5 2. Bc4 d6 3. Nf3 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0"}
              />
            </Tile>
          </Section>

          <Section title="Chess">
            <Tile name="ChessBoard" docs="chess-chessboard" width={400} height={408}>
              <ChessBoard
                position={{
                  fen: "1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17",
                  lastMove: ["d7", "b8"],
                  shapes: [
                    { orig: "d1", dest: "d8", brush: "green" },
                    { orig: "g5", dest: "d8", brush: "blue" },
                    { orig: "e8", brush: "red" },
                  ],
                }}
              />
            </Tile>
            <Tile name="PiecePlacementBoard" docs="chess-pieceplacementboard" width={400} height={408}>
              <PiecePlacementBoard placement="6k1/5ppp/8/8/8/8/5PPP/3R2K1" onPlacementChange={() => undefined} />
            </Tile>
            <Tile name="StaticDiagram" docs="chess-staticdiagram" width={400} height={448}>
              <StaticDiagram fen={LUCENA} caption="La posición de Lucena" look="material" />
            </Tile>
            <Tile name="MoveLinePreview" docs="chess-movelinepreview" width={400} height={88}>
              <MoveLinePreview line={OVERVIEW_LINE.line} suffix={OVERVIEW_LINE.result} />
            </Tile>
            <Tile name="PlayerStrip" docs="chess-game-viewer-playerstrip" width={400} height={88}>
              {/* PlayerStrip returns a fragment: this row stands in for the viewer's .game-viewer__player. */}
              <div className="overview__player">
                <PlayerStrip name="Fernanda Ríos" elo={2391} title="WGM" country="MEX" outcome="win" />
              </div>
            </Tile>
            <Tile name="PlayerAvatar" docs="chess-playeravatar" width={400} height={120}>
              <div className="overview__avatars">
                <PlayerAvatar {...FIXTURE_BOT.avatar} size="lg" />
                <PlayerAvatar initials="JC" tone={2} ring="GOLD" country="CUB" size="lg" />
                <PlayerAvatar initials="ZC" tone={3} ring="TRICOLOR" country="MEX" size="lg" />
                <PlayerAvatar {...FIXTURE_BOT.avatar} size="lg" busy />
              </div>
            </Tile>
            <Tile name="BotScoreboard" docs="chess-botscoreboard" width={400} height={136}>
              <BotScoreboard you={FIXTURE_STUDENT} rival={FIXTURE_BOT} wins={2} losses={1} draws={1} />
            </Tile>
            <Tile name="GameOverActions" docs="chess-game-viewer-gameoveractions" width={400} height={264}>
              <GameOverActions
                scoreboard={{ you: FIXTURE_STUDENT, rival: FIXTURE_BOT, wins: 3, losses: 1, draws: 0 }}
                rematch={async () => undefined}
                otherOpponentHref="/jugar/partida-libre"
                analysisBoardHref={null}
                onSave={() => undefined}
                onAnalyse={() => undefined}
              />
            </Tile>
            <Tile name="MoveTable" docs="chess-game-viewer-movetable" width={400} height={392}>
              {OPERA_OPENING_TREE && (
                <MoveTable tree={OPERA_OPENING_TREE} currentPath="0.0.0.0.0.0" onSelect={() => undefined} />
              )}
            </Tile>
            <Tile name="MoveTree" docs="chess-game-viewer-movetree" surface width={400} height={456}>
              {OPERA_OPENING_TREE && (
                <MoveTree tree={OPERA_OPENING_TREE} currentPath="0.0.0.0.0.0" onSelect={() => undefined} />
              )}
            </Tile>
            <Tile name="MoveNotes" docs="chess-game-viewer-movenotes" surface width={400} height={320}>
              {OPERA_OPENING_TREE && (
                <MoveNotes tree={OPERA_OPENING_TREE} currentPath="0.0.0.0.0.0" onSelect={() => undefined} />
              )}
            </Tile>
            <Tile name="EnginePanel" docs="chess-game-viewer-enginepanel" surface width={400} height={280}>
              <EnginePanel
                fen="r3r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 3 17"
                enabled
                onToggle={() => {}}
                state={{
                  loading: false,
                  outcome: null,
                  failed: false,
                  info: { multipv: 1, depth: 20, score: -2.24, mateIn: null, pv: [] },
                  lines: [
                    {
                      multipv: 1,
                      depth: 20,
                      score: -2.24,
                      mateIn: null,
                      pv: "g4e6 a3c3 b6c5 d4c5 g7c3 c4e6 e8e6 g2g3".split(" "),
                    },
                    {
                      multipv: 2,
                      depth: 20,
                      score: 1.01,
                      mateIn: null,
                      pv: "c3b5 c4f7 g8h8 c5b6 b5a3 b6c5 a3b5 f7e8".split(" "),
                    },
                    {
                      multipv: 3,
                      depth: 20,
                      score: 1.34,
                      mateIn: null,
                      pv: "c3b1 a3c1 b6d8 c1b1 g4f3 g2f3 b7b6 c5a3".split(" "),
                    },
                  ],
                }}
              />
            </Tile>
            <Tile name="GameReview" docs="chess-game-viewer-gamereview" surface width={400} height={688}>
              <GameReview
                pgn={OPERA_REVIEWED}
                canEdit
                white="Paul Morphy"
                black="Duque de Brunswick y conde Isouard"
                currentPath={Array(18).fill("0").join(".")}
                onSelectPath={() => {}}
                onPgnChange={() => {}}
              />
            </Tile>
            <Tile name="GameReviewChart" docs="chess-game-viewer-gamereviewchart" surface width={400} height={272}>
              <GameReviewChart
                evaluations={[
                  0.35, 0.3, 0.3, 0.43, 0.49, 0.59, 0.88, 0.89, 1.45, 1.25, 1.24, 1.14, 2.23, 2.3, 2.02, 1.93, 1.78,
                  1.91, 2.61, 2.52, 4.62, 4.84, 5.02, 5.17, 5.5, 5.59, 5.98, 6.03, 8.02, 3.08, 100, 100, 100, 100,
                ].map((score) => ({ score, mateIn: null }))}
                review={{
                  moves: [],
                  white: { accuracy: 95, inaccuracies: 1, mistakes: 0, blunders: 0, averageLoss: 32 },
                  black: { accuracy: 86, inaccuracies: 1, mistakes: 1, blunders: 0, averageLoss: 91 },
                  phases: { middlegame: 20, endgame: 33 },
                }}
                currentPly={18}
                onSelectPly={() => {}}
              />
            </Tile>
            <Tile name="ClassContentRenderer" docs="platform-shared-classcontentrenderer" width={400} height={420}>
              <ClassContentRenderer
                blocks={[
                  {
                    id: "b1",
                    kind: "TEXT",
                    visibility: "BEFORE",
                    text: "## El puente de Lucena\n\nCómo ganar con torre y peón cuando el rey propio está delante del peón.",
                  },
                  { id: "b6", kind: "FILE", visibility: "AFTER", caption: "Ejercicios para la semana" },
                ]}
              />
            </Tile>
            <Tile name="GameViewer" docs="chess-gameviewer" width={1040} height={848}>
              <div className="overview__board-frame">
                <GameViewer
                  pgn={OPERA_GAME}
                  players={{
                    white: { name: "Morphy, Paul", country: "USA" },
                    black: { name: "Duke Karl / Count Isouard" },
                  }}
                />
              </div>
            </Tile>
            <Tile name="GameTools" docs="chess-game-viewer-gametools" surface width={720} height={368}>
              <div className="overview__narrow">
                <GameTools
                  pgn={OPERA_OPENING}
                  currentPath="0.0.0.0.0.0"
                  canEdit
                  saveLabel="Guardado"
                  tab="comment"
                  onTabChange={() => undefined}
                  focusRequest={0}
                  white="Morphy, Paul"
                  black="Duke Karl / Count Isouard"
                  onSelectPath={() => undefined}
                  onPgnChange={() => undefined}
                  exerciseFromHereHref="#"
                />
              </div>
            </Tile>
          </Section>

          <Section title="Adventure">
            <Tile name="AdventureCover" docs="adventure-cover-adventurecover" width={1240} height={800}>
              <AdventureCover progress={fixtureAdventureProgress({ attemptsOnNext: 1 })} />
            </Tile>
            <Tile name="NotebookCard" docs="adventure-cover-notebookcard" width={460} height={560}>
              <div className="adventure" style={{ padding: 28, background: "var(--adventure-cream)" }}>
                <NotebookCard progress={fixtureAdventureProgress({ attemptsOnNext: 1 })} />
              </div>
            </Tile>
            <Tile name="Ticket" docs="adventure-cover-ticket" width={760} height={340}>
              <div
                className="adventure"
                style={{ display: "flex", gap: 36, padding: 36, background: "var(--adventure-wood)" }}
              >
                <div style={{ flex: 1 }}>
                  <Ticket
                    tone="free"
                    eyebrow="Galería de bots"
                    title="Partida libre"
                    description="Elige a cualquier bot de la galería y juega sin seguir la historia."
                    stub="Cualquier bot"
                    action={{ href: "/jugar/partida-libre", label: "Elegir un bot" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Ticket
                    tone="person"
                    eyebrow="Partida amistosa"
                    title="Contra una persona"
                    description="Reta a otro alumno de la plataforma."
                    stub="Admite dos"
                    soon
                  />
                </div>
              </div>
            </Tile>
            <Tile name="JourneyMiniature" docs="adventure-cover-journeyminiature" width={400} height={560}>
              <div className="adventure" style={{ background: "var(--adventure-cream-bright)", padding: 12 }}>
                <JourneyMiniature
                  adventure="cuaderno-del-viajero"
                  art={ADVENTURE_ART["cuaderno-del-viajero"]!.miniature.tall}
                  states={fixtureAdventureProgress().encounters.map((encounter) => encounter.state)}
                  variant="tall"
                  label="El viaje entero: el camino sube de la plaza del barrio al Palacio de los Escaques"
                />
              </div>
            </Tile>
            <Tile name="AdventureShelf" docs="adventure-shelf-adventureshelf" width={1240} height={880}>
              <AdventureShelf
                shelf={{
                  notebooks: [
                    {
                      slug: "cuaderno-del-viajero",
                      title: "El cuaderno del viajero",
                      place: "La ciudad",
                      total: 12,
                      beaten: 4,
                      stars: 9,
                    },
                  ],
                  coming: COMING_ADVENTURES,
                }}
              />
            </Tile>
            <Tile name="OpenNotebook" docs="adventure-shelf-opennotebook" width={460} height={500}>
              <div className="adventure" style={{ padding: 28, background: "var(--adventure-wood)" }}>
                <OpenNotebook
                  notebook={{
                    slug: "cuaderno-del-viajero",
                    title: "El cuaderno del viajero",
                    place: "La ciudad",
                    total: 12,
                    beaten: 4,
                    stars: 9,
                  }}
                />
              </div>
            </Tile>
            <Tile name="NotebookSpine" docs="adventure-shelf-notebookspine" width={260} height={380}>
              <ul
                className="adventure"
                style={{ margin: 0, padding: "32px 20px 8px", listStyle: "none", background: "var(--adventure-wood)" }}
              >
                <NotebookSpine notebook={COMING_ADVENTURES[0]!} />
              </ul>
            </Tile>
            <Tile name="AdventureMap" docs="adventure-map-adventuremap" width={1240} height={760}>
              {/* The map is seven thousand units tall: the tile shows the part around the fifth stamp. */}
              <div style={{ height: 720, overflow: "hidden" }}>
                <div style={{ marginTop: -3900 }}>
                  <AdventureMap
                    progress={fixtureAdventureProgress({ attemptsOnNext: 1 })}
                    zones={CUADERNO_DEL_VIAJERO.zones}
                    art={ADVENTURE_ART["cuaderno-del-viajero"]!}
                    player={{ initials: "AD", name: "Alumno Demo" }}
                    victory={null}
                    action={async () => undefined}
                    autoScroll={false}
                  />
                </div>
              </div>
            </Tile>
            <Tile name="EncounterStamp" docs="adventure-stamp-encounterstamp" width={760} height={330}>
              <div
                className="adventure"
                style={
                  {
                    position: "relative",
                    display: "flex",
                    height: 290,
                    background: "var(--adventure-paper)",
                    "--u": "1.1px",
                  } as CSSProperties
                }
              >
                {[1, 5, 6].map((order, index) => (
                  <div key={order} style={{ position: "relative", flex: 1 }}>
                    <EncounterStamp
                      encounter={fixtureAdventureProgress({ attemptsOnNext: 1 }).encounters[order - 1]!}
                      adventure="cuaderno-del-viajero"
                      total={12}
                      postmark={order === 1 ? "PLAZA" : "BIBLIOTECA"}
                      position={{ left: 50, top: 42, width: order === 5 ? 58 : 46, tilt: index === 1 ? -3 : 3 }}
                      onOpen={() => undefined}
                    />
                  </div>
                ))}
              </div>
            </Tile>
            <Tile name="NotePage" docs="adventure-note-page-notepage" width={420} height={400}>
              <div
                className="adventure"
                style={
                  {
                    position: "relative",
                    height: 360,
                    background: "var(--adventure-paper)",
                    "--u": "1.1px",
                  } as CSSProperties
                }
              >
                <NotePage
                  zone={CUADERNO_DEL_VIAJERO.zones[2]!}
                  number={3}
                  isReached
                  position={{ left: 50, top: 50, width: 90, rotation: 1.5 }}
                />
              </div>
            </Tile>
            <Tile name="Keepsake" docs="adventure-keepsakes-keepsake" width={640} height={420}>
              <div
                className="adventure"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 18,
                  padding: 18,
                  background: "var(--adventure-paper)",
                }}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} style={{ width: 70, justifySelf: "center", alignSelf: "center" }}>
                    <Keepsake adventure="cuaderno-del-viajero" order={index + 1} playerName="Alumno Demo" />
                  </div>
                ))}
              </div>
            </Tile>
            <Tile name="RivalCard" docs="adventure-rival-card-rivalcard" width={620} height={800}>
              <RivalCard
                adventure="cuaderno-del-viajero"
                encounter={fixtureAdventureProgress({ attemptsOnNext: 1 }).encounters[4]!}
                postmark="BIBLIOTECA"
                previousName="Toñito Garza"
                playerName="Alumno Demo"
                openGame={null}
                action={async () => undefined}
                onReplace={() => undefined}
                onCancel={() => undefined}
              />
            </Tile>
            <Tile name="PaperFrame" docs="adventure-paper-frame-paperframe" width={1040} height={900}>
              <PaperFrame
                zone="Biblioteca Central"
                place="Sala de lectura"
                page={3}
                attempt={2}
                mapHref="/jugar/aventura/cuaderno-del-viajero"
              >
                <div className="overview__board-frame">
                  <GameViewer
                    pgn={OPERA_GAME}
                    players={{
                      white: { name: "Morphy, Paul", country: "USA" },
                      black: { name: "Duke Karl / Count Isouard" },
                    }}
                  />
                </div>
              </PaperFrame>
            </Tile>
          </Section>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "platform/Overview",
  // The sheet already is a page: a Docs page around it would only draw it a
  // second time, inside a frame, so the sidebar opens it on the canvas.
  tags: ["!autodocs"],
  parameters: { nextjs: { navigation: { pathname: SHEET_PATH } } },
  render: (_args, { globals }) => <OverviewPage schemeChoice={globals.scheme} />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every piece of the platform at a glance, each linked to its own page. */
export const Overview: Story = {};
