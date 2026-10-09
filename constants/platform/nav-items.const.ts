import { ANALYSIS_BOARD_ENABLED, MOVE_TRAINER_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
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
  icon: "analysis-board" | "import" | "explorer" | "trainer";
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

/** What is switched on, which decides «Jugar» and whether the tools are gathered. */
export interface PlatformNavFeatures {
  play: boolean;
  analysisBoard: boolean;
  trainer: boolean;
}

const FEATURES: PlatformNavFeatures = {
  play: PLAY_ENABLED,
  analysisBoard: ANALYSIS_BOARD_ENABLED,
  trainer: MOVE_TRAINER_ENABLED,
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

/**
 * «Herramientas» (planning decision §H, M3): the analysis board, «Importar
 * partida», the explorer and — while it is on — the trainer, each with the
 * line that says what it is for.
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
        label: "Importar partida",
        href: platformRoutes.importGame,
        description: "Un PGN que entra directo a uno de tus estudios.",
        icon: "import",
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
 * before the explorer, and the explorer gathered into «Herramientas» once the
 * analysis board is on (until then it stays a link of its own, so it never
 * disappears).
 */
function withFeatures(items: PlatformNavItem[], features: PlatformNavFeatures): PlatformNavEntry[] {
  return items.flatMap((item): PlatformNavEntry[] => {
    if (item.href !== platformRoutes.explorer) return [item];
    return [...(features.play ? [PLAY_ITEM] : []), features.analysisBoard ? toolsDropdown(features) : item];
  });
}

/**
 * Pure (testable) function that picks the right menu. It always returns ONE
 * single group: the list of the widest role the user has. The student's and
 * the teacher's gain «Jugar» and «Herramientas» with their switches
 * (`features`); the staff's menu is the panel's and has neither.
 *
 * It still returns an array (and not a loose group) so as not to force the
 * component to change shape if one day there is more than one again.
 */
export function buildPlatformNavGroups(
  roles: { isTeacher: boolean; isStaff: boolean },
  features: PlatformNavFeatures = FEATURES,
): PlatformNavGroup[] {
  if (roles.isStaff) return [{ label: "Administración", items: STAFF_NAV_ITEMS }];
  if (roles.isTeacher) return [{ label: "Profesor", items: withFeatures(TEACHER_NAV_ITEMS, features) }];
  return [{ items: withFeatures(STUDENT_NAV_ITEMS, features) }];
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
