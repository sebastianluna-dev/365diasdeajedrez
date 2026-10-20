import {
  ANALYSIS_BOARD_ENABLED,
  EXERCISES_ENABLED,
  MOVE_TRAINER_ENABLED,
  PLAY_ENABLED,
} from "@/constants/platform/features.const";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";

// Platform navigation: the tools menu behind the bar's 9-square button
// (2026-10-19, the Google-style header). The menu is EXCLUSIVE by role: each
// person sees only their own, not the sum. The same user can still be
// student, teacher and staff at once (roles are orthogonal in the database),
// so when they accumulate several the widest one rules — staff over teacher,
// teacher over student — and the other areas stop appearing in the menu.
// Hrefs always come from the route builders, never from loose strings.
//
// Mind what this is NOT: hiding a tool removes no permission. A teacher who
// types /estudios still gets in, because those pages are theirs as a user;
// what really decides is `requireTeacher`/`requireStaff` in every page and
// action, and nothing has changed there.

/** The drawing a tool carries in the menu, by what it is for (`NavArt`). */
export type PlatformNavArt =
  | "play"
  | "exercises"
  | "topics"
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
  | "import";

/** A tool of the menu: its name (also the page's name in the bar), its address and its drawing. */
export interface PlatformApp {
  label: string;
  href: string;
  art: PlatformNavArt;
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
  play: boolean;
  analysisBoard: boolean;
  trainer: boolean;
  /**
   * «Ejercicios» (`EXERCISES_ENABLED`). Off: nobody's. On, the teacher's bank,
   * the staff's (with its review, series and import) and the student's three
   * ways to solve: for every student (`"all"`, since phase 4: the library's
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
  play: PLAY_ENABLED,
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
    ? [{ label: "Tablero de análisis", href: platformRoutes.analysisBoard(), art: "board" }]
    : [];
}

function explorerApps(features: PlatformNavFeatures): PlatformApp[] {
  return [
    { label: "Explorador", href: platformRoutes.explorer, art: "explorer" },
    ...(features.analysisBoard && features.trainer
      ? [{ label: "Entrenador", href: platformRoutes.trainer, art: "trainer" as const }]
      : []),
  ];
}

/**
 * The student's (2026-10-19): «Jugar» and the three ways to solve first, then
 * the courses, the classes and the studies, and the tools at the end.
 */
function studentApps(features: PlatformNavFeatures, studentExercises: boolean): PlatformApp[] {
  return [
    ...(features.play ? [{ label: "Jugar", href: platformRoutes.play, art: "play" as const }] : []),
    ...(studentExercises
      ? [
          { label: "Ejercicios", href: platformRoutes.exercises, art: "exercises" as const },
          { label: "Ejercicios por tema", href: platformRoutes.exercisePractice(), art: "topics" as const },
          { label: "Puzzle Rush", href: platformRoutes.exerciseStorm, art: "rush" as const },
        ]
      : []),
    { label: "Cursos", href: platformRoutes.courses, art: "learn" },
    { label: "Clases", href: platformRoutes.classes, art: "teach" },
    { label: "Estudiar", href: platformRoutes.studies, art: "studies" },
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
    { label: "Panel del profesor", href: teacherRoutes.home, art: "panel" },
    { label: "Clases que imparto", href: teacherRoutes.classes, art: "teach" },
    { label: "Calendario", href: teacherRoutes.calendar, art: "calendar" },
    { label: "Mis alumnos", href: teacherRoutes.students, art: "students" },
    ...(features.exercises !== false
      ? [{ label: "Ejercicios", href: teacherRoutes.exercises, art: "exercises" as const }]
      : []),
    ...boardApp(features),
    { label: "Clases prediseñadas", href: teacherRoutes.classTemplates, art: "material" },
    { label: "Cursos", href: platformRoutes.courses, art: "learn" },
    { label: "Estudiar", href: platformRoutes.studies, art: "studies" },
    ...explorerApps(features),
    { label: "Mi ficha", href: teacherRoutes.profile, art: "profile" },
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
    { label: "Administración", href: staffRoutes.home, art: "adminpanel" },
    { label: "Clases", href: staffRoutes.classes, art: "calendar" },
    { label: "Alumnos", href: staffRoutes.students, art: "students" },
    { label: "Profesores", href: staffRoutes.teachers, art: "teachers" },
    { label: "Cursos", href: staffRoutes.courses, art: "learn" },
    ...(features.exercises !== false
      ? [
          { label: "Ejercicios", href: staffRoutes.exercises, art: "exercises" as const },
          { label: "Revisión", href: staffRoutes.exercisesReview, art: "review" as const },
          { label: "Series", href: staffRoutes.exerciseSeriesList, art: "series" as const },
          { label: "Importar", href: staffRoutes.exerciseImport, art: "import" as const },
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
