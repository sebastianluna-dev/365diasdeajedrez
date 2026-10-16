import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT } from "@/lib/testing/module-reach";
import { describeWrite, scanWrites, writeScanFiles, type WriteMethod } from "@/lib/testing/write-scan";

// Who may write what of a class. The columns of a class, a seat, a mark and a
// payment each have ONE writer in services/shared/ (AGENTS.md: a derived
// column is written by a single shared function that runs inside the caller's
// transaction), and an action that wrote `endsAt` or `statusId` by hand would
// not be caught by the types: Prisma accepts any column from anywhere. So this
// reads every source of the app, the components, the libraries, the services
// and the scripts as TypeScript, finds each `…class.create({ data })`,
// `…classParticipant.updateMany({ data })` and the like (nested relation
// writes included), and fails on a column written outside the files the table
// below allows.
//
// What it reads is the source, not the database: a `data` the guard cannot
// read — a variable, a spread of a call — is refused outside the four writers,
// so an action cannot hide a column behind a name. Inside a writer a spread is
// what the rule asks for (`...classScheduleColumns(…)`).
//
// Not read: the tests (they drive the writers with fakes and may write
// anything), the generated Prisma client, and `prisma/` — the seed is the one
// documented exception: it rebuilds the demo data row by row, every column at
// once, and spreads the same pure functions (`classScheduleColumns`,
// `classMeetingColumns`) the writers spread, so an end never disagrees with a
// start there either.

const SCHEDULE = "services/shared/class-schedule.service.ts";
const STATUS = "services/shared/class-status.service.ts";
const ATTENDANCE = "services/shared/class-attendance.service.ts";
const SEATS = "services/shared/class-seats.service.ts";
const TEACHER_CLASSES = "services/teacher-classes/teacher-classes.actions.ts";
const STAFF_CLASSES = "services/staff-classes/staff-classes.actions.ts";
/** Phase 4 writes it; the path is allowed before the file exists. */
const STAFF_PAYMENTS = "services/staff-payments/staff-payments.actions.ts";

/** The four writers: the only files where a `data` the guard cannot read is accepted. */
const WRITERS = new Set([SCHEDULE, STATUS, ATTENDANCE, SEATS]);

type Model = "class" | "classParticipant" | "classPayment" | "classAttendanceChange";
type Method = WriteMethod;

const MODELS: readonly Model[] = ["class", "classParticipant", "classPayment", "classAttendanceChange"];

/**
 * The table of writers, by model and column: who may put the column in a
 * `data`. A relation is listed beside its foreign key (`status` with
 * `statusId`), since Prisma writes the same column through either. A column
 * that is not listed is anyone's (`id`, `joinedAt`, the `blocks` of a
 * class…). Phases 4–6 extend it here.
 */
const COLUMN_WRITERS: Record<Model, Record<string, string[]>> = {
  class: {
    // When a class is, how it is joined, its shape, who made it and its reschedule history.
    scheduledAt: [SCHEDULE],
    durationMin: [SCHEDULE],
    endsAt: [SCHEDULE],
    meetingUrl: [SCHEDULE],
    meetingProviderId: [SCHEDULE],
    meetingProvider: [SCHEDULE],
    meetingUrlVisibleFrom: [SCHEDULE],
    formatId: [SCHEDULE],
    format: [SCHEDULE],
    capacity: [SCHEDULE],
    previousScheduledAt: [SCHEDULE],
    rescheduledAt: [SCHEDULE],
    rescheduledById: [SCHEDULE],
    rescheduledBy: [SCHEDULE],
    rescheduleNote: [SCHEDULE],
    createdById: [SCHEDULE],
    createdBy: [SCHEDULE],
    // Its status after creation, and who closed or cancelled it and why.
    statusId: [STATUS],
    status: [STATUS],
    cancelledAt: [STATUS],
    cancelledById: [STATUS],
    cancelledBy: [STATUS],
    cancelReason: [STATUS],
    cancelNote: [STATUS],
    closedAt: [STATUS],
    closedById: [STATUS],
    closedBy: [STATUS],
    // When its attendance was first taken.
    attendanceTakenAt: [ATTENDANCE],
    // Its teacher: set at creation, and changed by the staff (`setClassTeacher`).
    teacherId: [SCHEDULE, STAFF_CLASSES],
    teacher: [SCHEDULE, STAFF_CLASSES],
    // What it is called and what it is about: the teacher and the staff edit them.
    title: [SCHEDULE, STAFF_CLASSES, TEACHER_CLASSES],
    description: [SCHEDULE, STAFF_CLASSES, TEACHER_CLASSES],
    // What the teacher writes after the class.
    summary: [TEACHER_CLASSES],
    recordingUrl: [TEACHER_CLASSES],
  },
  classParticipant: {
    // How a seat is covered, who added it, and the move of a no-show's seat.
    paymentId: [SEATS],
    payment: [SEATS],
    isFree: [SEATS],
    addedById: [SEATS],
    addedBy: [SEATS],
    seatMovedAt: [SEATS],
    seatMovedById: [SEATS],
    seatMovedBy: [SEATS],
    seatMovedToClassId: [SEATS],
    seatMovedToClass: [SEATS],
    seatMoveNote: [SEATS],
    // The mark.
    attended: [ATTENDANCE],
  },
  classPayment: {},
  classAttendanceChange: {},
};

/**
 * The table of row writers, by model and method: who may create or destroy a
 * row at all. An unlisted method is anyone's (a `class.update` is judged by
 * its columns); an empty list means nobody.
 */
const ROW_WRITERS: Record<Model, Partial<Record<Method, string[]>>> = {
  class: { create: [SCHEDULE] },
  classParticipant: {
    create: [SEATS],
    createMany: [SEATS],
    upsert: [SEATS],
    delete: [SEATS],
    deleteMany: [SEATS],
  },
  classPayment: {
    create: [STAFF_PAYMENTS],
    createMany: [STAFF_PAYMENTS],
    update: [STAFF_PAYMENTS],
    updateMany: [STAFF_PAYMENTS],
    upsert: [STAFF_PAYMENTS],
    delete: [STAFF_PAYMENTS],
    deleteMany: [STAFF_PAYMENTS],
  },
  // The log of marks is append-only (D5): only created, and only by attendance.
  classAttendanceChange: {
    create: [ATTENDANCE],
    createMany: [ATTENDANCE],
    update: [],
    updateMany: [],
    upsert: [],
    delete: [],
    deleteMany: [],
  },
};

/**
 * The derived columns and the pure function whose spread must sit beside them
 * in the same object literal: nobody writes an end or a platform by hand, not
 * even the writer.
 */
const DERIVED_BY: { columns: string[]; spread: string }[] = [
  { columns: ["endsAt"], spread: "classScheduleColumns(" },
  { columns: ["meetingUrl", "meetingProviderId", "meetingUrlVisibleFrom"], spread: "classMeetingColumns(" },
];

/** The relations of a watched model that lead to another watched model, in a nested write. */
const NESTED_MODEL: Record<Model, Record<string, Model>> = {
  class: { participants: "classParticipant", seatsMovedIn: "classParticipant" },
  classParticipant: { class: "class", payment: "classPayment", attendanceChanges: "classAttendanceChange" },
  classPayment: { seats: "classParticipant" },
  classAttendanceChange: { participant: "classParticipant" },
};

/** The tables a raw statement may not change outside the writers. */
const RAW_TABLES = /"(?:Class|ClassParticipant|ClassAttendanceChange|ClassPayment)"/;
const RAW_WRITES = /\b(?:UPDATE|INSERT|DELETE)\b/i;

const files = writeScanFiles();
const { writes, raw } = scanWrites(files, { models: MODELS, nested: NESTED_MODEL });

describe("the writers of a class", () => {
  it("are read: the walk finds the four writers and their writes", () => {
    const seen = new Set(writes.map((write) => write.file));
    for (const writer of WRITERS) expect(seen, `${writer} writes nothing?`).toContain(writer);
    expect(writes.length).toBeGreaterThanOrEqual(10);
  });

  it("create and destroy rows only where the table allows", () => {
    const offenders = writes.flatMap((write) => {
      const allowed = ROW_WRITERS[write.model][write.method];
      if (!allowed || allowed.includes(write.file)) return [];
      const who = allowed.length === 0 ? "nobody may" : `only ${allowed.join(", ")} may`;
      return [`${describeWrite(write)} — ${who}`];
    });
    expect(offenders).toEqual([]);
  });

  it("write each column only from its writer", () => {
    const offenders = writes.flatMap((write) =>
      write.data.flatMap((data) =>
        data.columns.flatMap((column) => {
          const allowed = COLUMN_WRITERS[write.model][column];
          if (!allowed || allowed.includes(write.file)) return [];
          return [`${data.at}: ${write.model}.${write.method} writes ${column} — only ${allowed.join(", ")} may`];
        }),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("write a `data` the guard can read, outside the four writers", () => {
    const offenders = writes.flatMap((write) => {
      if (WRITERS.has(write.file)) return [];
      const hidden = [
        ...write.unreadable.map((text) => `a data that is not a literal: ${text}`),
        ...write.data.flatMap((data) => data.opaqueSpreads.map((text) => `a spread the guard cannot open: ...${text}`)),
      ];
      return hidden.map((what) => `${describeWrite(write)} hides its columns behind ${what}`);
    });
    expect(offenders).toEqual([]);
  });

  it("spread the pure function beside every derived column", () => {
    const offenders = writes.flatMap((write) =>
      write.data.flatMap((data) =>
        DERIVED_BY.flatMap(({ columns, spread }) => {
          const written = columns.filter((column) => data.columns.includes(column));
          if (written.length === 0) return [];
          if (data.opaqueSpreads.some((text) => text.startsWith(spread))) return [];
          return [
            `${data.at}: ${write.model}.${write.method} names ${written.join(", ")} without spreading ${spread}…)`,
          ];
        }),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("change the class tables in raw SQL only from the four writers (a SELECT … FOR UPDATE is a lock, not a write)", () => {
    expect(raw.length).toBeGreaterThanOrEqual(3);
    const offenders = raw.flatMap((statement) => {
      if (WRITERS.has(statement.file)) return [];
      const text = statement.text.replace(/\bFOR\s+UPDATE\b/gi, "");
      if (!RAW_TABLES.test(text) || !RAW_WRITES.test(text)) return [];
      return [`${statement.at}: raw SQL changes a class table`];
    });
    expect(offenders).toEqual([]);
  });

  it("record the CLASS_ATTENDED activity only from the attendance writer", () => {
    const offenders = files
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((file) => file !== ATTENDANCE)
      .filter((file) => {
        const source = readFileSync(join(PROJECT_ROOT, file), "utf8");
        return /\bCLASS_ATTENDED\b/.test(source) && /\brecordUserActivity\b/.test(source);
      });
    expect(offenders).toEqual([]);
  });
});
