import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";

// Valid transitions of a class's status. A pure function and without Prisma so
// it can be tested; the action consults it before writing.
//
// There is no physical deletion of classes: CANCELLED **is** the deletion. A
// cancelled or finished class is history and does not go back — if there was a
// mistake, another class is created.

const ALLOWED_TRANSITIONS: Record<ClassStatusCode, readonly ClassStatusCode[]> = {
  [CLASS_STATUS.SCHEDULED]: [
    CLASS_STATUS.LIVE,
    CLASS_STATUS.CANCELLED,
    // Jumping to COMPLETED is allowed: it is the class documented after the fact,
    // without having gone through "live" on the platform.
    CLASS_STATUS.COMPLETED,
  ],
  [CLASS_STATUS.LIVE]: [CLASS_STATUS.COMPLETED, CLASS_STATUS.CANCELLED],
  [CLASS_STATUS.COMPLETED]: [],
  [CLASS_STATUS.CANCELLED]: [],
};

export function canTransitionClassStatus(from: ClassStatusCode, to: ClassStatusCode): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses that can be moved to from the current one (to render the buttons). */
export function nextClassStatuses(from: ClassStatusCode): readonly ClassStatusCode[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}
