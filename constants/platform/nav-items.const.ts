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

/** The drawing an entry of the menu bar carries, by what the entry is for (`NavArt`). */
export type PlatformNavArt = "play" | "exercises" | "learn" | "tools" | "teach" | "material";

export interface PlatformNavItem {
  label: string;
  href: string;
  /** Its drawing in the menu bar, beside its name; an entry without one is drawn as text. */
  art?: PlatformNavArt;
}

/** An entry of a dropdown: its line says what it is for (M3), its icon is named by what it does. */
export interface PlatformNavMenuItem extends PlatformNavItem {
  description: string;
  icon:
    | "analysis-board"
    | "explorer"
    | "trainer"
    | "exercises"
    | "topics"
    | "rush"
    | "courses"
    | "studies"
    | "classes"
    | "panel"
    | "students"
    | "profile"
    | "templates";
}

/**
 * A dropdown of the bar: a trigger with no address of its own, and the tools
 * under it. Named `PlatformNavDropdown` and not `PlatformNavMenu`, which is
 * the component that draws it.
 */
export interface PlatformNavDropdown {
  label: string;
  items: PlatformNavMenuItem[];
  /** Its drawing in the menu bar, beside its name; a section without one is drawn as text. */
  art?: PlatformNavArt;
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
   * section after «Mis cursos»: for every student (`"all"`, since phase 4:
   * the library's practice and the academy's series give anyone something to
   * solve) or only for one who has something there (`"withTeacher"`, phases
   * 1–3: an active teacher or a series given to them, resolved per request by
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
 * The teacher's «Enseñar» (2026-10-19): their panel, the classes they give,
 * their students and «Mi ficha», the public card their students see («Mi
 * perfil» is everyone's, in the user menu, planning decision §K).
 */
const TEACHER_TEACH_DROPDOWN: PlatformNavDropdown = {
  label: "Enseñar",
  art: "teach",
  items: [
    {
      label: "Panel del profesor",
      href: teacherRoutes.home,
      description: "Lo que tienes hoy: clases, pendientes y alumnos.",
      icon: "panel",
    },
    {
      label: "Clases que imparto",
      href: teacherRoutes.classes,
      description: "Próximas, por finalizar y pasadas.",
      icon: "classes",
    },
    {
      label: "Mis alumnos",
      href: teacherRoutes.students,
      description: "Sus fichas, sus estudios y sus ejercicios.",
      icon: "students",
    },
    {
      label: "Mi ficha",
      href: teacherRoutes.profile,
      description: "Lo que tus alumnos ven de ti.",
      icon: "profile",
    },
  ],
};

/**
 * The teacher's «Material» (2026-10-19): their exercise bank (with its switch)
 * and the academy's ready-made classes, to start one from.
 */
function teacherMaterialDropdown(features: PlatformNavFeatures): PlatformNavDropdown {
  return {
    label: "Material",
    art: "material",
    items: [
      ...(features.exercises !== false
        ? [
            {
              label: "Ejercicios",
              href: teacherRoutes.exercises,
              description: "Tus ejercicios, tus series y la biblioteca.",
              icon: "exercises" as const,
            },
          ]
        : []),
      {
        label: "Clases prediseñadas",
        href: teacherRoutes.classTemplates,
        description: "Clases ya escritas, para partir de una.",
        icon: "templates",
      },
    ],
  };
}

/**
 * The teacher's «Aprender» (2026-10-19): the courses, which a teacher studies
 * and cites too, and their own studies, where the games of their classes live.
 */
const TEACHER_LEARN_DROPDOWN: PlatformNavDropdown = {
  label: "Aprender",
  art: "learn",
  items: [
    {
      label: "Cursos",
      href: platformRoutes.courses,
      description: "Los cursos de la academia, para estudiar y citar sus lecciones.",
      icon: "courses",
    },
    {
      label: "Estudiar",
      href: platformRoutes.studies,
      description: "Tus estudios y sus partidas.",
      icon: "studies",
    },
  ],
};

export const STAFF_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Administración", href: staffRoutes.home },
  { label: "Alumnos", href: staffRoutes.students },
  { label: "Profesores", href: staffRoutes.teachers },
  { label: "Cursos", href: staffRoutes.courses },
  { label: "Clases", href: staffRoutes.classes },
];

/** «Jugar», the student's first link (never the teacher's, since 2026-10-19). */
const PLAY_ITEM: PlatformNavItem = { label: "Jugar", href: platformRoutes.play, art: "play" };

/** The explorer as a link of its own, while there is no «Herramientas» to gather it. */
const EXPLORER_ITEM: PlatformNavItem = { label: "Explorador", href: platformRoutes.explorer };

/**
 * The student's «Ejercicios» (2026-10-18): the board of any topic, the one of
 * a chosen topic, and «Puzzle Rush», as many as fit in the time.
 */
const STUDENT_EXERCISES_DROPDOWN: PlatformNavDropdown = {
  label: "Ejercicios",
  art: "exercises",
  items: [
    {
      label: "Ejercicios",
      href: platformRoutes.exercises,
      description: "Resuelve ejercicios de todos los temas.",
      icon: "exercises",
    },
    {
      label: "Ejercicios por tema",
      href: platformRoutes.exercisePractice(),
      description: "Elige un tema y un nivel.",
      icon: "topics",
    },
    {
      label: "Puzzle Rush",
      href: platformRoutes.exerciseStorm,
      description: "Resuelve todos los que puedas antes de que acabe el tiempo.",
      icon: "rush",
    },
  ],
};

/** «Aprender» (2026-10-18): what the student studies — courses, studies and classes. */
const STUDENT_LEARN_DROPDOWN: PlatformNavDropdown = {
  label: "Aprender",
  art: "learn",
  items: [
    {
      label: "Cursos",
      href: platformRoutes.courses,
      description: "Tus cursos y los que puedes agregar.",
      icon: "courses",
    },
    {
      label: "Estudiar",
      href: platformRoutes.studies,
      description: "Tus estudios y las partidas de tus clases.",
      icon: "studies",
    },
    {
      label: "Clases",
      href: platformRoutes.classes,
      description: "Tus clases con tu profesor.",
      icon: "classes",
    },
  ],
};

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
    art: "tools",
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
 * The teacher's bar (2026-10-19): «Enseñar», «Material», «Aprender» and
 * «Herramientas». No «Jugar»: the owner's choice, the page stays theirs at
 * /jugar. The explorer stays a link of its own until «Herramientas» is on.
 */
function teacherNav(features: PlatformNavFeatures): PlatformNavEntry[] {
  return [
    TEACHER_TEACH_DROPDOWN,
    teacherMaterialDropdown(features),
    TEACHER_LEARN_DROPDOWN,
    features.analysisBoard ? toolsDropdown(features) : EXPLORER_ITEM,
  ];
}

/**
 * The student's bar (2026-10-18): «Jugar», the «Ejercicios» dropdown, the
 * «Aprender» dropdown and «Herramientas», each with its switch. «Inicio» is
 * the logo's; the explorer stays a link of its own until «Herramientas» is on.
 */
function studentNav(features: PlatformNavFeatures, studentExercises: boolean): PlatformNavEntry[] {
  return [
    ...(features.play ? [PLAY_ITEM] : []),
    ...(studentExercises ? [STUDENT_EXERCISES_DROPDOWN] : []),
    STUDENT_LEARN_DROPDOWN,
    features.analysisBoard ? toolsDropdown(features) : EXPLORER_ITEM,
  ];
}

/**
 * Pure (testable) function that picks the right menu. It always returns ONE
 * single group: the list of the widest role the user has. The student's gains
 * «Jugar» and «Herramientas» with their switches (`features`), the teacher's
 * «Herramientas» (never «Jugar»); the staff's menu is the panel's and has neither, only
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
  if (roles.isTeacher) return [{ label: "Profesor", items: teacherNav(features) }];
  const studentExercises =
    features.exercises === "all" || (features.exercises === "withTeacher" && roles.hasExerciseSource === true);
  return [{ items: studentNav(features, studentExercises) }];
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
