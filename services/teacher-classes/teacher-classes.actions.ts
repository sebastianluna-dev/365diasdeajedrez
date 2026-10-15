"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_STATUS,
  type ClassBlockKindCode,
  type ClassStatusCode,
} from "@/constants/platform/class-codes.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import {
  assertTeacherCanReferenceGame,
  assertTeacherHasStudent,
  assertTeacherOwnsClass,
} from "@/lib/platform-auth/guards";
import { requireTeacher, type TeacherContext } from "@/lib/platform-auth/roles";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { parseDateTimeLocal, safeTimeZone } from "@/lib/timezone";
import { z } from "zod";
import {
  formInt,
  formOptionalText,
  formOptionalUrl,
  formText,
  parseForm,
  readIds,
} from "@/services/shared/form-schema";
import { getPgnForReference } from "./teacher-classes.service";
import { planDenseRenumber, planSwap, nextOrder, type MoveDirection } from "@/services/shared/reorder";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { recordAttendance } from "@/services/shared/class-attendance.service";
import { classPhase } from "@/services/shared/class-phase";
import { canFinalizeClass } from "@/services/shared/class-rules";
import { createClassRecord, syncClassMeeting, syncClassSchedule } from "@/services/shared/class-schedule.service";
import { removeClassSeat, syncClassSeat } from "@/services/shared/class-seats.service";
import { transitionClassStatus } from "@/services/shared/class-status.service";
import { meetingVisibleFrom } from "@/services/shared/meeting-visible-from";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";

// Writes of the teacher panel. Rules that are NOT negotiable:
// - Every action opens with requireTeacher(); those that receive a classId
//   continue with assertTeacherOwnsClass. They are reachable by direct POST, so
//   hiding a button protects nothing.
// - Catalogs are connected by `code`, never by id.
// - Errors come back by redirect with `?error=<code>` (message map in
//   constants/platform/teacher-messages.const.ts).
// - When a class is, how it is joined, its status, its seats and its marks are
//   written ONLY by the shared writers of services/shared/ (class-schedule,
//   class-status, class-seats, class-attendance), inside this file's
//   transaction. This file writes the columns that are the teacher's alone:
//   title, description, recording and summary, and the blocks.
//
// These are the OLD screens, kept on top of the writers until phase 6 retires
// them.

const CLASS_META_SCHEMA = z.object({
  title: formText(120),
  description: formOptionalText(500),
  // `datetime-local` values: the teacher's wall-clock time, converted with THEIR zone below.
  scheduledAt: formText(40),
  durationMin: formInt(15, 480),
  // The form still sends `meetingProviderCode`; it is ignored: the platform is
  // read from the link by the writer (`classMeetingColumns`).
  meetingUrl: formOptionalUrl(2000),
  meetingUrlVisibleFrom: z.string().trim().max(40).optional(),
});
/** Which `?error=` code names each field of the class form. */
const CLASS_META_ERROR: Record<string, string> = {
  title: "title",
  scheduledAt: "schedule",
  durationMin: "duration",
  meetingUrl: "meetingUrl",
  meetingUrlVisibleFrom: "schedule",
};
const CLASS_EXTRA_SCHEMA = z.object({ recordingUrl: formOptionalUrl(2000), summary: formOptionalText(5000) });
const STATUS_SCHEMA = z.object({
  statusCode: formText(32).refine((value) => (Object.values(CLASS_STATUS) as string[]).includes(value)),
});
const STUDENT_SCHEMA = z.object({ studentId: formText(64) });
const ATTENDANCE_SCHEMA = z.object({ attended: z.array(z.string().trim().max(64)) });
const BLOCK_COMMON_SCHEMA = z.object({
  kind: formText(32).refine((value) => (Object.values(CLASS_BLOCK_KIND) as string[]).includes(value)),
  caption: formOptionalText(200),
  movePath: formOptionalText(200),
});
const BLOCK_TEXT_SCHEMA = z.object({ text: formText(10_000) });
const BLOCK_VIDEO_SCHEMA = z.object({ videoUrl: formOptionalUrl(2000) });
const BLOCK_GAME_SCHEMA = z.object({
  pgn: z.string().trim().max(PGN_MAX_LENGTH).optional(),
  gameId: z.string().trim().max(64).optional(),
});
const MOVE_SCHEMA = z.object({ blockId: formText(64), direction: z.enum(["up", "down"]) });

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
}

/**
 * A writer's refusal, thrown INSIDE a transaction so everything written before
 * it rolls back, and turned into the redirect once outside. A `redirect()`
 * thrown inside the transaction would roll it back too, but the error code is
 * decided here and read in one place.
 */
class ClassWriteRefused extends Error {
  constructor(readonly code: string) {
    super(`class write refused: ${code}`);
  }
}

/** Runs `write` in a transaction and answers a refusal with the form's error. */
async function transactionOrFail<T>(failPath: string, write: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  try {
    return await getPlatformDb().$transaction(write);
  } catch (error) {
    if (error instanceof ClassWriteRefused) fail(failPath, error.code);
    throw error;
  }
}

async function teacherTimeZone(teacherId: string): Promise<string> {
  const row = await getPlatformDb().teacher.findUnique({ where: { id: teacherId }, select: { timezone: true } });
  return safeTimeZone(row?.timezone);
}

interface ClassMetaInput {
  title: string;
  description: string | null;
  scheduledAt: Date;
  durationMin: number;
  meetingUrl: string | null;
  /** The instant the teacher chose for the link to open, or null for the default. */
  meetingVisibleFromChosen: Date | null;
}

/** Reads and validates the metadata common to creating and editing a class. */
async function readClassMeta(
  formData: FormData,
  teacher: TeacherContext["teacher"],
  failPath: string,
): Promise<ClassMetaInput> {
  const parsed = parseForm(CLASS_META_SCHEMA, formData);
  if (!parsed.ok) fail(failPath, CLASS_META_ERROR[parsed.field] ?? "invalid");
  const { title, description, durationMin, meetingUrl } = parsed.data;

  const timeZone = await teacherTimeZone(teacher.id);
  // The input is `datetime-local`: the teacher's wall-clock time, which is
  // converted to UTC with THEIR zone (or UTC if they have none configured).
  const scheduledAt = parseDateTimeLocal(parsed.data.scheduledAt, timeZone);
  if (!scheduledAt) fail(failPath, "schedule");

  // A malformed instant is an error even without a link, where it is not stored.
  const visibleFromRaw = parsed.data.meetingUrlVisibleFrom ?? "";
  const chosenVisibleFrom = visibleFromRaw.length > 0 ? parseDateTimeLocal(visibleFromRaw, timeZone) : null;
  if (visibleFromRaw.length > 0 && chosenVisibleFrom === null) fail(failPath, "schedule");

  // What is stored («only a chosen instant, and only with a link») is the
  // writer's business: the chosen instant travels as it is.
  return { title, description, scheduledAt, durationMin, meetingUrl, meetingVisibleFromChosen: chosenVisibleFrom };
}

/** Which `?error=` code answers each refusal of `createClassRecord`. */
const CREATE_CLASS_ERROR: Record<"capacity" | "groupTitle" | "meetingOpensLate", string> = {
  capacity: "invalid",
  groupTitle: "title",
  meetingOpensLate: "schedule",
};

export async function createClass(formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  if (!(await allowAction(`${user.id}:class-create`, 20, 3_600_000))) fail(teacherRoutes.newClass, "throttled");

  const meta = await readClassMeta(formData, teacher, teacherRoutes.newClass);

  // Initial participants: only students with an active assignment. Each is checked
  // one by one against the database, never by whatever comes ticked in the form.
  const studentIds = formData.getAll("studentIds").filter((value): value is string => typeof value === "string");
  for (const studentId of studentIds) await assertTeacherHasStudent(teacher.id, studentId);

  // The old form has no format: two or more students make a group class, with
  // room for exactly them; otherwise it is individual.
  const group = studentIds.length >= 2;
  const classId = await transactionOrFail(teacherRoutes.newClass, async (tx) => {
    const record = await createClassRecord(tx, {
      teacherId: teacher.id,
      formatCode: group ? CLASS_FORMAT.GROUP : CLASS_FORMAT.INDIVIDUAL,
      capacity: group ? Math.max(2, studentIds.length) : null,
      title: meta.title,
      description: meta.description,
      scheduledAt: meta.scheduledAt,
      durationMin: meta.durationMin,
      meetingUrl: meta.meetingUrl,
      meetingVisibleFromChosen: meta.meetingVisibleFromChosen,
      createdById: user.id,
    });
    if (!record.ok) throw new ClassWriteRefused(CREATE_CLASS_ERROR[record.code]);

    // Every seat starts «Sin pago»: the old screen knows nothing of payments.
    for (const studentId of studentIds) {
      const seat = await syncClassSeat(tx, {
        classId: record.id,
        studentId,
        coverage: "unpaid",
        addedById: user.id,
        mode: "add",
      });
      if (!seat.ok) throw new ClassWriteRefused("student");
    }
    return record.id;
  });

  revalidatePath(teacherRoutes.classes);
  revalidatePath(teacherRoutes.home);
  redirect(teacherRoutes.classDetail(classId));
}

export async function updateClassMeta(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const editPath = teacherRoutes.classEdit(classId);
  if (!(await allowAction(`${user.id}:class-update`, 60, 60_000))) fail(editPath, "throttled");

  const meta = await readClassMeta(formData, teacher, editPath);
  const extra = parseForm(CLASS_EXTRA_SCHEMA, formData);
  if (!extra.ok) fail(editPath, "invalid");

  const now = new Date();
  await transactionOrFail(editPath, async (tx) => {
    // The teacher's own columns; `teacherId` never appears here: a class does
    // not change teacher. When it is and how it is joined go through the writers.
    const current = await tx.class.update({
      where: { id: classId },
      data: {
        title: meta.title,
        description: meta.description,
        recordingUrl: extra.data.recordingUrl,
        summary: extra.data.summary,
      },
      select: { scheduledAt: true, durationMin: true },
    });

    // The reschedule is asked for only when the date or the duration changed:
    // the writer refuses a finished class before comparing, and the old form
    // is also how the teacher adds the summary and the recording afterwards.
    const rescheduled =
      current.scheduledAt.getTime() !== meta.scheduledAt.getTime() || current.durationMin !== meta.durationMin;
    if (rescheduled) {
      const schedule = await syncClassSchedule(
        tx,
        classId,
        { scheduledAt: meta.scheduledAt, durationMin: meta.durationMin, note: null },
        user.id,
        now,
      );
      if (!schedule.ok) throw new ClassWriteRefused(schedule.code === "classClosed" ? "status" : "schedule");
    }

    const meeting = await syncClassMeeting(tx, classId, {
      meetingUrl: meta.meetingUrl,
      visibleFromChosen: meta.meetingVisibleFromChosen,
    });
    if (!meeting.ok) throw new ClassWriteRefused("schedule");
  });

  revalidatePath(teacherRoutes.classes);
  revalidatePath(teacherRoutes.classDetail(classId));
  redirect(teacherRoutes.classDetail(classId));
}

export async function setClassStatus(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-status`, 60, 60_000))) fail(detailPath, "throttled");

  const status = parseForm(STATUS_SCHEMA, formData);
  if (!status.ok) fail(detailPath, "status");
  // The teacher only finalizes: cancelling is the staff's, and «En vivo» is a
  // phase of the hour, never a status anybody presses.
  if (status.data.statusCode !== CLASS_STATUS.COMPLETED) fail(detailPath, "status");

  const { written } = await transitionClassStatus(getPlatformDb(), {
    classId,
    to: CLASS_STATUS.COMPLETED,
    actor: { userId: user.id, role: "teacher" },
    now: new Date(),
  });
  if (!written) fail(detailPath, "status");

  revalidatePath(teacherRoutes.classes);
  revalidatePath(detailPath);
  revalidatePath(teacherRoutes.home);
}

export async function addParticipant(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-participant`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(STUDENT_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "student");
  const { studentId } = parsed.data;
  await assertTeacherHasStudent(teacher.id, studentId);

  let seat: Awaited<ReturnType<typeof syncClassSeat>>;
  try {
    seat = await getPlatformDb().$transaction((tx) =>
      syncClassSeat(tx, { classId, studentId, coverage: "unpaid", addedById: user.id, mode: "add" }),
    );
  } catch (error) {
    // The writer reports a student already there without writing, but two adds
    // that race past its check meet the primary key: the same answer.
    if (isUniqueConstraintError(error, "ClassParticipant_pkey", "classId")) fail(detailPath, "student");
    throw error;
  }
  if (!seat.ok) fail(detailPath, "student");

  revalidatePath(detailPath);
}

/**
 * Takes a student out of a class. The student comes bound, like the class, and
 * not in the form's data: the «Quitar» of each row is a button with an action
 * of its own, and React leaves such a button out of the data it sends. It is
 * read as any input would be — a string, or nothing — and the writer's `where`
 * is what authorises: only a participant of this teacher's class who left no
 * trace (no mark, seat not moved) can be removed.
 */
export async function removeParticipant(classId: string, studentId: unknown): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-participant`, 60, 60_000))) fail(detailPath, "throttled");

  const { removed } = await removeClassSeat(getPlatformDb(), {
    classId,
    studentId: typeof studentId === "string" ? studentId : "",
  });
  if (!removed) fail(detailPath, "participantLocked");

  revalidatePath(detailPath);
}

export async function markAttendance(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-attendance`, 60, 60_000))) fail(detailPath, "throttled");

  const db = getPlatformDb();
  const now = new Date();
  const classRow = await db.class.findUniqueOrThrow({
    where: { id: classId },
    select: {
      scheduledAt: true,
      endsAt: true,
      meetingUrl: true,
      meetingUrlVisibleFrom: true,
      status: { select: { code: true } },
      participants: { select: { userId: true, seatMovedAt: true } },
    },
  });

  const attendance = parseForm(ATTENDANCE_SCHEMA, formData);
  const attendedNow = new Set(attendance.ok ? attendance.data.attended : []);

  // The old screen has one list for both moments: passing it while the class
  // runs or right after (finalize) and correcting it once the class is done
  // (change). The writer checks the mode against the phase again.
  const phase = classPhase(
    {
      statusCode: classRow.status.code as ClassStatusCode,
      scheduledAt: classRow.scheduledAt,
      endsAt: classRow.endsAt,
      visibleFrom: meetingVisibleFrom(classRow.meetingUrl, classRow.scheduledAt, classRow.meetingUrlVisibleFrom),
      hasLink: classRow.meetingUrl !== null,
    },
    now,
  );
  const mode = canFinalizeClass(phase) ? "finalize" : "change";
  // One mark per seat that is still in the class: a moved seat is history.
  const marks = classRow.participants
    .filter((participant) => participant.seatMovedAt === null)
    .map((participant) => ({ studentId: participant.userId, attended: attendedNow.has(participant.userId) }));

  // The marks, their log and the students' activity land together or not at all.
  const result = await db.$transaction((tx) =>
    recordAttendance(tx, { classId, marks, actor: { userId: user.id, role: "teacher" }, mode, reason: null, now }),
  );
  if (!result.ok) fail(detailPath, result.code);

  revalidatePath(detailPath);
  revalidatePath(teacherRoutes.home);
}

interface BlockFields {
  gameId: string | null;
  lessonId: string | null;
  positionId: string | null;
  text: string | null;
  videoUrl: string | null;
  movePath: string | null;
  /** Game transcribed in the block; it is not a reference, it is content. */
  pgn: string | null;
}

/** Fields of the block in a `create`: the references that do not apply are omitted. */
function toCreateData(fields: BlockFields) {
  return {
    text: fields.text,
    videoUrl: fields.videoUrl,
    movePath: fields.movePath,
    pgn: fields.pgn,
    ...(fields.gameId ? { game: { connect: { id: fields.gameId } } } : {}),
    ...(fields.lessonId ? { lesson: { connect: { id: fields.lessonId } } } : {}),
    ...(fields.positionId ? { position: { connect: { id: fields.positionId } } } : {}),
  };
}

/**
 * Fields of the block in an `update`. Here the references that do not apply are
 * explicitly DISCONNECTED: when a block's kind changes the previous pointer has
 * to be left null or the `class_block_single_ref` CHECK would go off (and the
 * block would drag along data of the old kind).
 */
function toUpdateData(fields: BlockFields) {
  return {
    text: fields.text,
    videoUrl: fields.videoUrl,
    movePath: fields.movePath,
    pgn: fields.pgn,
    game: fields.gameId ? { connect: { id: fields.gameId } } : { disconnect: true },
    lesson: fields.lessonId ? { connect: { id: fields.lessonId } } : { disconnect: true },
    position: fields.positionId ? { connect: { id: fields.positionId } } : { disconnect: true },
  };
}

/**
 * Fields of the block according to its kind, with ALL those that do not apply
 * set to null. It is what the `class_block_single_ref` CHECK requires (at most
 * one reference) and it keeps a change of kind from leaving orphaned data of the
 * previous one.
 */
async function readBlockFields(
  kind: ClassBlockKindCode,
  common: BlockCommon,
  formData: FormData,
  teacher: TeacherContext["teacher"],
  teacherUserId: string,
  failPath: string,
): Promise<BlockFields> {
  const empty: BlockFields = {
    gameId: null,
    lessonId: null,
    positionId: null,
    text: null,
    videoUrl: null,
    movePath: null,
    pgn: null,
  };
  const movePath = common.movePath;
  const db = getPlatformDb();

  switch (kind) {
    case CLASS_BLOCK_KIND.TEXT: {
      const parsed = parseForm(BLOCK_TEXT_SCHEMA, formData);
      if (!parsed.ok) fail(failPath, "blockText");
      return { ...empty, text: parsed.data.text };
    }

    case CLASS_BLOCK_KIND.VIDEO: {
      const parsed = parseForm(BLOCK_VIDEO_SCHEMA, formData);
      if (!parsed.ok || parsed.data.videoUrl === null) fail(failPath, "blockVideo");
      return { ...empty, videoUrl: parsed.data.videoUrl };
    }

    case CLASS_BLOCK_KIND.GAME_REF: {
      // The game transcribed in the block is the main route and wins over the
      // referenced one, just as when rendering it. If it comes, a student's is not
      // even looked at: the teacher chose to transcribe.
      const parsed = parseForm(BLOCK_GAME_SCHEMA, formData);
      if (!parsed.ok) fail(failPath, parsed.field === "pgn" ? "blockPgnTooLong" : "blockRef");
      const pgn = parsed.data.pgn ?? "";
      if (pgn.length > 0) {
        // The board validates on the client for convenience; what decides is this.
        const tree = parsePgnTree(pgn);
        if (tree === null) fail(failPath, "blockPgn");
        if (tree.children.length === 0) fail(failPath, "blockPgnEmpty");
        return { ...empty, pgn, movePath };
      }

      const gameId = parsed.data.gameId ?? "";
      if (gameId.length === 0) fail(failPath, "blockRef");
      // The assignment is validated HERE, on insertion: an already created block stays
      // valid even if the student is reassigned afterwards (§8.3 of the plan).
      await assertTeacherCanReferenceGame({ id: teacher.id, userId: teacherUserId }, gameId);
      return { ...empty, gameId, movePath };
    }

    case CLASS_BLOCK_KIND.LESSON_REF: {
      const { lessonId } = readIds(formData, "lessonId");
      // Only lessons of PUBLISHED courses: the block offers the student a link to open
      // it, and in a draft that link leads nowhere.
      const lesson = await db.lesson.findFirst({
        where: { id: lessonId, chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } } },
        select: { id: true },
      });
      if (!lesson) fail(failPath, "blockRef");
      return { ...empty, lessonId: lesson.id, movePath };
    }

    case CLASS_BLOCK_KIND.POSITION_REF: {
      const { positionId } = readIds(formData, "positionId");
      const position = await db.position.findFirst({
        where: { id: positionId, userId: teacherUserId, ownerType: { code: OWNER_TYPE.TEACHER } },
        select: { id: true },
      });
      if (!position) fail(failPath, "blockRef");
      return { ...empty, positionId: position.id };
    }

    case CLASS_BLOCK_KIND.FILE:
      // Without an upload pipeline of its own yet: the block stores the link in the
      // caption and serves as a marker for the material.
      return empty;

    default:
      fail(failPath, "blockKind");
  }
}

interface BlockCommon {
  kind: ClassBlockKindCode;
  caption: string | null;
  movePath: string | null;
}

/** What every block carries whatever its kind: the kind itself, the caption and the position. */
function readBlockCommon(formData: FormData, failPath: string): BlockCommon {
  const parsed = parseForm(BLOCK_COMMON_SCHEMA, formData);
  if (!parsed.ok) fail(failPath, parsed.field === "kind" ? "blockKind" : "invalid");
  return { ...parsed.data, kind: parsed.data.kind as ClassBlockKindCode };
}

export async function addClassBlock(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-block`, 120, 60_000))) fail(detailPath, "throttled");

  const common = readBlockCommon(formData, detailPath);
  const fields = await readBlockFields(common.kind, common, formData, teacher, user.id, detailPath);

  const db = getPlatformDb();
  const count = await db.classBlock.count({ where: { classId } });

  await db.classBlock.create({
    data: {
      class: { connect: { id: classId } },
      order: nextOrder(count),
      kind: { connect: { code: common.kind } },
      // The old editor has no sections: every block is «para preparar», which is
      // what every block was before visibility existed.
      visibility: { connect: { code: CLASS_BLOCK_VISIBILITY.BEFORE } },
      caption: common.caption,
      ...toCreateData(fields),
    },
  });

  revalidatePath(detailPath);
  revalidatePath(`/classes/${classId}`);
}

export async function updateClassBlock(classId: string, blockId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-block`, 120, 60_000))) fail(detailPath, "throttled");

  const common = readBlockCommon(formData, detailPath);
  const fields = await readBlockFields(common.kind, common, formData, teacher, user.id, detailPath);

  // The block is looked up with classId in the where: a blockId from another class
  // does not match and the action ends without writing anything.
  const db = getPlatformDb();
  const block = await db.classBlock.findFirst({ where: { id: blockId, classId }, select: { id: true } });
  if (!block) fail(detailPath, "blockMissing");

  await db.classBlock.update({
    where: { id: block.id },
    data: {
      kind: { connect: { code: common.kind } },
      caption: common.caption,
      ...toUpdateData(fields),
    },
  });

  revalidatePath(detailPath);
  revalidatePath(`/classes/${classId}`);
}

export async function deleteClassBlock(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-block`, 120, 60_000))) fail(detailPath, "throttled");

  const { blockId } = readIds(formData, "blockId");
  const db = getPlatformDb();

  await db.$transaction(async (tx) => {
    const deleted = await tx.classBlock.deleteMany({ where: { id: blockId, classId } });
    if (deleted.count === 0) return;

    // Dense renumbering: the updates go in ascending order, with the gap ahead, so as
    // not to clash with @@unique([classId, order]).
    const remaining = await tx.classBlock.findMany({ where: { classId }, select: { id: true, order: true } });
    for (const update of planDenseRenumber(remaining)) {
      await tx.classBlock.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(detailPath);
  revalidatePath(`/classes/${classId}`);
}

export async function moveClassBlock(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-block-move`, 120, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(MOVE_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { blockId, direction } = parsed.data;

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const blocks = await tx.classBlock.findMany({ where: { classId }, select: { id: true, order: true } });
    // planSwap goes through a temporary out-of-range order: without that, the direct
    // swap would violate the unique index halfway.
    for (const update of planSwap(blocks, blockId, direction satisfies MoveDirection)) {
      await tx.classBlock.update({ where: { id: update.id }, data: { order: update.order } });
    }
  });

  revalidatePath(detailPath);
  revalidatePath(`/classes/${classId}`);
}

/**
 * PGN of a resource for the position picker of the block editor. It is a server
 * action and not a direct call to the service because whoever needs it is a
 * client component; it authorises exactly like creating the block (inside
 * `getPgnForReference`).
 */
export async function fetchReferencePgn(
  kind: typeof CLASS_BLOCK_KIND.GAME_REF | typeof CLASS_BLOCK_KIND.LESSON_REF,
  id: string,
): Promise<string | null> {
  return getPgnForReference(kind, id);
}
