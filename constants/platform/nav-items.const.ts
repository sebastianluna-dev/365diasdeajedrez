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

export interface PlatformNavGroup {
  /** No label = base group, rendered without a heading. */
  label?: string;
  items: PlatformNavItem[];
}

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
  { label: "Mi perfil", href: teacherRoutes.profile },
];

export const STAFF_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Administración", href: staffRoutes.home },
  { label: "Alumnos", href: staffRoutes.students },
  { label: "Profesores", href: staffRoutes.teachers },
  { label: "Cursos", href: staffRoutes.courses },
  { label: "Autores", href: staffRoutes.authors },
  { label: "Clases", href: staffRoutes.classes },
];

/**
 * Pure (testable) function that picks the right menu. It always returns ONE
 * single group: the list of the widest role the user has.
 *
 * It still returns an array (and not a loose group) so as not to force the
 * component to change shape if one day there is more than one again.
 */
export function buildPlatformNavGroups(roles: { isTeacher: boolean; isStaff: boolean }): PlatformNavGroup[] {
  if (roles.isStaff) return [{ label: "Administración", items: STAFF_NAV_ITEMS }];
  if (roles.isTeacher) return [{ label: "Profesor", items: TEACHER_NAV_ITEMS }];
  return [{ items: STUDENT_NAV_ITEMS }];
}

/**
 * Href of the item that should appear active, or null. It keeps the LONGEST
 * match: `/profesor` and `/profesor/alumnos` are different items and a plain
 * prefix would light up both at once.
 */
export function activeNavHref(groups: PlatformNavGroup[], pathname: string): string | null {
  let best: string | null = null;
  for (const group of groups) {
    for (const item of group.items) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (best === null || item.href.length > best.length)) best = item.href;
    }
  }
  return best;
}
