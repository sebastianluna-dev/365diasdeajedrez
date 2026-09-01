import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";

// Navegación de la plataforma. El menú es EXCLUYENTE por rol: cada quien ve
// sólo el suyo, no la suma. Un mismo usuario puede seguir siendo alumno,
// profesor y staff a la vez (los roles son ortogonales en la base de datos),
// así que cuando acumula varios manda el de mayor alcance —staff sobre
// profesor, profesor sobre alumno— y el resto de áreas dejan de aparecer en el
// menú. Los href salen siempre de los builders de rutas, nunca de strings
// sueltos.
//
// Ojo con lo que esto NO es: ocultar un grupo no retira ningún permiso. Un
// profesor que teclee /estudios sigue entrando, porque esas páginas son suyas
// como usuario; lo que decide de verdad es `requireTeacher`/`requireStaff` en
// cada página y action, y ahí nada ha cambiado.

export interface PlatformNavItem {
  label: string;
  href: string;
}

export interface PlatformNavGroup {
  /** Sin label = grupo base, se pinta sin encabezado. */
  label?: string;
  items: PlatformNavItem[];
}

/**
 * El trainer se alcanza desde cursos y dashboard, así que no ocupa sitio aquí.
 * El explorador sí: es una herramienta transversal, no el paso siguiente de
 * ninguna otra pantalla.
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
  // Mismo destino que en el menú del alumno: el explorador no es de un rol, y
  // lo que ve cada quien lo decide el filtro de visibilidad, no el menú.
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
 * Función pura (testeable) que elige el menú que toca. Devuelve siempre UN solo
 * grupo: es la lista del rol de mayor alcance que tenga el usuario.
 *
 * Sigue devolviendo un array (y no un grupo suelto) para no obligar al
 * componente a cambiar de forma si algún día vuelve a haber más de uno.
 */
export function buildPlatformNavGroups(roles: { isTeacher: boolean; isStaff: boolean }): PlatformNavGroup[] {
  if (roles.isStaff) return [{ label: "Administración", items: STAFF_NAV_ITEMS }];
  if (roles.isTeacher) return [{ label: "Profesor", items: TEACHER_NAV_ITEMS }];
  return [{ items: STUDENT_NAV_ITEMS }];
}

/**
 * Href del ítem que debe aparecer activo, o null. Se queda con la coincidencia
 * MÁS LARGA: `/profesor` y `/profesor/alumnos` son ítems distintos y el prefijo
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
