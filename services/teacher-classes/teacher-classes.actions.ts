"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import {
  CLASS_BLOCK_KIND,
  CLASS_STATUS,
  MEETING_PROVIDER,
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
import { teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { parseDateTimeLocal, safeTimeZone } from "@/lib/timezone";
import { readClampedInt, readOptionalText, readText, readUrl } from "@/services/shared/form-data";
import { getPgnForReference } from "./teacher-classes.service";
import { planDenseRenumber, planSwap, nextOrder, type MoveDirection } from "@/services/shared/reorder";
import { recordUserActivity } from "@/services/shared/user-activity.service";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { canTransitionClassStatus } from "./class-status-transitions";

// Writes of the teacher panel. Rules that are NOT negotiable:
// - Every action opens with requireTeacher(); those that receive a classId
//   continue with assertTeacherOwnsClass. They are reachable by direct POST, so
//   hiding a button protects nothing.
// - Catalogs are connected by `code`, never by id.
// - Errors come back by redirect with `?error=<code>` (message map in
//   constants/platform/teacher-messages.const.ts).

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 500;
const SUMMARY_MAX_LENGTH = 5000;
const CAPTION_MAX_LENGTH = 200;
const BLOCK_TEXT_MAX_LENGTH = 10_000;
const DURATION_MIN = 15;
const DURATION_MAX = 480;
/** The link opens half an hour early by default. */
const MEETING_VISIBLE_LEAD_MS = 30 * 60 * 1000;

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
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
  meetingProviderCode: string | null;
  meetingUrl: string | null;
  meetingUrlVisibleFrom: Date | null;
}

/** Reads and validates the metadata common to creating and editing a class. */
async function readClassMeta(formData: FormData, teacher: TeacherContext["teacher"], failPath: string): Promise<ClassMetaInput> {
  const title = readText(formData, "title");
  if (title.length === 0) fail(failPath, "title");

  const timeZone = await teacherTimeZone(teacher.id);
  // The input is `datetime-local`: the teacher's wall-clock time, which is
  // converted to UTC with THEIR zone (or UTC if they have none configured).
  const scheduledAt = parseDateTimeLocal(readText(formData, "scheduledAt"), timeZone);
  if (!scheduledAt) fail(failPath, "schedule");

  const durationMin = readClampedInt(formData, "durationMin", DURATION_MIN, DURATION_MAX);
  if (durationMin === null) fail(failPath, "duration");

  const providerCode = readText(formData, "meetingProviderCode");
  if (providerCode.length > 0 && !(Object.values(MEETING_PROVIDER) as string[]).includes(providerCode)) {
    fail(failPath, "meetingProvider");
  }

  const rawUrl = readText(formData, "meetingUrl");
  const meetingUrl = rawUrl.length > 0 ? readUrl(formData, "meetingUrl") : null;
  if (rawUrl.length > 0 && meetingUrl === null) fail(failPath, "meetingUrl");

  const visibleFromRaw = readText(formData, "meetingUrlVisibleFrom");
  const meetingUrlVisibleFrom =
    visibleFromRaw.length > 0
      ? parseDateTimeLocal(visibleFromRaw, timeZone)
      : new Date(scheduledAt.getTime() - MEETING_VISIBLE_LEAD_MS);
  if (visibleFromRaw.length > 0 && meetingUrlVisibleFrom === null) fail(failPath, "schedule");

  return {
    title: title.slice(0, TITLE_MAX_LENGTH),
    description: readOptionalText(formData, "description", DESCRIPTION_MAX_LENGTH),
    scheduledAt,
    durationMin,
    meetingProviderCode: providerCode.length > 0 ? providerCode : null,
    meetingUrl,
    meetingUrlVisibleFrom,
  };
}

export async function createClass(formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  if (!(await allowAction(`${user.id}:class-create`, 20, 3_600_000))) fail(teacherRoutes.newClass, "throttled");

  const meta = await readClassMeta(formData, teacher, teacherRoutes.newClass);

  // Initial participants: only students with an active assignment. Each is checked
  // one by one against the database, never by whatever comes ticked in the form.
  const studentIds = formData.getAll("studentIds").filter((value): value is string => typeof value === "string");
  for (const studentId of studentIds) await assertTeacherHasStudent(teacher.id, studentId);

  const created = await getPlatformDb().class.create({
    data: {
      teacher: { connect: { id: teacher.id } },
      title: meta.title,
      description: meta.description,
      scheduledAt: meta.scheduledAt,
      durationMin: meta.durationMin,
      status: { connect: { code: CLASS_STATUS.SCHEDULED } },
      ...(meta.meetingProviderCode ? { meetingProvider: { connect: { code: meta.meetingProviderCode } } } : {}),
      meetingUrl: meta.meetingUrl,
      meetingUrlVisibleFrom: meta.meetingUrlVisibleFrom,
      participants: { create: studentIds.map((userId) => ({ user: { connect: { id: userId } } })) },
    },
    select: { id: true },
  });

  revalidatePath(teacherRoutes.classes);
  revalidatePath(teacherRoutes.home);
  redirect(teacherRoutes.classDetail(created.id));
}

export async function updateClassMeta(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const editPath = teacherRoutes.classEdit(classId);
  if (!(await allowAction(`${user.id}:class-update`, 60, 60_000))) fail(editPath, "throttled");

  const meta = await readClassMeta(formData, teacher, editPath);

  await getPlatformDb().class.update({
    where: { id: classId },
    // `teacherId` never appears here: a class does not change teacher.
    data: {
      title: meta.title,
      description: meta.description,
      scheduledAt: meta.scheduledAt,
      durationMin: meta.durationMin,
      meetingProvider: meta.meetingProviderCode
        ? { connect: { code: meta.meetingProviderCode } }
        : { disconnect: true },
      meetingUrl: meta.meetingUrl,
      meetingUrlVisibleFrom: meta.meetingUrlVisibleFrom,
      recordingUrl: readUrl(formData, "recordingUrl"),
      summary: readOptionalText(formData, "summary", SUMMARY_MAX_LENGTH),
    },
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

  const target = readText(formData, "statusCode") as ClassStatusCode;
  const db = getPlatformDb();
  const current = await db.class.findUniqueOrThrow({
    where: { id: classId },
    select: { status: { select: { code: true } } },
  });

  if (!canTransitionClassStatus(current.status.code as ClassStatusCode, target)) fail(detailPath, "status");

  await db.class.update({ where: { id: classId }, data: { status: { connect: { code: target } } } });

  revalidatePath(teacherRoutes.classes);
  revalidatePath(detailPath);
  revalidatePath(teacherRoutes.home);
}

export async function addParticipant(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-participant`, 60, 60_000))) fail(detailPath, "throttled");

  const studentId = readText(formData, "studentId");
  if (studentId.length === 0) fail(detailPath, "student");
  await assertTeacherHasStudent(teacher.id, studentId);

  await getPlatformDb().classParticipant.upsert({
    where: { classId_userId: { classId, userId: studentId } },
    update: {},
    create: { classId, userId: studentId },
  });

  revalidatePath(detailPath);
}

export async function removeParticipant(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-participant`, 60, 60_000))) fail(detailPath, "throttled");

  const studentId = readText(formData, "studentId");
  const db = getPlatformDb();

  // Only whoever left no trace can be removed: if they attended or paid, the row
  // is history (and accounting), not an enrolment that can be undone.
  const removed = await db.classParticipant.deleteMany({
    where: { classId, userId: studentId, attended: false, paidAt: null },
  });
  if (removed.count === 0) fail(detailPath, "participantLocked");

  revalidatePath(detailPath);
}

export async function markAttendance(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-attendance`, 60, 60_000))) fail(detailPath, "throttled");

  const db = getPlatformDb();
  const classRow = await db.class.findUniqueOrThrow({
    where: { id: classId },
    select: { scheduledAt: true, participants: { select: { userId: true, attended: true, joinedAt: true } } },
  });

  const attendedNow = new Set(
    formData.getAll("attended").filter((value): value is string => typeof value === "string"),
  );

  const changed = classRow.participants.filter((participant) => attendedNow.has(participant.userId) !== participant.attended);
  if (changed.length === 0) {
    revalidatePath(detailPath);
    return;
  }

  await db.$transaction(
    changed.map((participant) => {
      const attended = attendedNow.has(participant.userId);
      return db.classParticipant.update({
        where: { classId_userId: { classId, userId: participant.userId } },
        data: {
          attended,
          // joinedAt is only stamped the first time: the real time is not lost if the
          // attendance is corrected afterwards.
          joinedAt: attended ? (participant.joinedAt ?? classRow.scheduledAt) : participant.joinedAt,
        },
      });
    }),
  );

  // The attendance counts as the STUDENT's activity: it feeds their statistics
  // through the only write point that exists for them.
  for (const participant of changed) {
    if (!attendedNow.has(participant.userId)) continue;
    await recordUserActivity({
      userId: participant.userId,
      typeCode: ACTIVITY_TYPE.CLASS_ATTENDED,
      subjectTypeCode: SUBJECT_TYPE.CLASS,
      subjectId: classId,
      occurredAt: classRow.scheduledAt,
    });
  }

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
  const movePath = readOptionalText(formData, "movePath", 200);
  const db = getPlatformDb();

  switch (kind) {
    case CLASS_BLOCK_KIND.TEXT: {
      const text = readOptionalText(formData, "text", BLOCK_TEXT_MAX_LENGTH);
      if (text === null) fail(failPath, "blockText");
      return { ...empty, text };
    }

    case CLASS_BLOCK_KIND.VIDEO: {
      const videoUrl = readUrl(formData, "videoUrl");
      if (videoUrl === null) fail(failPath, "blockVideo");
      return { ...empty, videoUrl };
    }

    case CLASS_BLOCK_KIND.GAME_REF: {
      // The game transcribed in the block is the main route and wins over the
      // referenced one, just as when rendering it. If it comes, a student's is not
      // even looked at: the teacher chose to transcribe.
      const pgn = readText(formData, "pgn");
      if (pgn.length > 0) {
        if (pgn.length > PGN_MAX_LENGTH) fail(failPath, "blockPgnTooLong");
        // The board validates on the client for convenience; what decides is this.
        const tree = parsePgnTree(pgn);
        if (tree === null) fail(failPath, "blockPgn");
        if (tree.children.length === 0) fail(failPath, "blockPgnEmpty");
        return { ...empty, pgn, movePath };
      }

      const gameId = readText(formData, "gameId");
      if (gameId.length === 0) fail(failPath, "blockRef");
      // The assignment is validated HERE, on insertion: an already created block stays
      // valid even if the student is reassigned afterwards (§8.3 of the plan).
      await assertTeacherCanReferenceGame({ id: teacher.id, userId: teacherUserId }, gameId);
      return { ...empty, gameId, movePath };
    }

    case CLASS_BLOCK_KIND.LESSON_REF: {
      const lessonId = readText(formData, "lessonId");
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
      const positionId = readText(formData, "positionId");
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

function readBlockKind(formData: FormData, failPath: string): ClassBlockKindCode {
  const kind = readText(formData, "kind");
  if (!(Object.values(CLASS_BLOCK_KIND) as string[]).includes(kind)) fail(failPath, "blockKind");
  return kind as ClassBlockKindCode;
}

export async function addClassBlock(classId: string, formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();
  await assertTeacherOwnsClass(teacher.id, classId);

  const detailPath = teacherRoutes.classDetail(classId);
  if (!(await allowAction(`${user.id}:class-block`, 120, 60_000))) fail(detailPath, "throttled");

  const kind = readBlockKind(formData, detailPath);
  const fields = await readBlockFields(kind, formData, teacher, user.id, detailPath);

  const db = getPlatformDb();
  const count = await db.classBlock.count({ where: { classId } });

  await db.classBlock.create({
    data: {
      class: { connect: { id: classId } },
      order: nextOrder(count),
      kind: { connect: { code: kind } },
      caption: readOptionalText(formData, "caption", CAPTION_MAX_LENGTH),
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

  const kind = readBlockKind(formData, detailPath);
  const fields = await readBlockFields(kind, formData, teacher, user.id, detailPath);

  // The block is looked up with classId in the where: a blockId from another class
  // does not match and the action ends without writing anything.
  const db = getPlatformDb();
  const block = await db.classBlock.findFirst({ where: { id: blockId, classId }, select: { id: true } });
  if (!block) fail(detailPath, "blockMissing");

  await db.classBlock.update({
    where: { id: block.id },
    data: {
      kind: { connect: { code: kind } },
      caption: readOptionalText(formData, "caption", CAPTION_MAX_LENGTH),
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

  const blockId = readText(formData, "blockId");
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

  const blockId = readText(formData, "blockId");
  const direction = readText(formData, "direction");
  if (direction !== "up" && direction !== "down") fail(detailPath, "invalid");

  const db = getPlatformDb();
  await db.$transaction(async (tx) => {
    const blocks = await tx.classBlock.findMany({ where: { classId }, select: { id: true, order: true } });
    // planSwap goes through a temporary out-of-range order: without that, the direct
    // swap would violate the unique index halfway.
    for (const update of planSwap(blocks, blockId, direction as MoveDirection)) {
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
