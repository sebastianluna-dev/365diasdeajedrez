import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";

// Navegación de la plataforma. Un mismo usuario puede ser alumno, profesor y
// staff a la vez, así que el menú no se sustituye según el rol: se APILAN
// grupos sobre la base del alumno (un profesor también estudia cursos y guarda
// estudios). Los href salen siempre de los builders de rutas, nunca de strings
// sueltos.
//
// Que un grupo se pinte o no es cosmético: quien decide de verdad es
// `requireTeacher`/`requireStaff` en cada página y action.

export interface PlatformNavItem {
  label: string;
  href: string;
}

export interface PlatformNavGroup {
  /** Sin label = grupo base, se pinta sin encabezado. */
  label?: string;
  items: PlatformNavItem[];
}

/** Sólo estas cuatro áreas: el trainer se alcanza desde cursos y dashboard. */
export const STUDENT_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Inicio", href: platformRoutes.dashboard },
  { label: "Mis clases", href: platformRoutes.classes },
  { label: "Mis estudios", href: platformRoutes.studies },
  { label: "Mis cursos", href: platformRoutes.courses },
];

export const TEACHER_NAV_ITEMS: PlatformNavItem[] = [
  { label: "Panel del profesor", href: teacherRoutes.home },
  { label: "Mis alumnos", href: teacherRoutes.students },
  { label: "Clases que imparto", href: teacherRoutes.classes },
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

/** Función pura (testeable) que compone el menú a partir de los roles. */
export function buildPlatformNavGroups(roles: { isTeacher: boolean; isStaff: boolean }): PlatformNavGroup[] {
  const groups: PlatformNavGroup[] = [{ items: STUDENT_NAV_ITEMS }];
  if (roles.isTeacher) groups.push({ label: "Profesor", items: TEACHER_NAV_ITEMS });
  if (roles.isStaff) groups.push({ label: "Administración", items: STAFF_NAV_ITEMS });
  return groups;
}

/**
 * Href del ítem que debe aparecer activo, o null. Se queda con la coincidencia
 * MÁS LARGA: `/teacher` y `/teacher/students` son ítems distintos y el prefijo
 * simple encendería los dos a la vez.
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
