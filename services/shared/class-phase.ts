import {
  CLASS_PHASE,
  CLASS_STATUS,
  type ClassPhaseCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { meetingVisibleUntil } from "./meeting-visible-from";

// The phase of a class: what its status and the clock say together.
//
// The status is what somebody wrote (scheduled, finished, cancelled); the phase
// is what the hour makes of it: a scheduled class is «upcoming» until its link
// opens, «open» until it starts, «in progress» until it ends and «awaiting
// close» after that, until the teacher finalizes it. Nothing moves the status
// by itself, so every screen that says «En vivo» or «Por finalizar» reads it
// from here, with the same `now`.
//
// Pure module: the mappers of the student, the teacher and the staff read with
// it, and the tests fix the clock.

export interface ClassPhaseInput {
  statusCode: ClassStatusCode;
  scheduledAt: Date;
  endsAt: Date;
  /** When the link opens (`meetingVisibleFrom`); null without a link. */
  visibleFrom: Date | null;
  hasLink: boolean;
}

/** `scheduledAt + durationMin`: the one way the end of a class is computed. */
export function classEndsAt(scheduledAt: Date, durationMin: number): Date {
  return new Date(scheduledAt.getTime() + durationMin * 60 * 1000);
}

/**
 * The phase at `now`. A LIVE row (the status the old flow pressed) reads as
 * SCHEDULED: «En vivo» is decided by the hour, never by a button.
 */
export function classPhase(input: ClassPhaseInput, now: Date): ClassPhaseCode {
  if (input.statusCode === CLASS_STATUS.CANCELLED) return CLASS_PHASE.CANCELLED;
  if (input.statusCode === CLASS_STATUS.COMPLETED) return CLASS_PHASE.DONE;

  const at = now.getTime();
  if (at >= input.endsAt.getTime()) return CLASS_PHASE.AWAITING_CLOSE;
  if (at >= input.scheduledAt.getTime()) return CLASS_PHASE.IN_PROGRESS;
  if (input.hasLink && input.visibleFrom !== null && at >= input.visibleFrom.getTime()) return CLASS_PHASE.OPEN;
  return CLASS_PHASE.UPCOMING;
}

/**
 * The instants at which the phase changes, in order, so a page can refresh at
 * each of them: when the link opens, when the class starts and when it ends.
 * A finished or cancelled class never changes again.
 */
export function classPhaseInstants(input: ClassPhaseInput): Date[] {
  if (input.statusCode === CLASS_STATUS.CANCELLED || input.statusCode === CLASS_STATUS.COMPLETED) return [];
  const instants = [input.scheduledAt, input.endsAt];
  if (input.hasLink && input.visibleFrom !== null) instants.unshift(input.visibleFrom);
  return [...new Set(instants.map((date) => date.getTime()))]
    .sort((left, right) => left - right)
    .map((ms) => new Date(ms));
}

export type StudentClassView = "ahead" | "review";

/**
 * Which page the student gets: the one that looks AHEAD (how to join, what to
 * prepare) or the one that REVIEWS (summary, material, recording). A class
 * that just ended stays ahead while its link is still offered — the student
 * may be coming back in — and turns to review when the link closes
 * (`meetingVisibleUntil`), whether or not the teacher finalized it.
 */
export function studentClassView(phase: ClassPhaseCode, endsAt: Date, now: Date): StudentClassView {
  if (phase !== CLASS_PHASE.AWAITING_CLOSE && phase !== CLASS_PHASE.DONE) return "ahead";
  return now.getTime() < meetingVisibleUntil(endsAt).getTime() ? "ahead" : "review";
}
