"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExerciseKindCode, ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { EXERCISE_FORM_FIELDS, exerciseErrorTab, readExerciseForm } from "@/services/shared/exercise-form";
import {
  createExerciseRecord,
  exerciseCopyInput,
  exerciseSolutionProblem,
  syncExerciseSolution,
} from "@/services/shared/exercise-record.service";
import { reviewLibraryExercise, type ExerciseTransitionResult } from "@/services/shared/exercise-status.service";
import { exerciseReadiness } from "@/services/shared/exercise-status-transitions";
import { readIds } from "@/services/shared/form-schema";
import { popupFormError, readFormValues, type FieldError, type PopupFormState } from "@/services/shared/form-state";
import { closeLessonExerciseOrderGaps, nextLessonExerciseOrder } from "@/services/shared/lesson-exercise-order.service";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { planSwap, type MoveDirection } from "@/services/shared/reorder";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { getChapterGamePgn } from "./lesson-exercises.service";

// Writes of a lesson's exercises (D04, D05; PLAN.md §7.1). Rules that are NOT
// negotiable:
// - Every action opens with requireStaff() and reaches an exercise only with
//   its lesson in the `where`: one of a bank, or of another lesson, is not
//   found. They are reachable by direct POST.
// - An exercise is inserted only by `createExerciseRecord` (always DRAFT, at
//   the lesson's next place, `nextLessonExerciseOrder`: one past the highest,
//   never `count + 1`), its solution changed only by `syncExerciseSolution`,
//   its status only by `reviewLibraryExercise` (the staff's moves of the
//   transitions table: DRAFT ⇄ PUBLISHED, ARCHIVED from either, and back to
//   DRAFT), all inside one transaction with the rest of the write.
// - A taken `lessonOrder` is a P2002 on `Exercise_lessonId_lessonOrder_key`,
//   read with `isUniqueConstraintError` and answered as `orderTaken`.
// - «Eliminar» destroys only an exercise nobody has tried (the condition
//   travels in the `where`); one with attempts is archived, which takes its
//   order away and keeps its history. Either way the ones left close the gap
//   (`closeLessonExerciseOrderGaps`) in the same transaction, and a restored
//   one comes back at the end. Reordering goes through
//   services/shared/reorder.ts.
// - Not behind `EXERCISES_ENABLED`: these replace a live, unflagged panel over
//   data the phase 2 migration moved. The one exception is the copy from the
//   library, which needs a library (phase 4) and checks the flag.

const WINDOW_MS = 60_000;

/** A status move that failed inside the transaction: thrown so nothing of the write stays. */
class RefusedMove extends Error {
  constructor(readonly result: Exclude<ExerciseTransitionResult, { ok: true }>) {
    super(`The exercise's status move was refused: ${result.code}`);
  }
}

/** The lesson's page in the panel and every student's page of it: what every write changes. */
function revalidateLesson(courseId: string, chapterId: string, lessonId: string, exerciseId?: string): void {
  revalidatePath(staffRoutes.lessonDetail(courseId, chapterId, lessonId));
  revalidatePath(staffRoutes.chapterLessons(courseId, chapterId));
  revalidatePath(platformRoutes.lessonPattern, "page");
  if (exerciseId) revalidatePath(staffRoutes.lessonExercise(courseId, chapterId, lessonId, exerciseId));
}

async function openPanel(key: string, limit: number) {
  const staff = await requireStaff();
  const throttled = !(await allowAction(`${staff.user.id}:${key}`, limit, WINDOW_MS));
  return { user: staff.user, throttled };
}

/** The lesson the URL names, checked against its chapter and course. */
async function findLesson(courseId: string, chapterId: string, lessonId: string) {
  return getPlatformDb().lesson.findFirst({
    where: { id: lessonId, chapterId, chapter: { courseId } },
    select: { id: true },
  });
}

/** The refusal of a status move, as the save's errors: the readiness gate by tab, anything else for the form. */
function refusalState(
  result: Exclude<ExerciseTransitionResult, { ok: true }>,
  values: Record<string, string | string[]>,
) {
  if (result.code !== "notReady") return popupFormError({}, values, { code: result.code });
  const errors: Record<string, FieldError> = {};
  const [problem] = result.readiness.solution;
  if (problem)
    errors.solutionPgn = { code: problem.code, ...("path" in problem ? { args: { path: problem.path } } : {}) };
  if (result.readiness.missing.includes("title")) errors.title = { code: "title" };
  if (result.readiness.missing.includes("topic")) errors.topics = { code: "topics" };
  return popupFormError(errors, values);
}

/**
 * The editor's save («Guardar borrador», «Guardar y publicar» or «Guardar»),
 * for a new exercise of the lesson (`exerciseId` null) or one it has. The
 * button says what it asks for (`intent`), and the status says whether it
 * may: a draft is kept or published, a published one is kept published (and
 * must stay complete), an archived one is kept as it is. A new one takes the
 * lesson's next order.
 */
export async function saveLessonExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string | null,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, [...EXERCISE_FORM_FIELDS]);
  const { user, throttled } = await openPanel("lesson-exercise-save", 60);
  if (throttled) return popupFormError({}, values, { code: "throttled" });

  const intent = formData.get("intent");
  if (intent !== "draft" && intent !== "publish" && intent !== "save") {
    return popupFormError({}, values, { code: "invalid" });
  }

  const read = readExerciseForm(formData);
  if (!read.ok) return popupFormError({ [read.field]: { code: read.field } }, values);
  const { solution, content } = read.values;
  if (content.difficulty % EXERCISE_LIMITS.difficultyStep !== 0) {
    return popupFormError({ difficulty: { code: "difficulty" } }, values);
  }
  const problem = exerciseSolutionProblem(solution);
  if (problem) {
    const tab = exerciseErrorTab({ problem });
    const field = tab === "position" ? "position" : tab === "data" ? "mateIn" : "solutionPgn";
    return popupFormError({ [field]: { code: problem } }, values);
  }

  const db = getPlatformDb();
  const lesson = await findLesson(courseId, chapterId, lessonId);
  if (!lesson) return popupFormError({}, values, { code: "lessonMissing" });
  const existing = exerciseId
    ? await db.exercise.findFirst({
        where: { id: exerciseId, lessonId },
        select: { id: true, statusId: true, status: { select: { code: true } } },
      })
    : null;
  // The staff's own code: the teacher's `notFound` says «o no es tuyo», which is not the case here.
  if (exerciseId && !existing) return popupFormError({}, values, { code: "exerciseMissing" });
  const status = (existing?.status.code ?? null) as ExerciseStatusCode | null;

  const fromDraft = status === null || status === EXERCISE_STATUS.DRAFT;
  const allowed =
    intent === "save" ? status === EXERCISE_STATUS.PUBLISHED || status === EXERCISE_STATUS.ARCHIVED : fromDraft;
  if (!allowed) return popupFormError({}, values, { code: "notAllowed" });
  const publish = intent === "publish";

  // What the gate will ask inside the transaction, said first with the fields it concerns.
  if (publish || (intent === "save" && status === EXERCISE_STATUS.PUBLISHED)) {
    const readiness = exerciseReadiness({
      title: content.title,
      solutionPgn: solution.solutionPgn,
      kind: solution.kind,
      mateIn: solution.mateIn,
      topicCount: content.topicCodes.length,
      explanation: content.explanation,
    });
    if (!readiness.ok) return refusalState({ ok: false, code: "notReady", readiness }, values);
  }

  const now = new Date();
  let savedId: string;
  try {
    savedId = await db.$transaction(async (tx) => {
      let id: string;
      if (!existing) {
        const created = await createExerciseRecord(tx, {
          teacherId: null,
          lesson: { lessonId, lessonOrder: await nextLessonExerciseOrder(tx, lessonId) },
          authorUserId: user.id,
          solution,
          content,
        });
        if (!created.ok) throw new Error(`The checked solution was refused: ${created.code}`);
        id = created.id;
      } else {
        id = existing.id;
        // Conditioned on the status it was read in: a move made meanwhile in another tab writes nothing here.
        const updated = await tx.exercise.updateMany({
          where: { id, lessonId, statusId: existing.statusId },
          data: {
            title: content.title,
            prompt: content.prompt,
            difficulty: content.difficulty,
            hints: content.hints,
            explanation: content.explanation,
            sourceWhite: content.sourceWhite,
            sourceBlack: content.sourceBlack,
            sourceEvent: content.sourceEvent,
            sourceYear: content.sourceYear,
          },
        });
        if (updated.count === 0) throw new RefusedMove({ ok: false, code: "changed" });
        const synced = await syncExerciseSolution(tx, id, solution);
        if (!synced.ok) throw new Error(`The checked solution was refused: ${synced.code}`);
        await syncCatalogJoin(tx.exerciseTopic, tx.topic, {
          parent: { exerciseId: id },
          catalogColumn: "topicId",
          codes: content.topicCodes,
        });
      }
      if (publish) {
        const moved = await reviewLibraryExercise(tx, {
          exerciseId: id,
          reviewerUserId: user.id,
          to: EXERCISE_STATUS.PUBLISHED,
          note: null,
          now,
        });
        if (!moved.ok) throw new RefusedMove(moved);
      }
      return id;
    });
  } catch (error) {
    if (error instanceof RefusedMove) return refusalState(error.result, values);
    if (isUniqueConstraintError(error, "Exercise_lessonId_lessonOrder_key", "lessonOrder")) {
      return popupFormError({}, values, { code: "orderTaken" });
    }
    throw error;
  }

  revalidateLesson(courseId, chapterId, lessonId, savedId);
  redirect(
    withNoticeParam(
      staffRoutes.lessonExercise(courseId, chapterId, lessonId, savedId),
      publish ? "exercisePublished" : "exerciseSaved",
    ),
  );
}

/** «Subir»/«Bajar» an exercise of the lesson: a swap with its neighbour, through the shared reorder. */
export async function moveLessonExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  const { throttled } = await openPanel("lesson-exercise-move", 120);
  if (throttled) redirect(withErrorParam(lessonPath, "throttled"));

  const { exerciseId, direction } = readIds(formData, "exerciseId", "direction");
  if (direction !== "up" && direction !== "down") redirect(withErrorParam(lessonPath, "order"));

  const db = getPlatformDb();
  if (!(await findLesson(courseId, chapterId, lessonId))) redirect(withErrorParam(lessonPath, "courseMissing"));
  await db.$transaction(async (tx) => {
    const rows = await tx.exercise.findMany({
      where: { lessonId, lessonOrder: { not: null } },
      select: { id: true, lessonOrder: true },
    });
    const exercises = rows.map((row) => ({ id: row.id, order: row.lessonOrder ?? 0 }));
    for (const update of planSwap(exercises, exerciseId, direction as MoveDirection)) {
      await tx.exercise.update({ where: { id: update.id }, data: { lessonOrder: update.order } });
    }
  });

  revalidateLesson(courseId, chapterId, lessonId);
}

/**
 * «Archivar» an exercise someone tried: PUBLISHED or DRAFT → ARCHIVED through
 * the status writer, which takes its order away; the row and its history
 * stay, and the ones left close the gap in the same transaction, so the
 * places stay 1..n. Reversible with «Restaurar».
 */
export async function archiveLessonExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  const { user, throttled } = await openPanel("lesson-exercise-save", 60);
  if (throttled) redirect(withErrorParam(lessonPath, "throttled"));

  const db = getPlatformDb();
  const exercise = await db.exercise.findFirst({ where: { id: exerciseId, lessonId }, select: { id: true } });
  if (!exercise) redirect(withErrorParam(lessonPath, "exerciseNotFound"));

  const moved = await db.$transaction(async (tx) => {
    const result = await reviewLibraryExercise(tx, {
      exerciseId: exercise.id,
      reviewerUserId: user.id,
      to: EXERCISE_STATUS.ARCHIVED,
      note: null,
      now: new Date(),
    });
    if (result.ok) await closeLessonExerciseOrderGaps(tx, lessonId);
    return result;
  });
  if (!moved.ok) redirect(withErrorParam(lessonPath, "exerciseNotAllowed"));
  revalidateLesson(courseId, chapterId, lessonId, exercise.id);
  redirect(withNoticeParam(lessonPath, "exerciseArchived"));
}

/**
 * «Restaurar» an archived exercise of the lesson: ARCHIVED → DRAFT through
 * the status writer, which gives it back a place — the end of the lesson,
 * read in the same transaction — as a draft the staff publishes again when
 * it wants the students to see it.
 */
export async function restoreLessonExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  const { user, throttled } = await openPanel("lesson-exercise-save", 60);
  if (throttled) redirect(withErrorParam(lessonPath, "throttled"));

  const db = getPlatformDb();
  const exercise = await db.exercise.findFirst({ where: { id: exerciseId, lessonId }, select: { id: true } });
  if (!exercise) redirect(withErrorParam(lessonPath, "exerciseNotFound"));

  let moved: ExerciseTransitionResult;
  try {
    moved = await db.$transaction(async (tx) =>
      reviewLibraryExercise(tx, {
        exerciseId: exercise.id,
        reviewerUserId: user.id,
        to: EXERCISE_STATUS.DRAFT,
        note: null,
        now: new Date(),
        lessonOrder: await nextLessonExerciseOrder(tx, lessonId),
      }),
    );
  } catch (error) {
    if (isUniqueConstraintError(error, "Exercise_lessonId_lessonOrder_key", "lessonOrder")) {
      redirect(withErrorParam(lessonPath, "orderTaken"));
    }
    throw error;
  }
  if (!moved.ok) redirect(withErrorParam(lessonPath, "exerciseNotAllowed"));
  revalidateLesson(courseId, chapterId, lessonId, exercise.id);
  redirect(withNoticeParam(lessonPath, "exerciseRestoredToLesson"));
}

/**
 * «Eliminar», from its confirmation: only an exercise of the lesson nobody
 * has tried. With attempts the history is kept, so the condition travels in
 * the `where` and the row stays («Archivar» is the way then). The ones left
 * close the gap.
 */
export async function deleteLessonExercise(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  const { throttled } = await openPanel("lesson-exercise-delete", 30);
  if (throttled) redirect(withErrorParam(lessonPath, "throttled"));

  const db = getPlatformDb();
  const deleted = await db.$transaction(async (tx) => {
    const result = await tx.exercise.deleteMany({ where: { id: exerciseId, lessonId, attempts: { none: {} } } });
    if (result.count === 0) return false;
    await closeLessonExerciseOrderGaps(tx, lessonId);
    return true;
  });
  if (!deleted) redirect(withErrorParam(lessonPath, "exerciseDeleteBlocked"));
  revalidateLesson(courseId, chapterId, lessonId);
  redirect(withNoticeParam(lessonPath, "exerciseDeleted"));
}

/**
 * «Agregar desde la biblioteca» (D28; drawn from phase 4, when a library
 * exists): a copy of a PUBLISHED library exercise owned by the lesson, through
 * `createExerciseRecord` with the content whitelist (`exerciseCopyInput`) —
 * no review stamps, no study game — at the lesson's next place, and moved
 * DRAFT → PUBLISHED in the same transaction, since what the library approved
 * the lesson serves.
 */
export async function copyLibraryExerciseToLesson(
  courseId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const lessonPath = staffRoutes.lessonDetail(courseId, chapterId, lessonId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(lessonPath, "disabled"));
  const { user, throttled } = await openPanel("lesson-exercise-save", 60);
  if (throttled) redirect(withErrorParam(lessonPath, "throttled"));

  const { exerciseId } = readIds(formData, "exerciseId");
  const db = getPlatformDb();
  if (!(await findLesson(courseId, chapterId, lessonId))) redirect(withErrorParam(lessonPath, "courseMissing"));
  const source = await db.exercise.findFirst({
    where: { id: exerciseId, lessonId: null, status: { code: EXERCISE_STATUS.PUBLISHED } },
    select: {
      id: true,
      solutionPgn: true,
      mateIn: true,
      title: true,
      prompt: true,
      difficulty: true,
      hints: true,
      explanation: true,
      sourceWhite: true,
      sourceBlack: true,
      sourceEvent: true,
      sourceYear: true,
      kind: { select: { code: true } },
      topics: { select: { topic: { select: { code: true } } } },
    },
  });
  if (!source) redirect(withErrorParam(lessonPath, "exerciseNotFound"));

  const copy = exerciseCopyInput({
    ...source,
    kind: source.kind.code as ExerciseKindCode,
    topicCodes: source.topics.map(({ topic }) => topic.code),
  });
  const now = new Date();
  let copied: { ok: true; id: string } | { ok: false; code: string };
  try {
    copied = await db.$transaction(async (tx) => {
      const created = await createExerciseRecord(tx, {
        teacherId: null,
        lesson: { lessonId, lessonOrder: await nextLessonExerciseOrder(tx, lessonId) },
        authorUserId: user.id,
        ...copy,
      });
      if (!created.ok) return created;
      const moved = await reviewLibraryExercise(tx, {
        exerciseId: created.id,
        reviewerUserId: user.id,
        to: EXERCISE_STATUS.PUBLISHED,
        note: null,
        now,
      });
      if (!moved.ok) throw new RefusedMove(moved);
      return created;
    });
  } catch (error) {
    if (error instanceof RefusedMove) redirect(withErrorParam(lessonPath, "exerciseNotAllowed"));
    if (isUniqueConstraintError(error, "Exercise_lessonId_lessonOrder_key", "lessonOrder")) {
      redirect(withErrorParam(lessonPath, "orderTaken"));
    }
    throw error;
  }
  if (!copied.ok) redirect(withErrorParam(lessonPath, "invalid"));

  revalidateLesson(courseId, chapterId, lessonId);
  redirect(withNoticeParam(lessonPath, "exerciseCopied"));
}

/** «Desde una partida»: the PGN of a game of the chapter's collection, for the editor's position picker. */
export async function fetchChapterGamePgn(courseId: string, chapterId: string, gameId: string): Promise<string | null> {
  return getChapterGamePgn(courseId, chapterId, gameId);
}
