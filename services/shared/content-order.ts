import { CONTENT_ROLE, type ContentRoleCode } from "@/constants/platform/course-codes.const";

// Where what opens and what closes falls.
//
// A course can have an introduction chapter and a closing one, and a chapter
// the same with its lessons. Their place is NOT stored in `order`: it is
// deduced from the role, so reordering the content never moves them and there
// is no way to leave the closing in the middle.
//
// Pure module so it is used alike by the student's services, the staff's and
// the tests.

/** Introduction, content, closing. It is the order they are read in. */
function rankOf(role: string | null | undefined): number {
  if (role === CONTENT_ROLE.INTRO) return 0;
  if (role === CONTENT_ROLE.CLOSING) return 2;
  return 1;
}

export interface WithRole {
  order: number;
  /** Code of ContentRole, or null when it is normal content. */
  roleCode?: string | null;
}

/**
 * Sorts putting the introduction in front and the closing at the end, and
 * leaving the rest in their order.
 *
 * It does not modify the list it receives: it returns a new one.
 */
export function sortByRole<T extends WithRole>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const byRank = rankOf(left.roleCode) - rankOf(right.roleCode);
    return byRank !== 0 ? byRank : left.order - right.order;
  });
}

/** Whether it is normal content, which is the only thing that can be reordered and moved. */
export function isPlainContent(item: WithRole): boolean {
  return rankOf(item.roleCode) === 1;
}

/** The one with that role, if it exists. */
export function withRole<T extends WithRole>(items: T[], role: ContentRoleCode): T | undefined {
  return items.find((item) => item.roleCode === role);
}
