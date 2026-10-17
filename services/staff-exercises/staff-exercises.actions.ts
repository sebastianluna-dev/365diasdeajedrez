"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EXERCISE_LIMITS, SERIES_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { EXERCISE_FORM_FIELDS, exerciseErrorTab, readExerciseForm } from "@/services/shared/exercise-form";
import {
  createExerciseRecord,
  exerciseSolutionProblem,
  syncExerciseSolution,
} from "@/services/shared/exercise-record.service";
import { reviewLibraryExercise, type ExerciseTransitionResult } from "@/services/shared/exercise-status.service";
import { exerciseReadiness, type ExerciseOwnerKind } from "@/services/shared/exercise-status-transitions";
import { buildPickableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { formOptionalText, formText, parseForm } from "@/services/shared/form-schema";
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
import { staffExercisePermissions } from "./staff-exercises.mapper";
import { getStaffGamePgn, isStaffGame, staffReadableExerciseWhere } from "./staff-exercises.service";

// The staff's writes of the exercise bank (PLAN.md §8; D07, D16, D32): the
// decisions about the library — approving or returning a teacher's proposal,
// taking an exercise out —, the academy's own exercises, and the academy's
// series. Rules that are NOT negotiable:
// - Every action checks `EXERCISES_ENABLED`, opens with requireStaff() and
//   is limited; they are reachable by direct POST.
// - An exercise is inserted only by `createExerciseRecord` (always DRAFT),
//   its solution changed only by `syncExerciseSolution`, its status only by
//   `reviewLibraryExercise`, the staff's rows of the transitions table,
//   inside one transaction: who decided, when and the note are its stamps. A
//   lesson's exercise is never reached from here (`staffReadableExerciseWhere`).
// - «Devolver» and «Quitar de la biblioteca» need the note the author reads.
// - An academy series holds only the library's exercises
//   (`buildPickableExercisesWhere` with no teacher, D32), checked again here
//   against the database; its order goes through services/shared/reorder.ts.

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

/** A status move that failed inside the transaction: thrown so nothing of the write stays. */
class RefusedMove extends Error {
  constructor(readonly result: Exclude<ExerciseTransitionResult, { ok: true }>) {
    super(`The exercise's status move was refused: ${result.code}`);
  }
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
 * The staff editor's save («Guardar borrador», «Guardar y publicar» or
 * «Guardar»), for a new academy exercise (`exerciseId` null) or one the staff
 * may write: the academy's, any status, and a teacher's in the library (D48;
 * its status is not moved). The button says what it asks for (`intent`), and
 * the owner and the status say whether it may: an academy draft is kept or
 * published (the staff is the reviewer, no review), one in the library is
 * kept published (and must stay complete), an archived academy one is kept
 * as it is. A teacher's proposal or returned exercise is locked.
 */
export async function saveStaffExercise(
  exerciseId: string | null,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, [...EXERCISE_FORM_FIELDS, "sourceGameId"]);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { user, throttled } = await openReview("exercise-save", 60);
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
  const existing = exerciseId
    ? await db.exercise.findFirst({
        where: staffReadableExerciseWhere(exerciseId),
        select: { id: true, teacherId: true, statusId: true, sourceGameId: true, status: { select: { code: true } } },
      })
    : null;
  if (exerciseId && !existing) return popupFormError({}, values, { code: "exerciseMissing" });
  const status = (existing?.status.code ?? null) as ExerciseStatusCode | null;
  const owner: ExerciseOwnerKind = existing?.teacherId ? "teacher" : "academy";
  if (staffExercisePermissions(owner, status).contentLocked) return popupFormError({}, values, { code: "locked" });

  const fromDraft = owner === "academy" && (status === null || status === EXERCISE_STATUS.DRAFT);
  const allowed =
    intent === "save"
      ? status === EXERCISE_STATUS.PUBLISHED || (owner === "academy" && status === EXERCISE_STATUS.ARCHIVED)
      : fromDraft;
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

  // The game it came from: kept only when it is one of the staff member's own studies' (D11).
  const sentGameId = String(formData.get("sourceGameId") ?? "").trim();
  const sourceGameId =
    sentGameId && (sentGameId === existing?.sourceGameId || (await isStaffGame(user.id, sentGameId)))
      ? sentGameId
      : null;

  const now = new Date();
  let savedId: string;
  try {
    savedId = await db.$transaction(async (tx) => {
      let id: string;
      if (!existing) {
        const created = await createExerciseRecord(tx, {
          teacherId: null,
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
          where: { id, statusId: existing.statusId },
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
            // A teacher's exercise keeps its own source game; the staff's choice applies to the academy's.
            ...(owner === "academy" ? { sourceGameId } : {}),
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
    throw error;
  }

  revalidateDecision(savedId);
  redirect(
    withNoticeParam(staffRoutes.exerciseDetail(savedId), publish ? "exercisePublishedToLibrary" : "exerciseSaved"),
  );
}

/** «Restaurar» an archived academy exercise: ARCHIVED → DRAFT, to publish again once it is complete. */
export async function restoreAcademyExercise(exerciseId: string, formData: FormData): Promise<void> {
  void formData;
  const back = staffRoutes.exerciseDetail(exerciseId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { user, throttled } = await openReview("exercise-review", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));

  const moved = await decide(exerciseId, EXERCISE_STATUS.DRAFT, null, user.id);
  if (!moved.ok) redirect(withErrorParam(back, errorCodeOf(moved)));
  revalidateDecision(exerciseId);
  redirect(withNoticeParam(back, "exerciseRestoredToDraft"));
}

/** «Desde una partida»: the PGN of a game of the staff member's own studies, for the editor's position picker. */
export async function fetchStaffGamePgn(gameId: string): Promise<string | null> {
  if (!EXERCISES_ENABLED) return null;
  return getStaffGamePgn(gameId);
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

// --- The academy's series (PLAN.md §8, D32) ---------------------------------

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

/** The bank's «Series» view, the series' own page and the students' home, which lists the published ones. */
function revalidateSeries(seriesId?: string): void {
  revalidatePath(staffRoutes.exerciseSeriesList);
  if (seriesId) {
    revalidatePath(staffRoutes.exerciseSeries(seriesId));
    revalidatePath(platformRoutes.exerciseSeries(seriesId));
  }
  revalidatePath(platformRoutes.exercises);
}

/** Whether the series is the academy's: a teacher's is not found here. */
async function isAcademySeries(seriesId: string): Promise<boolean> {
  const found = await getPlatformDb().exerciseSeries.count({ where: { id: seriesId, teacherId: null } });
  return found > 0;
}

/** The series' title and description from the popup, or the field that failed as the popup's error. */
function readSeriesForm(formData: FormData, values: Record<string, string | string[]>) {
  const parsed = parseForm(SERIES_SCHEMA, formData);
  if (parsed.ok) return { ok: true as const, data: parsed.data };
  const code = SERIES_FIELD_ERRORS[parsed.field] ?? "invalid";
  return { ok: false as const, state: popupFormError({ [parsed.field || "title"]: { code } }, values) };
}

/** «Nueva serie», from its popup: an empty, unpublished series of the academy's. It opens the new series. */
export async function createAcademySeries(prev: PopupFormState, formData: FormData): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, SERIES_FIELDS);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { user, throttled } = await openReview("series-edit", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const read = readSeriesForm(formData, values);
  if (!read.ok) return read.state;

  const created = await getPlatformDb().exerciseSeries.create({
    data: { teacherId: null, createdById: user.id, ...read.data },
    select: { id: true },
  });
  revalidateSeries(created.id);
  redirect(withNoticeParam(staffRoutes.exerciseSeries(created.id), "seriesCreated"));
}

/** «Editar la serie», from its popup: the title and the description the students read. */
export async function updateAcademySeries(
  seriesId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, SERIES_FIELDS);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { throttled } = await openReview("series-edit", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const read = readSeriesForm(formData, values);
  if (!read.ok) return read.state;

  const updated = await getPlatformDb().exerciseSeries.updateMany({
    where: { id: seriesId, teacherId: null },
    data: read.data,
  });
  if (updated.count === 0) return popupFormError({}, values, { code: "seriesNotFound" });
  revalidateSeries(seriesId);
  return popupFormDone("seriesSaved");
}

/**
 * «Agregar ejercicios», from its popup: the chosen exercises at the end of
 * the series, in the order they were ticked. Each must be in the library now
 * (D32: an academy series never shows a student something unreviewed); one
 * already in the series is skipped. Two adds at once race for the same
 * orders, and the loser's unique violation answers «La serie cambió».
 */
export async function addExercisesToAcademySeries(
  seriesId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, ["exercises"]);
  if (!EXERCISES_ENABLED) return popupFormError({}, values, { code: "disabled" });
  const { throttled } = await openReview("series-edit", 120);
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
  if (!(await isAcademySeries(seriesId))) return popupFormError({}, values, { code: "seriesNotFound" });

  try {
    await getPlatformDb().$transaction(async (tx) => {
      const items = await tx.exerciseSeriesItem.findMany({
        where: { seriesId },
        select: { exerciseId: true, order: true },
      });
      const inSeries = new Set(items.map((item) => item.exerciseId));
      const fresh = chosen.filter((id) => !inSeries.has(id));
      if (fresh.length === 0) return;
      if (items.length + fresh.length > SERIES_LIMITS.items) throw new SeriesRefused("seriesFull");
      const pickable = await tx.exercise.count({
        where: { AND: [{ id: { in: fresh } }, buildPickableExercisesWhere({ teacherId: null })] },
      });
      if (pickable !== fresh.length) throw new SeriesRefused("seriesNotPickable");
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

/** «Quitar» an exercise from the academy series: it stays in the library; the rest close the gap. */
export async function removeExerciseFromAcademySeries(
  seriesId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const back = staffRoutes.exerciseSeries(seriesId);
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { throttled } = await openReview("series-edit", 120);
  if (throttled) redirect(withErrorParam(back, "throttled"));
  if (!(await isAcademySeries(seriesId))) redirect(withErrorParam(staffRoutes.exerciseSeriesList, "seriesNotFound"));

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

/** The series' order after a drop or a step: the FULL list of its exercises. A refused order is not written. */
export async function reorderAcademySeries(seriesId: string, orderedIds: string[]): Promise<void> {
  if (!EXERCISES_ENABLED) return;
  const { throttled } = await openReview("series-edit", 120);
  if (throttled) return;
  const ids = orderedIds.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64);
  if (ids.length !== orderedIds.length || !(await isAcademySeries(seriesId))) return;

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
 * «Publicada», the switch on the series' page: on, every student sees the
 * series on «Series de la academia» (`publishedAt`, kept at its first
 * publication); off, it leaves their home and their series page, and the
 * attempts made in it stay in their history.
 */
export async function setAcademySeriesPublished(seriesId: string, published: boolean): Promise<void> {
  if (!EXERCISES_ENABLED) return;
  const { throttled } = await openReview("series-edit", 120);
  if (throttled) return;
  await getPlatformDb().exerciseSeries.updateMany({
    where: { id: seriesId, teacherId: null },
    data: { publishedAt: published ? new Date() : null },
  });
  revalidateSeries(seriesId);
}

/** «Eliminar la serie», from its confirmation: its exercises stay in the library; the attempts stay, without the series. */
export async function deleteAcademySeries(seriesId: string, formData: FormData): Promise<void> {
  void formData;
  if (!EXERCISES_ENABLED) redirect(withErrorParam(staffRoutes.exerciseSeries(seriesId), "disabled"));
  const { throttled } = await openReview("series-edit", 120);
  if (throttled) redirect(withErrorParam(staffRoutes.exerciseSeries(seriesId), "throttled"));

  const deleted = await getPlatformDb().exerciseSeries.deleteMany({ where: { id: seriesId, teacherId: null } });
  if (deleted.count === 0) redirect(withErrorParam(staffRoutes.exerciseSeriesList, "seriesNotFound"));
  revalidateSeries();
  redirect(withNoticeParam(staffRoutes.exerciseSeriesList, "academySeriesDeleted"));
}
