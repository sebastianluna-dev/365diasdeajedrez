import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import type { ClassActorRole } from "./class-rules";

// Which status a class may move to, and who may move it. The teacher finalizes
// (to COMPLETED); the staff finalizes on the teacher's behalf or cancels. A
// finished or cancelled class is history and never comes back: a mistake is
// fixed with another class. LIVE is never a destination any more — «En vivo»
// is a phase of the hour (`classPhase`) — and an old LIVE row moves on like a
// SCHEDULED one.
//
// Pure functions; `transitionClassStatus` (class-status.service.ts) consults
// the first before writing, and the teacher's old detail page draws its
// buttons from the second until phase 6 retires it.

const OPEN_STATUSES: readonly ClassStatusCode[] = [CLASS_STATUS.SCHEDULED, CLASS_STATUS.LIVE];

export function canTransitionClassStatus(from: ClassStatusCode, to: ClassStatusCode, role: ClassActorRole): boolean {
  if (!OPEN_STATUSES.includes(from)) return false;
  if (to === CLASS_STATUS.COMPLETED) return true;
  if (to === CLASS_STATUS.CANCELLED) return role === "staff";
  return false;
}

/** The statuses a role may move a class to from its current one (to draw the buttons). */
export function nextClassStatuses(from: ClassStatusCode, role: ClassActorRole): readonly ClassStatusCode[] {
  return [CLASS_STATUS.COMPLETED, CLASS_STATUS.CANCELLED].filter((to) => canTransitionClassStatus(from, to, role));
}
