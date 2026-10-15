import { CLASS_FORMAT, type ClassFormatCode, type MeetingProviderCode } from "@/constants/platform/class-codes.const";
import { classEndsAt } from "./class-phase";
import { classShapeError } from "./class-rules";
import { classStatusIds, initialClassStatusData, type ClassStatusReader } from "./class-status.service";
import { storedMeetingProvider } from "./meeting-provider";
import { storedMeetingVisibleFrom } from "./meeting-visible-from";

// Creating a class, and the ONLY writers of when it is and how it is joined.
//
// `endsAt` and the three meeting columns are derived: the end from the start
// and the duration, the platform from the link, and the stored «visible from»
// from the link and the chosen instant. Each is computed by ONE pure function
// here (`classScheduleColumns`, `classMeetingColumns`) that the two writers of
// each — create and change — spread into their `data`, and that the seed
// spreads too, so no row ever carries an end that disagrees with its start
// (the database checks it as well: class_ends_at_derived).
//
// They receive the client as their first parameter so they run inside the
// caller's transaction, like every shared writer; no "server-only".

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
export interface ClassScheduleWriter extends ClassStatusReader {
  classFormat: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  meetingProvider: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  class: {
    create(args: unknown): Promise<{ id: string }>;
    findUnique(
      args: unknown,
    ): Promise<{ scheduledAt: Date; durationMin: number; statusId: number; meetingUrlVisibleFrom: Date | null } | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
}

/** The three columns that say when a class is; the end is never written any other way. */
export function classScheduleColumns(
  scheduledAt: Date,
  durationMin: number,
): { scheduledAt: Date; durationMin: number; endsAt: Date } {
  return { scheduledAt, durationMin, endsAt: classEndsAt(scheduledAt, durationMin) };
}

export interface ClassMeetingInput {
  meetingUrl: string | null;
  /** The instant the staff chose for the link to open, or null for the default. */
  visibleFromChosen: Date | null;
}

/**
 * The three columns of the meeting: the link, the platform read from it (an
 * inactive platform falls back to OTHER) and the stored «visible from».
 */
export function classMeetingColumns(
  input: ClassMeetingInput,
  providerIdByCode: ReadonlyMap<MeetingProviderCode, number>,
): { meetingUrl: string | null; meetingProviderId: number | null; meetingUrlVisibleFrom: Date | null } {
  const code = storedMeetingProvider(input.meetingUrl);
  const providerId = code === null ? null : (providerIdByCode.get(code) ?? providerIdByCode.get("OTHER") ?? null);
  return {
    meetingUrl: input.meetingUrl,
    meetingProviderId: providerId,
    meetingUrlVisibleFrom: storedMeetingVisibleFrom(input.meetingUrl, input.visibleFromChosen),
  };
}

/** The active meeting platforms, by code. */
export async function meetingProviderIds(
  db: Pick<ClassScheduleWriter, "meetingProvider">,
): Promise<ReadonlyMap<MeetingProviderCode, number>> {
  const rows = await db.meetingProvider.findMany({ where: { isActive: true }, select: { id: true, code: true } });
  return new Map(rows.map((row) => [row.code as MeetingProviderCode, row.id]));
}

/** A link that would open after the class starts is a mistake, not a choice. */
function opensLate(scheduledAt: Date, visibleFromChosen: Date | null): boolean {
  return visibleFromChosen !== null && visibleFromChosen.getTime() > scheduledAt.getTime();
}

export interface CreateClassRecordInput {
  id?: string;
  teacherId: string;
  formatCode: ClassFormatCode;
  capacity: number | null;
  title: string | null;
  description: string | null;
  scheduledAt: Date;
  durationMin: number;
  meetingUrl: string | null;
  meetingVisibleFromChosen: Date | null;
  createdById: string | null;
}

export type CreateClassRecordError = "capacity" | "groupTitle" | "meetingOpensLate";

/**
 * Creates the row of a class, SCHEDULED, with its shape checked
 * (`classShapeError`) and its derived columns computed here. Seats are added
 * afterwards with `syncClassSeat`.
 */
export async function createClassRecord(
  db: ClassScheduleWriter,
  input: CreateClassRecordInput,
): Promise<{ ok: true; id: string } | { ok: false; code: CreateClassRecordError }> {
  const capacity = input.formatCode === CLASS_FORMAT.INDIVIDUAL ? null : input.capacity;
  const shape = classShapeError({ format: input.formatCode, capacity, title: input.title });
  if (shape === "groupNeedsTitle") return { ok: false, code: "groupTitle" };
  if (shape !== null) return { ok: false, code: "capacity" };
  if (opensLate(input.scheduledAt, input.meetingVisibleFromChosen)) return { ok: false, code: "meetingOpensLate" };

  const [statusIds, formats, providers] = await Promise.all([
    classStatusIds(db),
    db.classFormat.findMany({ select: { id: true, code: true } }),
    meetingProviderIds(db),
  ]);
  const formatId = formats.find((row) => row.code === input.formatCode)?.id;
  if (formatId === undefined) throw new Error(`ClassFormat ${input.formatCode} is not seeded`);

  const title = input.title?.trim() ?? "";
  const created = await db.class.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      teacherId: input.teacherId,
      formatId,
      capacity,
      title: title.length > 0 ? title : null,
      description: input.description,
      ...classScheduleColumns(input.scheduledAt, input.durationMin),
      ...classMeetingColumns(
        { meetingUrl: input.meetingUrl, visibleFromChosen: input.meetingVisibleFromChosen },
        providers,
      ),
      ...initialClassStatusData(statusIds),
      createdById: input.createdById,
    },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

export interface SyncClassScheduleInput {
  scheduledAt: Date;
  durationMin: number;
  note: string | null;
}

/**
 * Gives a class another date or duration, keeping the last move as history
 * (`previousScheduledAt`, who and why). Only an open class moves: a finished
 * or cancelled one answers `classClosed`. A class that keeps its date and
 * duration is left alone (`written: false`), so a save that changed nothing
 * writes no reschedule.
 */
export async function syncClassSchedule(
  db: ClassScheduleWriter,
  classId: string,
  input: SyncClassScheduleInput,
  actorId: string,
  now: Date,
): Promise<{ ok: true; written: boolean } | { ok: false; code: "meetingOpensLate" | "classClosed" }> {
  const [ids, row] = await Promise.all([
    classStatusIds(db),
    db.class.findUnique({
      where: { id: classId },
      select: { scheduledAt: true, durationMin: true, statusId: true, meetingUrlVisibleFrom: true },
    }),
  ]);
  if (!row) return { ok: false, code: "classClosed" };
  const status = ids.codeOf.get(row.statusId);
  if (status === "COMPLETED" || status === "CANCELLED") return { ok: false, code: "classClosed" };
  if (opensLate(input.scheduledAt, row.meetingUrlVisibleFrom)) return { ok: false, code: "meetingOpensLate" };

  if (row.scheduledAt.getTime() === input.scheduledAt.getTime() && row.durationMin === input.durationMin) {
    return { ok: true, written: false };
  }
  const result = await db.class.updateMany({
    where: { id: classId },
    data: {
      ...classScheduleColumns(input.scheduledAt, input.durationMin),
      previousScheduledAt: row.scheduledAt,
      rescheduledAt: now,
      rescheduledById: actorId,
      rescheduleNote: input.note,
    },
  });
  return { ok: true, written: result.count > 0 };
}

/** Sets or clears a class's link, with the platform and the «visible from» that go with it. */
export async function syncClassMeeting(
  db: ClassScheduleWriter,
  classId: string,
  input: ClassMeetingInput,
): Promise<{ ok: true } | { ok: false; code: "meetingOpensLate" }> {
  const [row, providers] = await Promise.all([
    db.class.findUnique({
      where: { id: classId },
      select: { scheduledAt: true, durationMin: true, statusId: true, meetingUrlVisibleFrom: true },
    }),
    meetingProviderIds(db),
  ]);
  if (row && opensLate(row.scheduledAt, input.visibleFromChosen)) return { ok: false, code: "meetingOpensLate" };
  await db.class.updateMany({ where: { id: classId }, data: classMeetingColumns(input, providers) });
  return { ok: true };
}
