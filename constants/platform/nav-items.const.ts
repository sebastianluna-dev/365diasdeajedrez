import {
  ANALYSIS_BOARD_ENABLED,
  EXERCISES_ENABLED,
  MOVE_TRAINER_ENABLED,
  PLAY_PAGE_ENABLED,
} from "@/constants/platform/features.const";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";

// Platform navigation: the tools menu behind the bar's 9-square button
// (2026-10-19, the Google-style header) and «Herramientas» (`/herramientas`,
// 2026-10-25), the page that shows the same tools with what each one does.
// Both read this one list, so they cannot disagree. The menu is EXCLUSIVE by
// role: each person sees only their own, not the sum. The same user can still
// be student, teacher and staff at once (roles are orthogonal in the
// database), so when they accumulate several the widest one rules — staff
// over teacher, teacher over student — and the other areas stop appearing in
// the menu. Hrefs always come from the route builders, never from loose strings.
//
// Mind what this is NOT: hiding a tool removes no permission. A teacher who
// types /estudios still gets in, because those pages are theirs as a user;
// what really decides is `requireTeacher`/`requireStaff` in every page and
// action, and nothing has changed there.

/** The drawing a tool carries in the menu, by what it is for (`NavArt`). */
export type PlatformNavArt =
  | "play"
  | "exercises"
  | "rush"
  | "learn"
  | "studies"
  | "teach"
  | "material"
  | "panel"
  | "calendar"
  | "students"
  | "profile"
  | "board"
  | "explorer"
  | "trainer"
  | "adminpanel"
  | "teachers"
  | "review"
  | "series"
  | "import"
  /** Not a tool: the home page's own drawing, the academy's mark (`pageNameOf`). */
  | "home"
  /** Not a tool: «Herramientas», the page of every tool — nine squares, as the menu's button (`pageNameOf`). */
  | "tools";

/** What the bar names a page with: its name, its address and its drawing. */
export interface PlatformPageMark {
  label: string;
  href: string;
  art: PlatformNavArt;
}

/**
 * What a tool is for: the row of «Herramientas» it sits in. The student's
 * practise, learn and analyse; the teacher's teach; the staff's run the
 * academy and its exercise bank.
 */
export type PlatformAppGroup = "practice" | "teach" | "manage" | "bank" | "learn" | "analyze";

/**
 * A tool of the menu: its name (also the page's name in the bar), its address
 * and its drawing; and, for «Herramientas», its row and its one line.
 */
export interface PlatformApp extends PlatformPageMark {
  group: PlatformAppGroup;
  description: string;
}

/** The role's tools, in order: the first `PLATFORM_SHORTCUTS` are «Tus atajos», the rest go under them. */
export interface PlatformApps {
  shortcuts: PlatformApp[];
  more: PlatformApp[];
}

/** How many tools «Tus atajos» holds: two rows of three. */
export const PLATFORM_SHORTCUTS = 6;

/** What is switched on, which decides «Jugar», «Ejercicios» and the tools. */
export interface PlatformNavFeatures {
  /**
   * «Jugar» (`PLAY_PAGE_ENABLED`): both play switches, because every game
   * against a bot is an encounter of the adventure (2026-10-25).
   */
  play: boolean;
  analysisBoard: boolean;
  trainer: boolean;
  /**
   * «Ejercicios» (`EXERCISES_ENABLED`). Off: nobody's. On, the teacher's bank,
   * the staff's (with its review, series and import) and the student's two
   * tools, «Ejercicios» (its topics in its side column since 2026-10-23) and
   * «Puzzle Rush»: for every student (`"all"`, since phase 4: the library's
   * practice and the academy's series give anyone something to solve) or only
   * for one who has something there (`"withTeacher"`, phases 1–3: an active
   * teacher or a series given to them, resolved per request by
   * `getStudentExerciseAccess`; kept as the rule's other value).
   */
  exercises: "all" | "withTeacher" | false;
}

/** Who is asking, as the menu hears it. */
export interface PlatformNavRoles {
  isTeacher: boolean;
  isStaff: boolean;
  /**
   * The student has something in «Ejercicios» — an active teacher or a series
   * given to them (`getStudentExerciseAccess`): what `"withTeacher"` asks.
   */
  hasExerciseSource?: boolean;
}

const FEATURES: PlatformNavFeatures = {
  play: PLAY_PAGE_ENABLED,
  analysisBoard: ANALYSIS_BOARD_ENABLED,
  trainer: MOVE_TRAINER_ENABLED,
  // Since the library (phase 4) every student has «Práctica libre» and the academy's series to solve.
  exercises: EXERCISES_ENABLED ? "all" : false,
};

/**
 * The tools everyone has: the analysis board, the explorer and — while it is
 * on — the trainer, which the board's switch brings (without it, the explorer
 * alone, as before the board existed).
 */
function boardApp(features: PlatformNavFeatures): PlatformApp[] {
  return features.analysisBoard
    ? [
        {
          label: "Tablero de análisis",
          href: platformRoutes.analysisBoard(),
          art: "board",
          group: "analyze",
          description: "Carga una partida o una posición y analízala.",
        },
      ]
    : [];
}

function explorerApps(features: PlatformNavFeatures): PlatformApp[] {
  const explorer: PlatformApp = {
    label: "Explorador",
    href: platformRoutes.explorer,
    art: "explorer",
    group: "analyze",
    description: "Qué se juega en cada posición de la apertura.",
  };
  const trainer: PlatformApp = {
    label: "Entrenador",
    href: platformRoutes.trainer,
    art: "trainer",
    group: "analyze",
    description: "Repite las líneas de tus cursos hasta saberlas.",
  };
  return features.analysisBoard && features.trainer ? [explorer, trainer] : [explorer];
}

/** «Cursos» and «Estudiar», the student's and the teacher's alike. */
const COURSES: PlatformApp = {
  label: "Cursos",
  href: platformRoutes.courses,
  art: "learn",
  group: "learn",
  description: "Tus cursos y el catálogo de la academia.",
};

const STUDIES: PlatformApp = {
  label: "Estudiar",
  href: platformRoutes.studies,
  art: "studies",
  group: "learn",
  description: "Tus estudios: partidas, notas y diagramas.",
};

/**
 * The student's (2026-10-19): «Jugar» and the two ways to solve first, then
 * the courses, the classes and the studies, and the tools at the end. Since
 * 2026-10-25 «Ejercicios por tema» is no tool of its own: the topic is chosen
 * in «Ejercicios»' side column, and its old address redirects there.
 */
function studentApps(features: PlatformNavFeatures, studentExercises: boolean): PlatformApp[] {
  const play: PlatformApp = {
    label: "Jugar",
    href: platformRoutes.play,
    art: "play",
    group: "practice",
    description: "El modo aventura: un rival por página, sin reloj.",
  };
  const exercises: PlatformApp[] = [
    {
      label: "Ejercicios",
      href: platformRoutes.exercises,
      art: "exercises",
      group: "practice",
      description: "Los de tus clases, las series y la biblioteca, por tema.",
    },
    {
      label: "Puzzle Rush",
      href: platformRoutes.exerciseStorm,
      art: "rush",
      group: "practice",
      description: "Contra el reloj o hasta el tercer error.",
    },
  ];
  return [
    ...(features.play ? [play] : []),
    ...(studentExercises ? exercises : []),
    COURSES,
    {
      label: "Clases",
      href: platformRoutes.classes,
      art: "teach",
      group: "learn",
      description: "Tus clases, el enlace y lo que te dejaron.",
    },
    STUDIES,
    ...boardApp(features),
    ...explorerApps(features),
  ];
}

/**
 * The teacher's (2026-10-19): their day — the panel, the classes, the
 * calendar, the students, the bank and the board — as their shortcuts; the
 * academy's classes, the courses, their studies, the explorer and «Mi ficha»
 * under them. No «Jugar»: the owner's choice, the page stays theirs at /jugar.
 */
function teacherApps(features: PlatformNavFeatures): PlatformApp[] {
  return [
    {
      label: "Panel del profesor",
      href: teacherRoutes.home,
      art: "panel",
      group: "teach",
      description: "Tu día: las clases de hoy y lo pendiente.",
    },
    {
      label: "Clases que imparto",
      href: teacherRoutes.classes,
      art: "teach",
      group: "teach",
      description: "Las clases que te asignan: su contenido, la lista y el cierre.",
    },
    {
      label: "Calendario",
      href: teacherRoutes.calendar,
      art: "calendar",
      group: "teach",
      description: "Tus clases por día, semana y mes.",
    },
    {
      label: "Mis alumnos",
      href: teacherRoutes.students,
      art: "students",
      group: "teach",
      description: "Los alumnos que tienes asignados.",
    },
    ...(features.exercises !== false
      ? [
          {
            label: "Ejercicios",
            href: teacherRoutes.exercises,
            art: "exercises" as const,
            group: "teach" as const,
            description: "Los que preparas para tus alumnos y sus series.",
          },
        ]
      : []),
    ...boardApp(features),
    {
      label: "Clases prediseñadas",
      href: teacherRoutes.classTemplates,
      art: "material",
      group: "teach",
      description: "Clases ya escritas por la academia.",
    },
    COURSES,
    STUDIES,
    ...explorerApps(features),
    {
      label: "Mi ficha",
      href: teacherRoutes.profile,
      art: "profile",
      group: "teach",
      description: "Cómo te ven tus alumnos.",
    },
  ];
}

/**
 * The staff's: the panel, the classes, the people and the courses, then the
 * academy's exercise bank with its review queue, its series and the import,
 * each reached straight from the menu (phase 4 of the exercises, behind its
 * switch). No «Jugar» and no tools: the panel's menu.
 */
function staffApps(features: PlatformNavFeatures): PlatformApp[] {
  return [
    {
      label: "Administración",
      href: staffRoutes.home,
      art: "adminpanel",
      group: "manage",
      description: "Alumnos, profesores y contenido de la plataforma.",
    },
    {
      label: "Clases",
      href: staffRoutes.classes,
      art: "calendar",
      group: "manage",
      description: "Programa, reprograma y cancela las clases de la academia.",
    },
    {
      label: "Alumnos",
      href: staffRoutes.students,
      art: "students",
      group: "manage",
      description: "Las cuentas, su acceso y su profesor asignado.",
    },
    {
      label: "Profesores",
      href: staffRoutes.teachers,
      art: "teachers",
      group: "manage",
      description: "Quién enseña en la academia y sus clases.",
    },
    {
      label: "Cursos",
      href: staffRoutes.courses,
      art: "learn",
      group: "manage",
      description: "Los cursos de la academia, sus capítulos y lecciones.",
    },
    ...(features.exercises !== false
      ? [
          {
            label: "Ejercicios",
            href: staffRoutes.exercises,
            art: "exercises" as const,
            group: "bank" as const,
            description: "La biblioteca de la academia.",
          },
          {
            label: "Revisión",
            href: staffRoutes.exercisesReview,
            art: "review" as const,
            group: "bank" as const,
            description: "Las propuestas de los profesores, para aprobar o devolver.",
          },
          {
            label: "Series",
            href: staffRoutes.exerciseSeriesList,
            art: "series" as const,
            group: "bank" as const,
            description: "Listas de ejercicios de la biblioteca para los alumnos.",
          },
          {
            label: "Importar",
            href: staffRoutes.exerciseImport,
            art: "import" as const,
            group: "bank" as const,
            description: "Un archivo PGN, un ejercicio por partida.",
          },
        ]
      : []),
  ];
}

/**
 * Whether the menu needs to know if the student has something in
 * «Ejercicios» before it is drawn: only a student's, and only while the tools
 * are drawn for some students and not others (`"withTeacher"`). The shell asks
 * the database only then.
 */
export function needsStudentExerciseAccess(
  roles: Pick<PlatformNavRoles, "isTeacher" | "isStaff">,
  features: PlatformNavFeatures = FEATURES,
): boolean {
  return !roles.isStaff && !roles.isTeacher && features.exercises === "withTeacher";
}

/**
 * Pure (testable) function that picks the role's tools: the widest role's
 * list, staff over teacher over student, cut into «Tus atajos» and the rest.
 */
export function buildPlatformApps(roles: PlatformNavRoles, features: PlatformNavFeatures = FEATURES): PlatformApps {
  const studentExercises =
    features.exercises === "all" || (features.exercises === "withTeacher" && roles.hasExerciseSource === true);
  const apps = roles.isStaff
    ? staffApps(features)
    : roles.isTeacher
      ? teacherApps(features)
      : studentApps(features, studentExercises);
  return { shortcuts: apps.slice(0, PLATFORM_SHORTCUTS), more: apps.slice(PLATFORM_SHORTCUTS) };
}

/** A row of «Herramientas»: what its tools are for, in its name and one line. */
export interface PlatformAppGroupInfo {
  key: PlatformAppGroup;
  label: string;
  description: string;
}

/** The rows of «Herramientas», in the order they are drawn; a role draws only those it has tools in. */
export const PLATFORM_APP_GROUPS: readonly PlatformAppGroupInfo[] = [
  { key: "practice", label: "Practicar", description: "Para resolver y jugar, a tu ritmo." },
  { key: "teach", label: "Enseñar", description: "Tus clases, tus alumnos y lo que preparas." },
  { key: "manage", label: "Administrar", description: "Las clases, las personas y los cursos de la academia." },
  {
    key: "bank",
    label: "Banco de ejercicios",
    description: "La biblioteca, su revisión, las series y la importación.",
  },
  { key: "learn", label: "Aprender", description: "Lo que te enseñan y lo que guardas." },
  { key: "analyze", label: "Analizar", description: "Para pensar una posición o una línea." },
];

/** A tool as «Herramientas» draws it: the tool, and whether it is one of «Tus atajos». */
export interface PlatformToolTile extends PlatformApp {
  isShortcut: boolean;
}

/** A row of «Herramientas» with its tools, in the menu's order. */
export interface PlatformToolGroup extends PlatformAppGroupInfo {
  tools: PlatformToolTile[];
}

/**
 * The role's tools as «Herramientas» shows them: by what they are for, each
 * row in `PLATFORM_APP_GROUPS`' order with its tools in the menu's, and every
 * tool of «Tus atajos» marked. A row with no tool is left out.
 */
export function groupPlatformApps(apps: PlatformApps): PlatformToolGroup[] {
  const tiles: PlatformToolTile[] = [
    ...apps.shortcuts.map((app) => ({ ...app, isShortcut: true })),
    ...apps.more.map((app) => ({ ...app, isShortcut: false })),
  ];
  return PLATFORM_APP_GROUPS.map((group) => ({
    ...group,
    tools: tiles.filter((tile) => tile.group === group.key),
  })).filter((group) => group.tools.length > 0);
}

/**
 * The home page in the bar (2026-10-23, the new design system's «Inicio»):
 * not a tool of the menu — no tile leads to it, the wordmark and the avatar
 * do —, but the bar names it as it names a tool's page.
 */
export const HOME_PAGE: PlatformPageMark = { label: "Inicio", href: platformRoutes.dashboard, art: "home" };

/**
 * «Herramientas» in the bar (2026-10-25): the page of every tool, reached
 * from the foot of the menu. Not a tool either, so no tile lights up on it.
 */
export const TOOLS_PAGE: PlatformPageMark = { label: "Herramientas", href: platformRoutes.tools, art: "tools" };

/**
 * «Ajustes» in the bar (2026-10-25, the new design system's «Ajustes A»): no
 * tool either — the avatar's menu leads to it —, named with the academy's
 * mark, as the home page is.
 */
export const SETTINGS_PAGE: PlatformPageMark = { label: "Ajustes", href: platformRoutes.settings, art: "home" };

/** The pages the bar names that are no tool's, by their address. */
const PAGES_OF_NO_TOOL: readonly PlatformPageMark[] = [HOME_PAGE, TOOLS_PAGE, SETTINGS_PAGE];

/**
 * The tool of the page on screen, or null: the one whose address is the
 * page's or the LONGEST that starts it — `/profesor` and `/profesor/alumnos`
 * are different tools and a plain prefix would light up both at once. Its
 * name is the page's name in the bar, and its tile is marked in the menu.
 */
export function activeApp(apps: PlatformApps, pathname: string): PlatformApp | null {
  const pathOf = (app: PlatformApp) => app.href.split("?")[0] ?? app.href;
  let best: PlatformApp | null = null;
  for (const app of [...apps.shortcuts, ...apps.more]) {
    const path = pathOf(app);
    const matches = pathname === path || pathname.startsWith(`${path}/`);
    if (matches && (best === null || path.length > pathOf(best).length)) best = app;
  }
  return best;
}

/**
 * What the bar names the page on screen with: its tool (`activeApp`), or
 * «Inicio» on the home page, «Herramientas» on the page of every tool and
 * «Ajustes» on the settings, which are no tool's. Null elsewhere (a lesson),
 * where the wordmark stays. The menu marks a tile by `activeApp` alone, so no
 * tile lights up on those pages.
 */
export function pageNameOf(apps: PlatformApps, pathname: string): PlatformPageMark | null {
  return activeApp(apps, pathname) ?? PAGES_OF_NO_TOOL.find((page) => page.href === pathname) ?? null;
}
