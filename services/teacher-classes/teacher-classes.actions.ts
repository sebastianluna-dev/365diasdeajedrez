"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  CLASS_STATUS,
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
} from "@/constants/platform/class-codes.const";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { assertTeacherCanReferenceGame, assertTeacherOwnsClass } from "@/lib/platform-auth/guards";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { recordAttendance } from "@/services/shared/class-attendance.service";
import { editableClassFields } from "@/services/shared/class-rules";
import { transitionClassStatus } from "@/services/shared/class-status.service";
import { formOptionalText, formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";
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
import { gameBlockSource } from "./block-rules";
import { getPgnForReference } from "./teacher-classes.service";
import { teacherPhaseOf } from "./teacher-classes.mapper";

// Writes of the teacher panel: the topic, the blocks, the attendance and
// what is written after the class. Rules that are NOT negotiable:
// - Every action opens with requireTeacher() and, with a classId, continues
//   with assertTeacherOwnsClass. They are reachable by direct POST.
// - When a class is, how it is joined, who is in it and its status are the
//   staff's; the teacher writes only through the shared writers of
//   services/shared/ (attendance, status when finalizing) and the columns that
//   are theirs alone: title, description, summary, recording and the blocks.
// - The popup actions return a `PopupFormState`; the ones a confirmation
//   runs redirect with the notice.

const WINDOW_MS = 60_000;

/** Revalidates every page that draws the class: the teacher's, the staff's and the student's. */
function revalidateClass(classId: string): void {
  revalidatePath(teacherRoutes.classDetail(classId));
  revalidatePath(teacherRoutes.classes);
  revalidatePath(teacherRoutes.home);
  revalidatePath(staffRoutes.staffClassDetail(classId));
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
  revalidatePath(platformRoutes.classes);
  revalidatePath(platformRoutes.dashboard);
}

async function openClass(classId: string, key: string, limit: number) {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);
  const throttled = !(await allowAction(`${user.id}:${key}`, limit, WINDOW_MS));
  return { teacher, user, throttled };
}

/** The phase the class is in now, for what it allows. */
async function phaseOf(classId: string, now: Date) {
  const row = await getPlatformDb().class.findUnique({
    where: { id: classId },
    select: {
      scheduledAt: true,
      endsAt: true,
      meetingUrl: true,
      meetingUrlVisibleFrom: true,
      status: { select: { code: true } },
      participants: { where: { seatMovedAt: null }, select: { userId: true } },
    },
  });
  if (!row) return null;
  return {
    phase: teacherPhaseOf({ ...row, statusCode: row.status.code as typeof CLASS_STATUS.SCHEDULED }, now),
    seatIds: row.participants.map((seat) => seat.userId),
  };
}

const TOPIC_SCHEMA = z.object({ title: formText(120), description: formOptionalText(500) });

/** «Editar el tema»: the title (required) and the description. */
export async function updateClassTopic(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, ["title", "description"]);
  const { throttled } = await openClass(classId, "class-topic", 60);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(TOPIC_SCHEMA, formData);
  if (!parsed.ok)
    return popupFormError({ [parsed.field]: { code: parsed.field === "title" ? "topic" : "invalid" } }, values);
  const current = await phaseOf(classId, new Date());
  if (!current || !editableClassFields(current.phase).topic) return popupFormError({}, values, { code: "notEditable" });

  await getPlatformDb().class.update({
    where: { id: classId },
    data: { title: parsed.data.title, description: parsed.data.description },
  });
  revalidateClass(classId);
  return popupFormDone("topicSaved");
}

/** The marks a form sent, `attendance.<id>` = yes | no, for the given seats. */
function readMarks(
  formData: FormData,
  seatIds: string[],
): { marks: { studentId: string; attended: boolean }[]; missing: string[] } {
  const marks: { studentId: string; attended: boolean }[] = [];
  const missing: string[] = [];
  for (const studentId of seatIds) {
    const value = formData.get(`attendance.${studentId}`);
    if (value === "yes" || value === "no") marks.push({ studentId, attended: value === "yes" });
    else missing.push(studentId);
  }
  return { marks, missing };
}

const AFTER_SCHEMA = z.object({ summary: formOptionalText(5000), recordingUrl: formOptionalUrl(2000) });

/**
 * «Finalizar la clase» (PROF-3): every seat marked, the summary and the
 * recording if written, and the class COMPLETED — in one transaction, through
 * `recordAttendance` and `transitionClassStatus`.
 */
export async function finalizeClass(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const marksSent = [...formData.keys()].filter((key) => key.startsWith("attendance."));
  const values = readFormValues(formData, ["summary", "recordingUrl", ...marksSent]);
  const { user, throttled } = await openClass(classId, "class-finalize", 20);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(AFTER_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ [parsed.field]: { code: parsed.field } }, values);
  const now = new Date();
  const current = await phaseOf(classId, now);
  if (!current || !editableClassFields(current.phase).finalize)
    return popupFormError({}, values, { code: "notEditable" });
  const { marks, missing } = readMarks(formData, current.seatIds);
  if (missing.length > 0) {
    return popupFormError(
      Object.fromEntries(missing.map((id) => [`attendance.${id}`, { code: "missingMark" }])),
      values,
      { code: "missingMark" },
    );
  }

  const outcome = await getPlatformDb()
    .$transaction(async (tx) => {
      const marked = await recordAttendance(tx, {
        classId,
        marks,
        actor: { userId: user.id, role: "teacher" },
        mode: "finalize",
        reason: null,
        now,
      });
      if (!marked.ok) return { ok: false as const, code: marked.code };
      await tx.class.update({
        where: { id: classId },
        data: { summary: parsed.data.summary, recordingUrl: parsed.data.recordingUrl },
      });
      const closed = await transitionClassStatus(tx, {
        classId,
        to: CLASS_STATUS.COMPLETED,
        actor: { userId: user.id, role: "teacher" },
        now,
      });
      if (!closed.written) throw new Refused("classClosed");
      return { ok: true as const };
    })
    .catch((error: unknown) => {
      if (error instanceof Refused) return { ok: false as const, code: error.code };
      throw error;
    });
  if (!outcome.ok) return popupFormError({}, values, { code: outcome.code });

  revalidateClass(classId);
  return popupFormDone("classFinalized");
}

/** A refusal inside the transaction: thrown so the writes roll back. */
class Refused extends Error {
  constructor(readonly code: string) {
    super(`refused: ${code}`);
  }
}

/** «Cambiar la asistencia» of a finished class (D3): the teacher's own marks, logged, no reason. */
export async function changeAttendance(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const marksSent = [...formData.keys()].filter((key) => key.startsWith("attendance."));
  const values = readFormValues(formData, marksSent);
  const { user, throttled } = await openClass(classId, "class-attendance", 30);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const now = new Date();
  const current = await phaseOf(classId, now);
  if (!current || !editableClassFields(current.phase).changeAttendance)
    return popupFormError({}, values, { code: "notEditable" });
  const { marks } = readMarks(formData, current.seatIds);
  if (marks.length === 0) return popupFormError({}, values, { code: "attendanceRequired" });

  const result = await getPlatformDb().$transaction((tx) =>
    recordAttendance(tx, {
      classId,
      marks,
      actor: { userId: user.id, role: "teacher" },
      mode: "change",
      reason: null,
      now,
    }),
  );
  if (!result.ok) return popupFormError({}, values, { code: result.code });

  revalidateClass(classId);
  return popupFormDone("attendanceChanged");
}

/** «Después de la clase»: the summary and the recording, both optional, once the class is done. */
export async function updateClassAfterNotes(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, ["summary", "recordingUrl"]);
  const { throttled } = await openClass(classId, "class-after", 60);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(AFTER_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ [parsed.field]: { code: parsed.field } }, values);
  const current = await phaseOf(classId, new Date());
  if (!current || !editableClassFields(current.phase).afterNotes)
    return popupFormError({}, values, { code: "notEditable" });

  await getPlatformDb().class.update({
    where: { id: classId },
    data: { summary: parsed.data.summary, recordingUrl: parsed.data.recordingUrl },
  });
  revalidateClass(classId);
  return popupFormDone("afterNotesSaved");
}

const VISIBILITY = z.enum([
  CLASS_BLOCK_VISIBILITY.BEFORE,
  CLASS_BLOCK_VISIBILITY.AFTER,
  CLASS_BLOCK_VISIBILITY.TEACHER,
]);

/**
 * The order of the class's blocks after a drop or a step: the FULL list
 * (`blockOrderAfterDrop`), and the moved block's visibility when the drop
 * crossed a section. `planFullReorder` discards an incomplete list.
 */
export async function reorderClassBlocks(
  classId: string,
  orderedIds: string[],
  moved?: { blockId: string; visibility: ClassBlockVisibilityCode },
): Promise<{ ok: boolean }> {
  const { throttled } = await openClass(classId, "class-block-order", 120);
  if (throttled) return { ok: false };
  const ids = orderedIds.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64);
  if (ids.length !== orderedIds.length) return { ok: false };
  const visibility = moved ? VISIBILITY.safeParse(moved.visibility) : null;
  if (visibility && !visibility.success) return { ok: false };

  const db = getPlatformDb();
  try {
    await db.$transaction(async (tx) => {
      const rows = await tx.classBlock.findMany({ where: { classId }, select: { id: true, order: true } });
      const updates = planFullReorder(rows, ids);
      if (updates.length === 0 && rows.length !== ids.length) throw new Refused("order");
      for (const update of updates) {
        await tx.classBlock.update({ where: { id: update.id }, data: { order: update.order } });
      }
      if (moved && visibility?.success) {
        await tx.classBlock.updateMany({
          where: { id: moved.blockId, classId },
          data: { visibility: { connect: { code: visibility.data } } } as Prisma.ClassBlockUpdateManyMutationInput,
        });
      }
    });
  } catch (error) {
    if (error instanceof Refused || isUniqueConstraintError(error, "ClassBlock_classId_order_key", "order"))
      return { ok: false };
    throw error;
  }
  revalidateClass(classId);
  return { ok: true };
}

const BLOCK_COMMON_SCHEMA = z.object({
  kind: z.enum([CLASS_BLOCK_KIND.TEXT, CLASS_BLOCK_KIND.VIDEO, CLASS_BLOCK_KIND.GAME_REF, CLASS_BLOCK_KIND.LESSON_REF]),
  visibility: VISIBILITY,
  caption: formOptionalText(200),
  movePath: formOptionalText(200),
});
const BLOCK_TEXT_SCHEMA = z.object({ text: formText(10_000) });
const BLOCK_VIDEO_SCHEMA = z.object({ videoUrl: formOptionalUrl(2000) });
const BLOCK_GAME_SCHEMA = z.object({
  pgn: z.string().trim().max(PGN_MAX_LENGTH).optional(),
  gameId: z.string().trim().max(64).optional(),
});
const BLOCK_LESSON_SCHEMA = z.object({ lessonId: formText(40) });
const BLOCK_FIELDS = [
  "kind",
  "visibility",
  "caption",
  "movePath",
  "text",
  "videoUrl",
  "pgn",
  "gameId",
  "lessonId",
  "source",
];

interface BlockFields {
  gameId: string | null;
  lessonId: string | null;
  text: string | null;
  videoUrl: string | null;
  movePath: string | null;
  pgn: string | null;
}

/** A field the form refused, with its code. */
class BlockRefused extends Error {
  constructor(
    readonly field: string,
    readonly fieldError: FieldError,
  ) {
    super(`block refused: ${field} ${fieldError.code}`);
  }
}

/**
 * The block's fields by its kind, every other one null: what the
 * `class_block_single_ref` CHECK asks for, and what keeps a change of kind
 * from leaving the old kind's data behind.
 */
async function readBlockFields(
  kind: ClassBlockKindCode,
  movePath: string | null,
  formData: FormData,
  teacher: { id: string; userId: string },
): Promise<BlockFields> {
  const empty: BlockFields = { gameId: null, lessonId: null, text: null, videoUrl: null, movePath: null, pgn: null };
  switch (kind) {
    case CLASS_BLOCK_KIND.TEXT: {
      const parsed = parseForm(BLOCK_TEXT_SCHEMA, formData);
      if (!parsed.ok) throw new BlockRefused("text", { code: "blockText" });
      return { ...empty, text: parsed.data.text };
    }
    case CLASS_BLOCK_KIND.VIDEO: {
      const parsed = parseForm(BLOCK_VIDEO_SCHEMA, formData);
      if (!parsed.ok || parsed.data.videoUrl === null) throw new BlockRefused("videoUrl", { code: "blockVideo" });
      return { ...empty, videoUrl: parsed.data.videoUrl };
    }
    case CLASS_BLOCK_KIND.GAME_REF: {
      const parsed = parseForm(BLOCK_GAME_SCHEMA, formData);
      if (!parsed.ok)
        throw new BlockRefused(parsed.field, { code: parsed.field === "pgn" ? "blockPgnTooLong" : "blockRef" });
      const source = gameBlockSource(parsed.data);
      if ("error" in source) throw new BlockRefused("pgn", { code: source.error });
      if (source.kind === "pgn") {
        // The board validates on the client for convenience; what decides is this.
        const tree = parsePgnTree(source.pgn);
        if (tree === null) throw new BlockRefused("pgn", { code: "blockPgn" });
        if (tree.children.length === 0) throw new BlockRefused("pgn", { code: "blockPgnEmpty" });
        return { ...empty, pgn: source.pgn, movePath };
      }
      // The assignment is checked HERE, on insertion: a block already made stays valid if the student is reassigned.
      await assertTeacherCanReferenceGame(teacher, source.gameId);
      return { ...empty, gameId: source.gameId, movePath };
    }
    case CLASS_BLOCK_KIND.LESSON_REF: {
      const parsed = parseForm(BLOCK_LESSON_SCHEMA, formData);
      if (!parsed.ok) throw new BlockRefused("lessonId", { code: "blockRef" });
      // Only lessons of PUBLISHED courses: the block offers a link to open it, and in a draft that leads nowhere.
      const lesson = await getPlatformDb().lesson.findFirst({
        where: { id: parsed.data.lessonId, chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } } },
        select: { id: true },
      });
      if (!lesson) throw new BlockRefused("lessonId", { code: "blockRef" });
      return { ...empty, lessonId: lesson.id, movePath };
    }
    default:
      throw new BlockRefused("kind", { code: "blockKind" });
  }
}

function toCreateData(fields: BlockFields) {
  return {
    text: fields.text,
    videoUrl: fields.videoUrl,
    movePath: fields.movePath,
    pgn: fields.pgn,
    ...(fields.gameId ? { game: { connect: { id: fields.gameId } } } : {}),
    ...(fields.lessonId ? { lesson: { connect: { id: fields.lessonId } } } : {}),
  };
}

/** In an update the references that no longer apply are DISCONNECTED, or the CHECK goes off. */
function toUpdateData(fields: BlockFields) {
  return {
    text: fields.text,
    videoUrl: fields.videoUrl,
    movePath: fields.movePath,
    pgn: fields.pgn,
    game: fields.gameId ? { connect: { id: fields.gameId } } : { disconnect: true },
    lesson: fields.lessonId ? { connect: { id: fields.lessonId } } : { disconnect: true },
    position: { disconnect: true },
  };
}

async function readBlock(formData: FormData, teacher: { id: string; userId: string }) {
  const common = parseForm(BLOCK_COMMON_SCHEMA, formData);
  if (!common.ok) {
    throw new BlockRefused(common.field, {
      code: common.field === "kind" ? "blockKind" : common.field === "visibility" ? "blockVisibility" : "invalid",
    });
  }
  const fields = await readBlockFields(common.data.kind, common.data.movePath, formData, teacher);
  return { common: common.data, fields };
}

/** «Agregar un bloque»: its kind, when the student sees it, and its fields. */
export async function addClassBlock(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, BLOCK_FIELDS);
  const { teacher, user, throttled } = await openClass(classId, "class-block", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const current = await phaseOf(classId, new Date());
  if (!current || !editableClassFields(current.phase).content)
    return popupFormError({}, values, { code: "notEditable" });

  try {
    const { common, fields } = await readBlock(formData, { id: teacher.id, userId: user.id });
    const db = getPlatformDb();
    const count = await db.classBlock.count({ where: { classId } });
    await db.classBlock.create({
      data: {
        class: { connect: { id: classId } },
        order: nextOrder(count),
        kind: { connect: { code: common.kind } },
        visibility: { connect: { code: common.visibility } },
        caption: common.caption,
        ...toCreateData(fields),
      },
    });
  } catch (error) {
    if (error instanceof BlockRefused) return popupFormError({ [error.field]: error.fieldError }, values);
    throw error;
  }
  revalidateClass(classId);
  return popupFormDone("blockAdded");
}

/** «Editar el bloque». */
export async function updateClassBlock(
  classId: string,
  blockId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const values = readFormValues(formData, BLOCK_FIELDS);
  const { teacher, user, throttled } = await openClass(classId, "class-block", 120);
  if (throttled) return popupFormError({}, values, { code: "throttled" });
  const current = await phaseOf(classId, new Date());
  if (!current || !editableClassFields(current.phase).content)
    return popupFormError({}, values, { code: "notEditable" });

  try {
    const { common, fields } = await readBlock(formData, { id: teacher.id, userId: user.id });
    const db = getPlatformDb();
    // Looked up with classId in the where: a blockId of another class matches nothing.
    const block = await db.classBlock.findFirst({ where: { id: blockId, classId }, select: { id: true } });
    if (!block) return popupFormError({}, values, { code: "blockMissing" });
    await db.classBlock.update({
      where: { id: block.id },
      data: {
        kind: { connect: { code: common.kind } },
        visibility: { connect: { code: common.visibility } },
        caption: common.caption,
        ...toUpdateData(fields),
      },
    });
  } catch (error) {
    if (error instanceof BlockRefused) return popupFormError({ [error.field]: error.fieldError }, values);
    throw error;
  }
  revalidateClass(classId);
  return popupFormDone("blockSaved");
}

/** «Eliminar» a block, from its confirmation; the rest are renumbered densely. */
export async function deleteClassBlock(classId: string, blockId: string, formData: FormData): Promise<void> {
  void formData;
  const detailPath = teacherRoutes.classDetail(classId);
  const { throttled } = await openClass(classId, "class-block", 120);
  if (throttled) redirect(withErrorParam(detailPath, "throttled"));
  const current = await phaseOf(classId, new Date());
  if (!current || !editableClassFields(current.phase).content) redirect(withErrorParam(detailPath, "notEditable"));

  await getPlatformDb().$transaction(async (tx) => {
    const deleted = await tx.classBlock.deleteMany({ where: { id: blockId, classId } });
    if (deleted.count === 0) return;
    const remaining = await tx.classBlock.findMany({ where: { classId }, select: { id: true, order: true } });
    for (const update of planDenseRenumber(remaining)) {
      await tx.classBlock.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });
  revalidateClass(classId);
  redirect(withNoticeParam(detailPath, "blockDeleted"));
}

/**
 * PGN of a resource for the position picker of the block popup. A server
 * action because whoever needs it is a client component; it authorises
 * exactly like creating the block (inside `getPgnForReference`).
 */
export async function fetchReferencePgn(
  kind: typeof CLASS_BLOCK_KIND.GAME_REF | typeof CLASS_BLOCK_KIND.LESSON_REF,
  id: string,
): Promise<string | null> {
  return getPgnForReference(kind, id);
}
