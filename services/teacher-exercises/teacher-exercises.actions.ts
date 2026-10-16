"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { EXERCISE_FORM_FIELDS, exerciseErrorTab, readExerciseForm } from "@/services/shared/exercise-form";
import {
  createExerciseRecord,
  exerciseCopyInput,
  exerciseSolutionProblem,
  syncExerciseSolution,
} from "@/services/shared/exercise-record.service";
import { transitionOwnExercise, type ExerciseTransitionResult } from "@/services/shared/exercise-status.service";
import { exerciseReadiness, isExerciseContentLocked } from "@/services/shared/exercise-status-transitions";
import { buildOwnExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { popupFormError, readFormValues, type FieldError, type PopupFormState } from "@/services/shared/form-state";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { getTeacherGamePgn, isTeacherGame } from "./teacher-exercises.service";

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

/** A status move of the bank's rows, with its notice, back to the bank's view it was made from. */
async function moveOwnExercise(
  exerciseId: string,
  to: typeof EXERCISE_STATUS.ARCHIVED | typeof EXERCISE_STATUS.READY,
  notice: string,
  back: string,
): Promise<void> {
  if (!EXERCISES_ENABLED) redirect(withErrorParam(back, "disabled"));
  const { teacher, user, throttled } = await openBank("exercise-save", 60);
  if (throttled) redirect(withErrorParam(back, "throttled"));

  const moved = await getPlatformDb().$transaction((tx) =>
    transitionOwnExercise(tx, { exerciseId, teacherId: teacher.id, actorUserId: user.id, to, now: new Date() }),
  );
  if (!moved.ok) redirect(withErrorParam(back, moved.code));
  revalidateExercise(exerciseId);
  redirect(withNoticeParam(back, notice));
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
