import { CONTENT_ROLE, type ContentRoleCode } from "@/constants/platform/course-codes.const";

// Dónde cae lo que abre y lo que cierra.
//
// Un curso puede tener un capítulo de introducción y otro de cierre, y un
// capítulo lo mismo con sus lecciones. Su sitio NO se guarda en `order`: se
// deduce del papel, así que reordenar el contenido nunca los mueve y no hay
// forma de dejar el cierre en medio.
//
// Módulo puro para que lo usen igual los servicios del alumno, los del staff y
// los tests.

/** Introducción, contenido, cierre. Es el orden en que se leen. */
function rankOf(role: string | null | undefined): number {
  if (role === CONTENT_ROLE.INTRO) return 0;
  if (role === CONTENT_ROLE.CLOSING) return 2;
  return 1;
}

export interface WithRole {
  order: number;
  /** Code de ContentRole, o nulo si es contenido normal. */
  roleCode?: string | null;
}

/**
 * Ordena poniendo la introducción delante y el cierre al final, y dejando el
 * resto en su orden.
 *
 * No modifica la lista que recibe: devuelve una nueva.
 */
export function sortByRole<T extends WithRole>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const byRank = rankOf(left.roleCode) - rankOf(right.roleCode);
    return byRank !== 0 ? byRank : left.order - right.order;
  });
}

/** Si es contenido normal, que es lo único que se puede reordenar y mover. */
export function isPlainContent(item: WithRole): boolean {
  return rankOf(item.roleCode) === 1;
}

/** El que tiene ese papel, si existe. */
export function withRole<T extends WithRole>(items: T[], role: ContentRoleCode): T | undefined {
  return items.find((item) => item.roleCode === role);
}
