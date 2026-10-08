import { type CSSProperties, Fragment, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ChessMoveQualityIcon } from "@/components/chess/chess-move-quality-icon.comp";
import { EnginePanel } from "@/components/chess/game-viewer/engine-panel.comp";
import { GameReviewChart } from "@/components/chess/game-viewer/game-review-chart.comp";
import { GameReview } from "@/components/chess/game-viewer/game-review.comp";
import { GameTools } from "@/components/chess/game-viewer/game-tools.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { MoveContextMenu } from "@/components/chess/game-viewer/move-context-menu.comp";
import { MoveTable } from "@/components/chess/game-viewer/move-table.comp";
import { MoveTree } from "@/components/chess/game-viewer/move-tree.comp";
import { PlayerStrip } from "@/components/chess/game-viewer/player-strip.comp";
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
import { MeetingAccess } from "@/components/platform/sections/classes/class-detail/meeting-access.comp";
import { ClassCard } from "@/components/platform/sections/classes/classes-list/class-card.comp";
import { CourseCard } from "@/components/platform/sections/courses/course-card.comp";
import { LevelScale } from "@/components/platform/sections/courses/course-info/level-scale.comp";
import { LessonSkeleton } from "@/components/platform/sections/courses/lesson-view/lesson-skeleton.comp";
import { OutlineList } from "@/components/platform/sections/courses/lesson-view/outline-list.comp";
import { MyCourseCard } from "@/components/platform/sections/courses/my-courses/my-course-card.comp";
import { StatsCards } from "@/components/platform/sections/dashboard/activity-stats/stats-cards.comp";
import { ExplorerGames } from "@/components/platform/sections/explorer/explorer-games.comp";
import { ExplorerNextMoves } from "@/components/platform/sections/explorer/explorer-next-moves.comp";
import { PlatformNav } from "@/components/platform/sections/shell/platform-nav.comp";
import { PlatformSearch } from "@/components/platform/sections/shell/platform-search.comp";
import { AuthorAvatar } from "@/components/platform/sections/staff/courses/authors-manager/author-avatar.comp";
import { CourseSourceForm } from "@/components/platform/sections/staff/courses/course-sources/course-source-form.comp";
import { NewCourseForm } from "@/components/platform/sections/staff/courses/new-course/new-course-form.comp";
import { StaffEditorHead } from "@/components/platform/sections/staff/courses/staff-editor.comp";
import { StaffPanel } from "@/components/platform/sections/staff/courses/staff-panel.comp";
import { StaffTabs } from "@/components/platform/sections/staff/courses/staff-tabs.comp";
import { courseTabs } from "@/components/platform/sections/staff/courses/staff-tabs.const";
import { SyllabusList } from "@/components/platform/sections/staff/courses/syllabus-list/syllabus-list.comp";
import { TempPasswordNotice } from "@/components/platform/sections/staff/students/temp-password-notice.comp";
import { NewStudyForm } from "@/components/platform/sections/studies/studies-list/new-study/new-study-form.comp";
import { ActivityList } from "@/components/platform/shared/activity-list/activity-list.comp";
import { BoardLoading } from "@/components/platform/shared/board-loading/board-loading.comp";
import { BoardSkeleton } from "@/components/platform/shared/board-skeleton/board-skeleton.comp";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { FormField, FormFieldset } from "@/components/platform/shared/form-field/form-field.comp";
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
import { buildPlatformNavGroups } from "@/constants/platform/nav-items.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { staffRoutes } from "@/lib/platform-routes";
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
const CLASS_OPENS = new Date(Date.now() + 27 * 60 * 60_000).toISOString();

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
            <Tile name="FormField" docs="platform-shared-formfield" width={400} height={296}>
              <div className="overview__stack">
                <FormField label="Nombre para mostrar" hint="Cómo lo verán sus alumnos.">
                  <input type="text" name="displayName" defaultValue="Fernanda Ríos" required />
                </FormField>
                <FormField label="Email" error="Ya existe una cuenta con ese email.">
                  <input type="email" name="email" defaultValue="fernanda@ejemplo.com" required />
                </FormField>
              </div>
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
                name="levels"
                aria-label="Niveles"
                defaultValue={["INITIAL"]}
                options={[
                  { value: "INITIAL", label: "Inicial", description: "Quien aprende a mover las piezas." },
                  { value: "INTERMEDIATE", label: "Intermedio", description: "Quien ya juega torneos." },
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
            <Tile name="FormFieldset" docs="platform-shared-formfield" width={400} height={248}>
              <FormFieldset legend="Tipos de contenido">
                <PlatformCheckCards
                  name="contentTypes"
                  aria-label="Tipos de contenido"
                  layout="line"
                  defaultValue={["ENDGAMES"]}
                  options={[
                    { value: "OPENINGS", label: "Aperturas" },
                    { value: "TACTICS", label: "Táctica" },
                    { value: "ENDGAMES", label: "Finales" },
                  ]}
                />
              </FormFieldset>
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
              <OptionalFields>
                <FormField label="Evento">
                  <input type="text" name="event" defaultValue="Nacional Abierto 2026" />
                </FormField>
                <FormField label="Ronda">
                  <input type="text" name="round" />
                </FormField>
              </OptionalFields>
            </Tile>
            <Tile name="PlatformSearch" docs="platform-sections-shell-platformsearch" surface width={400} height={144}>
              <PlatformSearch />
            </Tile>
            <Tile name="GameFields" docs="platform-shared-gamefields" width={720} height={840}>
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
                description="Cuando tu profesor agende una clase aparecerá aquí."
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
              name="MeetingAccess"
              docs="platform-sections-classes-class-detail-meetingaccess"
              width={400}
              height={144}
            >
              <MeetingAccess meetingVisibleFromIso={CLASS_OPENS} providerLabel="Zoom" />
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
            <Tile name="ClassCard" docs="platform-sections-classes-classes-list-classcard" width={720} height={288}>
              <ClassCard
                classSummary={{
                  id: "c-101",
                  title: "Finales de torres: la posición de Lucena",
                  teacherName: "Fernanda Ríos",
                  scheduledAtIso: "2026-10-09T00:00:00.000Z",
                  dateLabel: "8 de octubre, 2026",
                  timeLabel: "18:00 h",
                  durationMin: 60,
                  statusCode: "SCHEDULED",
                  statusLabel: "Programada",
                  href: "#",
                }}
              />
            </Tile>
          </Section>

          <Section title="Navigation">
            <Tile name="StaffTabs" docs="platform-sections-staff-courses-stafftabs" surface width={480} height={160}>
              <StaffTabs tabs={courseTabs({ courseId: "4812", chapterCount: 6, gameCount: 148 })} />
            </Tile>
            <Tile name="OutlineList" docs="platform-sections-courses-lesson-view-outlinelist" width={400} height={304}>
              {/* `position: static`: from 1280px the column's sheet pins .lesson-outline to the window. */}
              <nav className="lesson-outline overview__outline" aria-label="Lecciones del capítulo">
                <div className="lesson-outline__body">
                  <OutlineList
                    chapters={[
                      {
                        id: "capitulo-2",
                        name: "Finales de torre",
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
                      },
                    ]}
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
            <Tile name="PlatformNav" docs="platform-sections-shell-platformnav" surface width={960} height={152}>
              <PlatformNav groups={buildPlatformNavGroups({ isTeacher: false, isStaff: true })} />
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
                buttonClassName="new-study__slot"
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
            <Tile name="StaticDiagram" docs="chess-staticdiagram" width={400} height={448}>
              <StaticDiagram fen={LUCENA} caption="La posición de Lucena" />
            </Tile>
            <Tile name="PlayerStrip" docs="chess-game-viewer-playerstrip" width={400} height={88}>
              {/* PlayerStrip returns a fragment: this row stands in for the viewer's .game-viewer__player. */}
              <div className="overview__player">
                <PlayerStrip name="Fernanda Ríos" elo={2391} title="WGM" country="MEX" outcome="win" />
              </div>
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
            <Tile name="ClassContentRenderer" docs="platform-shared-classcontentrenderer" width={400} height={272}>
              <ClassContentRenderer
                blocks={[
                  {
                    id: "b1",
                    kind: "TEXT",
                    text: "## El puente de Lucena\n\nCómo ganar con torre y peón cuando el rey propio está delante del peón.",
                  },
                  { id: "b6", kind: "FILE", caption: "Ejercicios para la semana" },
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
                />
              </div>
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
