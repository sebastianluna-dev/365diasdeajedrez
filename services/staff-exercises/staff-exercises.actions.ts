"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { reviewLibraryExercise, type ExerciseTransitionResult } from "@/services/shared/exercise-status.service";
import { formText, parseForm } from "@/services/shared/form-schema";
import { popupFormError, readFormValues, type PopupFormState } from "@/services/shared/form-state";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";

// The staff's decisions about the library (PLAN.md §8; D07, D16): approving
// or returning a teacher's proposal, and taking an exercise out of the
// library. Rules that are NOT negotiable:
// - Every action checks `EXERCISES_ENABLED`, opens with requireStaff() and
//   is limited; they are reachable by direct POST.
// - A status moves only through `reviewLibraryExercise`, the staff's rows of
//   the transitions table, inside one transaction: who decided, when and the
//   note are its stamps. A lesson's exercise is never reached from here (the
//   writer refuses the move anyway: a lesson's has no review).
// - «Devolver» and «Quitar de la biblioteca» need the note the author reads.

const WINDOW_MS = 60_000;

const NOTE_SCHEMA = z.object({ note: formText(EXERCISE_LIMITS.reviewNote) });

async function openReview(key: string, limit: number) {
  const { user } = await requireStaff();
  const throttled = !(await allowAction(`${user.id}:${key}`, limit, WINDOW_MS));
  return { user, throttled };
}

/** Every screen a decision changes: the queue, the library, the exercise's staff page, and the teacher's bank and page. */
function revalidateDecision(exerciseId: string): void {
  revalidatePath(staffRoutes.exercises);
  revalidatePath(staffRoutes.exercisesReview);
  revalidatePath(staffRoutes.exerciseDetail(exerciseId));
  revalidatePath(teacherRoutes.exercises);
  revalidatePath(teacherRoutes.exerciseDetail(exerciseId));
  // The library's exercises reach every student: their home and practice read it.
  revalidatePath(platformRoutes.exercises);
}

/** A refusal's code as the address's `?error=`: the readiness gate reads as «not ready». */
function errorCodeOf(moved: Exclude<ExerciseTransitionResult, { ok: true }>): string {
  return moved.code;
}

/** A decision of the staff, written through the status writer. */
async function decide(exerciseId: string, to: ExerciseStatusCode, note: string | null, reviewerUserId: string) {
  return getPlatformDb().$transaction((tx) =>
    reviewLibraryExercise(tx, { exerciseId, reviewerUserId, to, note, now: new Date() }),
  );
}

/**
 * The staff editor's save. A teacher's exercise is read-only for the staff
 * (its content is the author's, D07, D48), so every save is refused as
 * `locked`; the academy's own exercises get their save with the academy's
 * bank (phase 4, second step).
 */
export async function saveStaffExercise(
  exerciseId: string | null,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  void exerciseId;
  const values = readFormValues(formData, []);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  await requireStaff();
  return popupFormError({}, values, { code: "locked" });
}

/** «Desde una partida» in the staff editor: the staff reads no study here yet, so nothing is returned. */
export async function fetchStaffGamePgn(gameId: string): Promise<string | null> {
  void gameId;
  await requireStaff();
  return null;
}

/**
 * «Aprobar» (IN_REVIEW → PUBLISHED): the exercise enters the library, with
 * `publishedAt` on its first time, and stays the teacher's (D07, D48). Back
 * to the queue with the notice.
 */
export async function approveLibraryExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  const back = staffRoutes.exercisesReview;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { user, throttled } = await openReview("exercise-review", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));

  const moved = await decide(exerciseId, EXERCISE_STATUS.PUBLISHED, null, user.id);
  if (!moved.ok) redirect(withErrorParam(back, errorCodeOf(moved)));
  revalidateDecision(exerciseId);
  redirect(withNoticeParam(back, "exerciseApproved"));
}

/**
 * «Devolver», from its popup (IN_REVIEW → READY): the note is required — it
 * is what the teacher reads on the exercise («Devuelto: …») — and the
 * exercise goes back to ready, theirs to fix and propose again. On success it
 * goes to the queue with the notice; a refusal comes back to the popup.
 */
export async function returnLibraryExercise(
  exerciseId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, ["note"]);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { user, throttled } = await openReview("exercise-review", 60);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(NOTE_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ note: { code: "noteRequired" } }, values);

  const moved = await decide(exerciseId, EXERCISE_STATUS.READY, parsed.data.note, user.id);
  if (!moved.ok) return popupFormError({}, values, { code: errorCodeOf(moved) });
  revalidateDecision(exerciseId);
  redirect(withNoticeParam(staffRoutes.exercisesReview, "exerciseReturned"));
}

/**
 * «Quitar de la biblioteca», from its confirmation, with the note the author
 * reads: a teacher's exercise goes back to READY — still theirs, still in
 * their students' series — and the academy's to ARCHIVED. Back to the library
 * with the notice.
 */
export async function removeExerciseFromLibrary(exerciseId: string, formData: FormData): Promise<void> {
  const back = staffRoutes.exercises;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { user, throttled } = await openReview("exercise-review", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));
  const parsed = parseForm(NOTE_SCHEMA, formData);
  if (!parsed.ok) redirect(withErrorParam(back, "noteRequired"));

  const exercise = await getPlatformDb().exercise.findFirst({
    where: { id: exerciseId, lessonId: null },
    select: { teacherId: true },
  });
  if (!exercise) redirect(withErrorParam(back, "exerciseMissing"));
  const to = exercise.teacherId === null ? EXERCISE_STATUS.ARCHIVED : EXERCISE_STATUS.READY;
  const moved = await decide(exerciseId, to, parsed.data.note, user.id);
  if (!moved.ok) redirect(withErrorParam(back, errorCodeOf(moved)));
  revalidateDecision(exerciseId);
  redirect(withNoticeParam(back, "exerciseRemovedFromLibrary"));
}
