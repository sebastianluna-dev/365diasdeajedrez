import {
  ANALYSIS_BOARD_ENABLED,
  EXERCISES_ENABLED,
  MOVE_TRAINER_ENABLED,
  PLAY_ENABLED,
} from "@/constants/platform/features.const";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";

// Platform navigation. The menu is EXCLUSIVE by role: each person sees only
// their own, not the sum. The same user can still be student, teacher and
// staff at once (roles are orthogonal in the database), so when they
// accumulate several the widest one rules — staff over teacher, teacher over
// student — and the other areas stop appearing in the menu. Hrefs always
// come from the route builders, never from loose strings.
//
// Mind what this is NOT: hiding a group removes no permission. A teacher who
// types /estudios still gets in, because those pages are theirs as a user;
// what really decides is `requireTeacher`/`requireStaff` in every page and
// action, and nothing has changed there.

export interface PlatformNavItem {
  label: string;
  href: string;
}

/** A tool in a dropdown: its line says what it is for (M3), its icon is named by what it does. */
export interface PlatformNavMenuItem extends PlatformNavItem {
  description: string;
  icon: "analysis-board" | "explorer" | "trainer";
}

/**
 * A dropdown of the bar: a trigger with no address of its own, and the tools
 * under it. Named `PlatformNavDropdown` and not `PlatformNavMenu`, which is
 * the component that draws it.
 */
export interface PlatformNavDropdown {
  label: string;
  items: PlatformNavMenuItem[];
}

export type PlatformNavEntry = PlatformNavItem | PlatformNavDropdown;

/** Whether an entry is a dropdown rather than a link. */
export function isNavDropdown(entry: PlatformNavEntry): entry is PlatformNavDropdown {
  return "items" in entry;
}

export interface PlatformNavGroup {
  /** No label = base group, rendered without a heading. */
  label?: string;
  items: PlatformNavEntry[];
}

/** What is switched on, which decides «Jugar», «Ejercicios» and whether the tools are gathered. */
export interface PlatformNavFeatures {
  play: boolean;
  analysisBoard: boolean;
  trainer: boolean;
  /**
   * «Ejercicios» (`EXERCISES_ENABLED`). Off: nobody's. On, the teacher's bank
   * after «Clases que imparto», the staff's after «Cursos», and the student's
   * section after «Mis cursos»:
   * for every student (`"all"`, from phase 4, when the library gives anyone
   * something to solve) or only for one who has something there
   * (`"withTeacher"`, phases 1–3: an active teacher or a series given to them,
   * resolved per request by `getStudentExerciseAccess`).
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
  // Until the library (phase 4) only a teacher's series reach a student.
  exercises: EXERCISES_ENABLED ? "withTeacher" : false,
};

/**
 * The trainer is reached from courses and dashboard, so it takes no room here.
 * The explorer does: it is a cross-cutting tool, not the next step of any
 * other screen.
 */
export const STUDENT_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Inicio", href: platformRoutes.dashboard },
  { label: "Mis clases", href: platformRoutes.classes },
  { label: "Mis estudios", href: platformRoutes.studies },
  { label: "Mis cursos", href: platformRoutes.courses },
  { label: "Explorador", href: platformRoutes.explorer },
];

export const TEACHER_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Panel del profesor", href: teacherRoutes.home },
  { label: "Mis alumnos", href: teacherRoutes.students },
  { label: "Clases que imparto", href: teacherRoutes.classes },
  // Same destination as in the student menu: the explorer belongs to no role,
  // and what each person sees is decided by the visibility filter, not the menu.
  { label: "Explorador", href: platformRoutes.explorer },
  // «Mi ficha»: the teacher's public card. «Mi perfil» is everyone's profile,
  // reached from the user menu (planning decision §K, 2026-10-08).
  { label: "Mi ficha", href: teacherRoutes.profile },
];

export const STAFF_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Administración", href: staffRoutes.home },
  { label: "Alumnos", href: staffRoutes.students },
  { label: "Profesores", href: staffRoutes.teachers },
  { label: "Cursos", href: staffRoutes.courses },
  { label: "Clases", href: staffRoutes.classes },
];

/** «Jugar», for the student after their courses and for the teacher before the explorer. */
const PLAY_ITEM: PlatformNavItem = { label: "Jugar", href: platformRoutes.play };

/** The teacher's exercise bank, right after the classes they give. */
const TEACHER_EXERCISES_ITEM: PlatformNavItem = { label: "Ejercicios", href: teacherRoutes.exercises };

/** The student's «Ejercicios», right after their courses. */
const STUDENT_EXERCISES_ITEM: PlatformNavItem = { label: "Ejercicios", href: platformRoutes.exercises };

/** The academy's exercise bank — the library, the review queue and the academy's series — right after the courses. */
const STAFF_EXERCISES_ITEM: PlatformNavItem = { label: "Ejercicios", href: staffRoutes.exercises };

/** The staff's items with what is switched on: «Ejercicios» after «Cursos» (phase 4 of the exercises). */
function withStaffFeatures(items: PlatformNavItem[], features: PlatformNavFeatures): PlatformNavEntry[] {
  return items.flatMap((item): PlatformNavEntry[] =>
    item.href === staffRoutes.courses
      ? [item, ...(features.exercises !== false ? [STAFF_EXERCISES_ITEM] : [])]
      : [item],
  );
}

/**
 * Whether the menu needs to know if the student has something in
 * «Ejercicios» before it is drawn: only a student's, and only while the item
 * is drawn for some students and not others (`"withTeacher"`). The shell asks
 * the database only then.
 */
export function needsStudentExerciseAccess(
  roles: Pick<PlatformNavRoles, "isTeacher" | "isStaff">,
  features: PlatformNavFeatures = FEATURES,
): boolean {
  return !roles.isStaff && !roles.isTeacher && features.exercises === "withTeacher";
}

/**
 * «Herramientas» (planning decision §H, M3): the analysis board, the explorer
 * and — while it is on — the trainer, each with the line that says what it is
 * for.
 */
function toolsDropdown(features: PlatformNavFeatures): PlatformNavDropdown {
  return {
    label: "Herramientas",
    items: [
      {
        label: "Tablero de análisis",
        href: platformRoutes.analysisBoard(),
        description: "Pega un FEN o un PGN y analízalo con el módulo.",
        icon: "analysis-board",
      },
      {
        label: "Explorador",
        href: platformRoutes.explorer,
        description: "Busca una posición en tus partidas.",
        icon: "explorer",
      },
      ...(features.trainer
        ? [
            {
              label: "Entrenador",
              href: platformRoutes.trainer,
              description: "Repasa las jugadas de tus lecciones.",
              icon: "trainer" as const,
            },
          ]
        : []),
    ],
  };
}

/**
 * The student's or the teacher's items with what is switched on: «Jugar»
 * before the explorer, the explorer gathered into «Herramientas» once the
 * analysis board is on (until then it stays a link of its own, so it never
 * disappears), the teacher's «Ejercicios» after their classes and the
 * student's after their courses.
 */
function withFeatures(
  items: PlatformNavItem[],
  features: PlatformNavFeatures,
  studentExercises: boolean,
): PlatformNavEntry[] {
  return items.flatMap((item): PlatformNavEntry[] => {
    if (item.href === teacherRoutes.classes) {
      return [item, ...(features.exercises !== false ? [TEACHER_EXERCISES_ITEM] : [])];
    }
    if (item.href === platformRoutes.courses) return [item, ...(studentExercises ? [STUDENT_EXERCISES_ITEM] : [])];
    if (item.href !== platformRoutes.explorer) return [item];
    return [...(features.play ? [PLAY_ITEM] : []), features.analysisBoard ? toolsDropdown(features) : item];
  });
}

/**
 * Pure (testable) function that picks the right menu. It always returns ONE
 * single group: the list of the widest role the user has. The student's and
 * the teacher's gain «Jugar» and «Herramientas» with their switches
 * (`features`); the staff's menu is the panel's and has neither, only
 * «Ejercicios» after «Cursos» with its switch.
 *
 * It still returns an array (and not a loose group) so as not to force the
 * component to change shape if one day there is more than one again.
 */
export function buildPlatformNavGroups(
  roles: PlatformNavRoles,
  features: PlatformNavFeatures = FEATURES,
): PlatformNavGroup[] {
  if (roles.isStaff) return [{ label: "Administración", items: withStaffFeatures(STAFF_NAV_ITEMS, features) }];
  if (roles.isTeacher) return [{ label: "Profesor", items: withFeatures(TEACHER_NAV_ITEMS, features, false) }];
  const studentExercises =
    features.exercises === "all" || (features.exercises === "withTeacher" && roles.hasExerciseSource === true);
  return [{ items: withFeatures(STUDENT_NAV_ITEMS, features, studentExercises) }];
}

/**
 * Href of the item that should appear active, or null. It keeps the LONGEST
 * match: `/profesor` and `/profesor/alumnos` are different items and a plain
 * prefix would light up both at once.
 */
export function activeNavHref(groups: PlatformNavGroup[], pathname: string): string | null {
  let best: string | null = null;
  for (const group of groups) {
    // A dropdown's tools compete like any item; the trigger lights up with them.
    for (const item of group.items.flatMap((entry) => (isNavDropdown(entry) ? entry.items : [entry]))) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (best === null || item.href.length > best.length)) best = item.href;
    }
  }
  return best;
}
