"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EXERCISE_LIMITS, SERIES_LIMITS } from "@/constants/platform/exercise.const";
import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { exerciseImportReport } from "@/constants/platform/exercise-messages.const";
import { EXERCISE_FORM_FIELDS, exerciseErrorTab, readExerciseForm } from "@/services/shared/exercise-form";
import { firstSanOf, readExerciseImport } from "@/services/shared/exercise-import";
import {
  EXERCISE_IMPORT_FIELDS,
  readExerciseImportForm,
  type ExerciseImportFormState,
} from "@/services/shared/exercise-import-form";
import {
  ExerciseImportRefused,
  ExerciseImportSeriesFull,
  writeExerciseImport,
} from "@/services/shared/exercise-import.service";
import {
  createExerciseRecord,
  exerciseCopyInput,
  exerciseSolutionProblem,
  syncExerciseSolution,
} from "@/services/shared/exercise-record.service";
import { transitionOwnExercise, type ExerciseTransitionResult } from "@/services/shared/exercise-status.service";
import { exerciseReadiness, isExerciseContentLocked } from "@/services/shared/exercise-status-transitions";
import { buildOwnExercisesWhere, buildPickableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { formOptionalText, formText, parseForm, readIds } from "@/services/shared/form-schema";
import {
  popupFormDone,
  popupFormError,
  readFormValues,
  type FieldError,
  type PopupFormState,
} from "@/services/shared/form-state";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { nextOrder, planDenseRenumber, planFullReorder } from "@/services/shared/reorder";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { getExerciseCatalogs, getTeacherGamePgn, isTeacherGame } from "./teacher-exercises.service";

// Writes of the teacher's exercise bank (PLAN.md §4.2). Rules that are NOT
// negotiable:
// - Every action checks `EXERCISES_ENABLED`, opens with requireTeacher() and
//   reaches an exercise only through `buildOwnExercisesWhere`: another
//   teacher's is not found. They are reachable by direct POST.
// - An exercise is inserted only by `createExerciseRecord` (always DRAFT), its
//   solution changed only by `syncExerciseSolution`, its status only by
//   `transitionOwnExercise`, all inside one transaction with the rest of the
//   write (services/shared/exercise-writers.test.ts holds it).
// - The save returns a `PopupFormState` through `useActionState`, because the
//   editor keeps its board and its fields in the browser and a redirect on a
//   refusal would lose them; it redirects only when it saved. The row actions
//   redirect with the notice or the error, as every other action does.
// - A series (D18, D31) is reached only with its `teacherId` in the `where`;
//   what it may hold is `buildPickableExercisesWhere`, checked again here
//   against the database; its order goes through services/shared/reorder.ts,
//   and a share needs an active assignment with the student, as a
//   collection's does.

const WINDOW_MS = 60_000;

/** A status move that failed inside the transaction: thrown so nothing of the write stays. */
class RefusedMove extends Error {
  constructor(readonly result: Exclude<ExerciseTransitionResult, { ok: true }>) {
    super(`The exercise's status move was refused: ${result.code}`);
  }
}

/** The bank and the exercise's own page: what every write changes. */
function revalidateExercise(exerciseId?: string): void {
  revalidatePath(teacherRoutes.exercises);
  if (exerciseId) revalidatePath(teacherRoutes.exerciseDetail(exerciseId));
}

async function openBank(key: string, limit: number) {
  const { teacher, user } = await requireTeacher();
  const throttled = !(await allowAction(`${user.id}:${key}`, limit, WINDOW_MS));
  return { teacher, user, throttled };
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
 * The editor's save («Guardar borrador», «Guardar y marcar como listo» or
 * «Guardar»), for a new exercise (`exerciseId` null) or one of the
 * teacher's. The button says what it asks for (`intent`), and the status the
 * exercise is in says whether it may: a draft is kept or made ready, a ready
 * one is kept ready (and must stay complete), an archived one is kept as it
 * is, and one in review or in the library is locked.
 */
export async function saveTeacherExercise(
  exerciseId: string | null,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, [...EXERCISE_FORM_FIELDS, "sourceGameId"]);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { teacher, user, throttled } = await openBank("exercise-save", 60);
  if (throttled) return popupFormError({}, values, { code: "throttled" });

  const intent = formData.get("intent");
  if (intent !== "draft" && intent !== "ready" && intent !== "save") {
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
  const existing = exerciseId
    ? await db.exercise.findFirst({
        where: { id: exerciseId, ...buildOwnExercisesWhere(teacher.id) },
        select: { id: true, statusId: true, sourceGameId: true, status: { select: { code: true } } },
      })
    : null;
  if (exerciseId && !existing) return popupFormError({}, values, { code: "notFound" });
  const status = (existing?.status.code ?? null) as ExerciseStatusCode | null;
  if (status && isExerciseContentLocked(status, "teacher")) return popupFormError({}, values, { code: "locked" });

  const fromDraft = status === null || status === EXERCISE_STATUS.DRAFT;
  const allowed =
    intent === "save" ? status === EXERCISE_STATUS.READY || status === EXERCISE_STATUS.ARCHIVED : fromDraft;
  if (!allowed) return popupFormError({}, values, { code: "notAllowed" });
  const makeReady = intent === "ready";

  // What the gate will ask inside the transaction, said first with the fields it concerns.
  if (makeReady || (intent === "save" && status === EXERCISE_STATUS.READY)) {
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

  // The game it came from: kept only when it is one of the teacher's own studies'.
  const sentGameId = String(formData.get("sourceGameId") ?? "").trim();
  const sourceGameId =
    sentGameId && (sentGameId === existing?.sourceGameId || (await isTeacherGame(user.id, sentGameId)))
      ? sentGameId
      : null;

  const now = new Date();
  let savedId: string;
  try {
    savedId = await db.$transaction(async (tx) => {
      let id: string;
      if (!existing) {
        const created = await createExerciseRecord(tx, {
          teacherId: teacher.id,
          authorUserId: user.id,
          solution,
          content,
          sourceGameId,
        });
        if (!created.ok) throw new Error(`The checked solution was refused: ${created.code}`);
        id = created.id;
      } else {
        id = existing.id;
        // Conditioned on the status it was read in: a move made meanwhile in another tab writes nothing here.
        const updated = await tx.exercise.updateMany({
          where: { id, teacherId: teacher.id, statusId: existing.statusId },
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
            sourceGameId,
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
      if (makeReady) {
        const moved = await transitionOwnExercise(tx, {
          exerciseId: id,
          teacherId: teacher.id,
          actorUserId: user.id,
          to: EXERCISE_STATUS.READY,
          now,
        });
        if (!moved.ok) throw new RefusedMove(moved);
      }
      return id;
    });
  } catch (error) {
    if (error instanceof RefusedMove) return refusalState(error.result, values);
    throw error;
  }

  revalidateExercise(savedId);
  redirect(withNoticeParam(teacherRoutes.exerciseDetail(savedId), makeReady ? "exerciseReady" : "exerciseSaved"));
}

/**
 * «Duplicar»: a copy of one of the teacher's exercises, theirs and a draft,
 * through `createExerciseRecord` with the content whitelist
 * (`exerciseCopyInput`): no review stamps, no study game. It opens the copy.
 */
export async function duplicateTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(teacherRoutes.exercises, "disabled"));
  const { teacher, user, throttled } = await openBank("exercise-save", 60);
  if (throttled) redirect(withErrorParam(teacherRoutes.exercises, "throttled"));

  const db = getPlatformDb();
  const source = await db.exercise.findFirst({
    where: { id: exerciseId, ...buildOwnExercisesWhere(teacher.id) },
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
  if (!source) redirect(withErrorParam(teacherRoutes.exercises, "notFound"));

  const copy = exerciseCopyInput({
    ...source,
    kind: source.kind.code as ExerciseKindCode,
    topicCodes: source.topics.map(({ topic }) => topic.code),
  });
  const suffix = " (copia)";
  const title = `${copy.content.title.slice(0, EXERCISE_LIMITS.title - suffix.length)}${suffix}`;
  const created = await db.$transaction((tx) =>
    createExerciseRecord(tx, {
      teacherId: teacher.id,
      authorUserId: user.id,
      ...copy,
      content: { ...copy.content, title },
    }),
  );
  if (!created.ok) redirect(withErrorParam(teacherRoutes.exercises, created.code));

  revalidateExercise();
  redirect(withNoticeParam(teacherRoutes.exerciseDetail(created.id), "exerciseDuplicated"));
}

/**
 * Why a move was refused, as the address's `?error=`: a proposal that lacks
 * its explanation says so (a library exercise is solved by students with no
 * teacher to ask); anything else, the refusal's own code.
 */
function moveErrorCode(moved: Exclude<ExerciseTransitionResult, { ok: true }>): string {
  if (moved.code === "notReady" && moved.readiness.missing.includes("explanation")) return "explanationRequired";
  return moved.code;
}

/** A status move of the bank's rows, with its notice, back to the bank's view it was made from. */
async function moveOwnExercise(
  exerciseId: string,
  to: typeof EXERCISE_STATUS.ARCHIVED | typeof EXERCISE_STATUS.READY | typeof EXERCISE_STATUS.IN_REVIEW,
  notice: string,
  back: string,
): Promise<void> {
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { teacher, user, throttled } = await openBank("exercise-save", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));

  const moved = await getPlatformDb().$transaction((tx) =>
    transitionOwnExercise(tx, { exerciseId, teacherId: teacher.id, actorUserId: user.id, to, now: new Date() }),
  );
  if (!moved.ok) redirect(withErrorParam(back, moveErrorCode(moved)));
  revalidateExercise(exerciseId);
  revalidatePath(staffRoutes.exercisesReview);
  redirect(withNoticeParam(back, notice));
}

/**
 * Where a review move comes back to: the exercise's own page when its review
 * bar asked (`origin=editor`, a hidden input), the bank's list otherwise. A
 * flag, not an address: nothing of the browser's is followed.
 */
function reviewBack(exerciseId: string, formData: FormData): string {
  return formData.get("origin") === "editor" ? teacherRoutes.exerciseDetail(exerciseId) : teacherRoutes.exercises;
}

/**
 * «Proponer a la biblioteca» (D07, D16): READY → IN_REVIEW through the status
 * writer, which asks for the readiness gate with an explanation and stamps
 * `submittedAt`. The students keep seeing it meanwhile (IN_REVIEW is usable);
 * its content is locked until the staff decides or the teacher withdraws.
 */
export async function proposeTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  await moveOwnExercise(exerciseId, EXERCISE_STATUS.IN_REVIEW, "exerciseProposed", reviewBack(exerciseId, formData));
}

/** «Retirar la propuesta»: IN_REVIEW → READY, so the teacher can edit it again. */
export async function withdrawTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  await moveOwnExercise(exerciseId, EXERCISE_STATUS.READY, "exerciseWithdrawn", reviewBack(exerciseId, formData));
}

/** «Archivar» a draft or a ready one: it leaves the bank's list and the series' students, its history stays. */
export async function archiveTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  await moveOwnExercise(exerciseId, EXERCISE_STATUS.ARCHIVED, "exerciseArchived", teacherRoutes.exercises);
}

/** «Restaurar» an archived one: back to ready, so it must be complete. */
export async function restoreTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  await moveOwnExercise(exerciseId, EXERCISE_STATUS.READY, "exerciseRestored", teacherRoutes.archivedExercises);
}

/**
 * «Eliminar», from its confirmation: only an exercise nobody has tried, and
 * not one in review or in the library. With attempts the history is kept, so
 * the condition travels in the `where` and the row stays.
 */
export async function deleteTeacherExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(teacherRoutes.exercises, "disabled"));
  const { teacher, throttled } = await openBank("exercise-delete", 30);
  if (throttled) redirect(withErrorParam(teacherRoutes.exercises, "throttled"));

  const deleted = await getPlatformDb().exercise.deleteMany({
    where: {
      id: exerciseId,
      ...buildOwnExercisesWhere(teacher.id),
      attempts: { none: {} },
      status: { code: { in: [EXERCISE_STATUS.DRAFT, EXERCISE_STATUS.READY, EXERCISE_STATUS.ARCHIVED] } },
    },
  });
  if (deleted.count === 0) redirect(withErrorParam(teacherRoutes.exercises, "deleteBlocked"));
  revalidateExercise();
  redirect(withNoticeParam(teacherRoutes.exercises, "exerciseDeleted"));
}

/** «Desde una partida»: the PGN of a game of the teacher's own studies, for the editor's position picker. */
export async function fetchTeacherGamePgn(gameId: string): Promise<string | null> {
  if (!EXERCISES_ENABLED) return null;
  return getTeacherGamePgn(gameId);
}

// --- Series (D18, D31; PLAN.md §6.2) ---------------------------------------

const SERIES_SCHEMA = z.object({
  title: formText(SERIES_LIMITS.title),
  description: formOptionalText(SERIES_LIMITS.description),
});

const SERIES_FIELDS = ["title", "description"] as const;

/** The error code of each field of the series' popup, read by `EXERCISE_ERROR_MESSAGES`. */
const SERIES_FIELD_ERRORS: Record<string, string> = { title: "seriesTitle", description: "seriesDescription" };

/** A refusal inside a series' transaction: thrown so nothing of the write stays. */
class SeriesRefused extends Error {
  constructor(readonly code: string) {
    super(`The series write was refused: ${code}`);
  }
}

/** The bank's «Series» view and the series' own page: what every write of a series changes. */
function revalidateSeries(seriesId?: string): void {
  revalidatePath(teacherRoutes.exercises);
  if (seriesId) revalidatePath(teacherRoutes.exerciseSeries(seriesId));
}

/** Opens a series action: the teacher, and whether their budget for `key` (by teacher) is spent. */
async function openSeries(key: string, limit: number) {
  const { teacher, user } = await requireTeacher();
  const throttled = !(await allowAction(`${teacher.id}:${key}`, limit, WINDOW_MS));
  return { teacher, user, throttled };
}

/** Whether the series is this teacher's: another teacher's is not found. */
async function ownsSeries(seriesId: string, teacherId: string): Promise<boolean> {
  const found = await getPlatformDb().exerciseSeries.count({ where: { id: seriesId, teacherId } });
  return found > 0;
}

/** The series' title and description from the popup, or the field that failed as the popup's error. */
function readSeriesForm(formData: FormData, values: Record<string, string | string[]>) {
  const parsed = parseForm(SERIES_SCHEMA, formData);
  if (parsed.ok) return { ok: true as const, data: parsed.data };
  const code = SERIES_FIELD_ERRORS[parsed.field] ?? "invalid";
  return { ok: false as const, state: popupFormError({ [parsed.field || "title"]: { code } }, values) };
}

/**
 * «Nueva serie», from its popup: an empty series of the teacher's. It opens
 * the new series, where its exercises are added; a refusal comes back to the
 * popup with what was written.
 */
export async function createExerciseSeries(prev: PopupFormState, formData: FormData): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, SERIES_FIELDS);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { teacher, user, throttled } = await openSeries("series-edit", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const read = readSeriesForm(formData, values);
  if (!read.ok) return read.state;

  const created = await getPlatformDb().exerciseSeries.create({
    data: { teacherId: teacher.id, createdById: user.id, ...read.data },
    select: { id: true },
  });
  revalidateSeries(created.id);
  redirect(withNoticeParam(teacherRoutes.exerciseSeries(created.id), "seriesCreated"));
}

/** «Editar la serie», from its popup: the title and the description its students read. */
export async function updateExerciseSeries(
  seriesId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, SERIES_FIELDS);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { teacher, throttled } = await openSeries("series-edit", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const read = readSeriesForm(formData, values);
  if (!read.ok) return read.state;

  const updated = await getPlatformDb().exerciseSeries.updateMany({
    where: { id: seriesId, teacherId: teacher.id },
    data: read.data,
  });
  if (updated.count === 0) return popupFormError({}, values, { code: "seriesNotFound" });
  revalidateSeries(seriesId);
  return popupFormDone("seriesSaved");
}

/**
 * «Agregar ejercicios», from its popup: the chosen exercises at the end of
 * the series, in the order they were offered. Each must be one the teacher
 * may pick now (D08: their own usable ones and the library's); one already
 * in the series is skipped. Two adds at once race for the same orders, and
 * the loser's unique violation answers «La serie cambió mientras tanto».
 */
export async function addExercisesToSeries(
  seriesId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, ["exercises"]);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { teacher, throttled } = await openSeries("series-edit", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });

  const chosen = [
    ...new Set(
      formData
        .getAll("exercises")
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim()),
    ),
  ];
  if (chosen.length === 0 || chosen.some((id) => id.length === 0 || id.length > 64)) {
    return popupFormError({ exercises: { code: "seriesExercises" } }, values);
  }
  if (!(await ownsSeries(seriesId, teacher.id))) return popupFormError({}, values, { code: "seriesNotFound" });

  const db = getPlatformDb();
  try {
    await db.$transaction(async (tx) => {
      const items = await tx.exerciseSeriesItem.findMany({
        where: { seriesId },
        select: { exerciseId: true, order: true },
      });
      const inSeries = new Set(items.map((item) => item.exerciseId));
      const fresh = chosen.filter((id) => !inSeries.has(id));
      if (fresh.length === 0) return;
      if (items.length + fresh.length > SERIES_LIMITS.items) throw new SeriesRefused("seriesFull");
      const pickable = await tx.exercise.count({
        where: { AND: [{ id: { in: fresh } }, buildPickableExercisesWhere({ teacherId: teacher.id })] },
      });
      if (pickable !== fresh.length) throw new SeriesRefused("seriesNotPickable");
      // After the last one: an exercise deleted from the bank leaves a gap
      // (its item goes with it), so the count is not where the list ends.
      const last = items.reduce((max, item) => Math.max(max, item.order), 0);
      await tx.exerciseSeriesItem.createMany({
        data: fresh.map((exerciseId, index) => ({ seriesId, exerciseId, order: nextOrder(last + index) })),
      });
      await tx.exerciseSeries.update({ where: { id: seriesId }, data: { updatedAt: new Date() } });
    });
  } catch (error) {
    if (error instanceof SeriesRefused) return popupFormError({}, values, { code: error.code });
    if (
      isUniqueConstraintError(error, "ExerciseSeriesItem_pkey", "exerciseId") ||
      isUniqueConstraintError(error, "ExerciseSeriesItem_seriesId_order_key", "order")
    ) {
      return popupFormError({}, values, { code: "seriesChanged" });
    }
    throw error;
  }
  revalidateSeries(seriesId);
  return popupFormDone("seriesExercisesAdded");
}

/**
 * «Quitar» an exercise from the series: the exercise stays in the bank, and
 * the attempts made in the series keep it. The rest close the gap
 * (`planDenseRenumber`).
 */
export async function removeExerciseFromSeries(
  seriesId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const back = teacherRoutes.exerciseSeries(seriesId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { teacher, throttled } = await openSeries("series-edit", 120);
  if (throttled) redirect(withErrorParam(back, "throttled"));
  if (!(await ownsSeries(seriesId, teacher.id)))
    redirect(withErrorParam(teacherRoutes.exerciseSeriesList, "seriesNotFound"));

  let changed = false;
  try {
    await getPlatformDb().$transaction(async (tx) => {
      await tx.exerciseSeriesItem.deleteMany({ where: { seriesId, exerciseId } });
      const rest = await tx.exerciseSeriesItem.findMany({
        where: { seriesId },
        select: { exerciseId: true, order: true },
      });
      const updates = planDenseRenumber(rest.map((item) => ({ id: item.exerciseId, order: item.order })));
      for (const update of updates) {
        await tx.exerciseSeriesItem.update({
          where: { seriesId_exerciseId: { seriesId, exerciseId: update.id } },
          data: { order: update.order },
        });
      }
      await tx.exerciseSeries.update({ where: { id: seriesId }, data: { updatedAt: new Date() } });
    });
  } catch (error) {
    if (!isUniqueConstraintError(error, "ExerciseSeriesItem_seriesId_order_key", "order")) throw error;
    changed = true;
  }
  if (changed) redirect(withErrorParam(back, "seriesChanged"));
  revalidateSeries(seriesId);
  redirect(withNoticeParam(back, "seriesExerciseRemoved"));
}

/**
 * The series' order after a drop or a step: the FULL list of its exercises.
 * Optimistic in the browser; when it is refused (an incomplete list, a race)
 * nothing is written and the page's revalidation brings the stored order back.
 */
export async function reorderExerciseSeries(seriesId: string, orderedIds: string[]): Promise<void> {
  if (!EXERCISES_ENABLED) return;
  const { teacher, throttled } = await openSeries("series-edit", 120);
  if (throttled) return;
  const ids = orderedIds.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64);
  if (ids.length !== orderedIds.length || !(await ownsSeries(seriesId, teacher.id))) return;

  try {
    await getPlatformDb().$transaction(async (tx) => {
      const rows = await tx.exerciseSeriesItem.findMany({
        where: { seriesId },
        select: { exerciseId: true, order: true },
      });
      const updates = planFullReorder(
        rows.map((row) => ({ id: row.exerciseId, order: row.order })),
        ids,
      );
      for (const update of updates) {
        await tx.exerciseSeriesItem.update({
          where: { seriesId_exerciseId: { seriesId, exerciseId: update.id } },
          data: { order: update.order },
        });
      }
    });
  } catch (error) {
    if (!isUniqueConstraintError(error, "ExerciseSeriesItem_seriesId_order_key", "order")) throw error;
  }
  revalidateSeries(seriesId);
}

/**
 * «Eliminar la serie», from its confirmation. Its exercises stay in the
 * bank; its students stop seeing it; their attempts stay in their history,
 * without the series (`TrainingAttempt.seriesId` is set to null by its
 * foreign key).
 */
export async function deleteExerciseSeries(seriesId: string, formData: FormData): Promise<void> {
  void formData;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(teacherRoutes.exerciseSeries(seriesId), "disabled"));
  const { teacher, throttled } = await openSeries("series-edit", 120);
  if (throttled) redirect(withErrorParam(teacherRoutes.exerciseSeries(seriesId), "throttled"));

  const deleted = await getPlatformDb().exerciseSeries.deleteMany({ where: { id: seriesId, teacherId: teacher.id } });
  if (deleted.count === 0) redirect(withErrorParam(teacherRoutes.exerciseSeriesList, "seriesNotFound"));
  revalidateSeries();
  redirect(withNoticeParam(teacherRoutes.exerciseSeriesList, "seriesDeleted"));
}

/**
 * «Compartir» the series with a student (D31). Checked against the database,
 * as `shareStudyWithStudent` checks a collection: an active teacher
 * (`requireTeacher`), the series is theirs, and the student has an active
 * assignment with them. Giving it twice is no error: the unique index on
 * (series, student) keeps one row.
 */
export async function shareSeriesWithStudent(seriesId: string, formData: FormData): Promise<void> {
  const back = teacherRoutes.exerciseSeries(seriesId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { teacher, throttled } = await openSeries("share-series", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));
  const { studentId } = readIds(formData, "studentId");
  if (studentId.length === 0) redirect(withErrorParam(back, "invalid"));
  if (!(await ownsSeries(seriesId, teacher.id)))
    redirect(withErrorParam(teacherRoutes.exerciseSeriesList, "seriesNotFound"));

  const db = getPlatformDb();
  const assignment = await db.teacherStudent.findFirst({
    where: { teacherId: teacher.id, studentId, endedAt: null },
    select: { id: true },
  });
  if (!assignment) redirect(withErrorParam(back, "notAssigned"));

  await db.exerciseSeriesShare.upsert({
    where: { seriesId_userId: { seriesId, userId: studentId } },
    update: {},
    create: { seriesId, userId: studentId, teacherId: teacher.id },
  });
  revalidateSeries(seriesId);
  redirect(withNoticeParam(back, "seriesShared"));
}

/** «Quitar» a student's share: the series stays the teacher's, and the student's attempts stay in their history. */
export async function unshareSeriesWithStudent(seriesId: string, formData: FormData): Promise<void> {
  const back = teacherRoutes.exerciseSeries(seriesId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { teacher, throttled } = await openSeries("share-series", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));
  const { studentId } = readIds(formData, "studentId");
  if (studentId.length === 0) redirect(withErrorParam(back, "invalid"));

  await getPlatformDb().exerciseSeriesShare.deleteMany({
    where: { seriesId, userId: studentId, series: { teacherId: teacher.id } },
  });
  revalidateSeries(seriesId);
  redirect(withNoticeParam(back, "seriesUnshared"));
}

// --- Import (D12; PLAN.md §4.5) ---------------------------------------------

/** The import's budget: ten files per ten minutes, by user. */
const IMPORT_WINDOW_MS = 10 * 60_000;

/**
 * «Importar PGN», in two steps through `useActionState` (the second of the
 * documented exceptions to «every action redirects», with the editor's save):
 * «Revisar» (`intent=preview`) reads the file and answers the report — one
 * row per game, what will happen to it and why — and writes nothing;
 * «Importar» (`intent=import`) reads it again and writes the accepted rows in
 * one transaction, each through `createExerciseRecord` and, for «Listo», the
 * owner's status writer, then into the chosen series; then it redirects to
 * the bank with the counts. A refusal comes back with the report still on
 * screen. The PGN is not handed back in `values`: the page keeps it.
 */
export async function importTeacherExercises(
  prev: ExerciseImportFormState,
  formData: FormData,
): Promise<ExerciseImportFormState> {
  void prev;
  const values = readFormValues(
    formData,
    EXERCISE_IMPORT_FIELDS.filter((field) => field !== "pgn"),
  );
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { teacher, user } = await requireTeacher();
  if (!(await allowAction(`${user.id}:exercise-import`, 10, IMPORT_WINDOW_MS))) {
    return popupFormError({}, values, { code: "throttled" });
  }

  const read = readExerciseImportForm(formData);
  if (!read.ok) {
    const code = read.field === "pgn" ? (read.code === "too_big" ? "pgnTooLong" : "pgn") : read.field;
    return popupFormError({ [read.field || "pgn"]: { code } }, values);
  }
  const { pgn, intent, status, seriesId, defaults } = read.values;
  if (seriesId && !(await ownsSeries(seriesId, teacher.id))) {
    return popupFormError({ seriesId: { code: "seriesNotFound" } }, values);
  }

  const db = getPlatformDb();
  const [catalogs, own] = await Promise.all([
    getExerciseCatalogs(),
    db.exercise.findMany({
      where: buildOwnExercisesWhere(teacher.id),
      select: { startPositionHash: true, solutionPgn: true },
    }),
  ]);
  const target = status === "draft" ? "draft" : "ready";
  const reading = readExerciseImport(
    pgn,
    { ...defaults, target },
    catalogs.topics,
    own.map((row) => ({ startPositionHash: row.startPositionHash, firstSan: firstSanOf(row.solutionPgn) })),
  );
  const report = exerciseImportReport(reading, target, "teacher");
  if (intent === "preview") return { status: "idle", values, report };
  if (reading.accepted.length === 0) return { ...popupFormError({}, values, { code: "importNothing" }), report };

  const now = new Date();
  let written: { ready: number; drafts: number };
  try {
    written = await db.$transaction(
      (tx) =>
        writeExerciseImport(tx, {
          accepted: reading.accepted,
          teacherId: teacher.id,
          authorUserId: user.id,
          move:
            target === "draft"
              ? null
              : (client, exerciseId) =>
                  transitionOwnExercise(client as typeof tx, {
                    exerciseId,
                    teacherId: teacher.id,
                    actorUserId: user.id,
                    to: EXERCISE_STATUS.READY,
                    now,
                  }),
          seriesId,
        }),
      { timeout: 60_000 },
    );
  } catch (error) {
    if (error instanceof ExerciseImportRefused) {
      return { ...popupFormError({}, values, { code: error.result.code }), report };
    }
    if (error instanceof ExerciseImportSeriesFull) {
      return { ...popupFormError({ seriesId: { code: "seriesFull" } }, values), report };
    }
    throw error;
  }
  revalidateExercise();
  if (seriesId) revalidateSeries(seriesId);
  redirect(withNoticeParam(teacherRoutes.exercises, "exercisesImported", [written.ready, written.drafts]));
}
