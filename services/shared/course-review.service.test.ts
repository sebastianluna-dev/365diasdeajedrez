import { describe, expect, it } from "vitest";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import {
  dueReviewExerciseWhere,
  reviewExerciseWhere,
  type LessonReviewSchedule,
  type ReviewScheduleReader,
} from "./course-review.service";

const NOW = new Date("2026-10-03T10:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const USER = "u-1";
const COURSE = "10000009";
const SCOPE = { userId: USER, courseId: COURSE };

// The lessons the student learned in the course, each at a different point of
// its review schedule. "never" has no row: it was never trained.
const LEARNED = ["never", "unscheduled", "overdue", "dueNow", "later"];
const SCHEDULE: LessonReviewSchedule[] = [
  { lessonId: "unscheduled", nextReviewAt: null },
  { lessonId: "overdue", nextReviewAt: new Date(NOW.getTime() - DAY_MS) },
  { lessonId: "dueNow", nextReviewAt: NOW },
  { lessonId: "later", nextReviewAt: new Date(NOW.getTime() + DAY_MS) },
];

/** A schedule reader that answers `rows` and records what it was asked for. */
function reader(rows: LessonReviewSchedule[]) {
  const asked: unknown[] = [];
  const db: ReviewScheduleReader = {
    userLessonTraining: {
      async findMany(args) {
        asked.push(args);
        return rows;
      },
    },
  };
  return { db, asked };
}

/**
 * Which of the learned lessons a `where` serves. What makes a lesson learned
 * (completed, in the course, published) is the database's to apply, and is
 * read whole in the last tests; what the schedule adds is the `lessonId` it
 * leaves out, which is what this reads.
 */
function served(where: Prisma.TrainingExerciseWhereInput): string[] {
  const { lesson, lessonId, ...rest } = where;
  expect(rest).toEqual({});
  expect(lesson).toEqual(reviewExerciseWhere(SCOPE).lesson);
  const left = typeof lessonId === "object" && lessonId?.notIn ? (lessonId.notIn as string[]) : [];
  return LEARNED.filter((id) => !left.includes(id));
}

describe("lo que «Repasar» sirve de un curso", () => {
  it("toca una lección aprendida que nunca se entrenó, tenga fila o no", async () => {
    const where = await dueReviewExerciseWhere(reader(SCHEDULE).db, SCOPE, NOW);
    expect(served(where)).toEqual(expect.arrayContaining(["never", "unscheduled"]));
  });

  it("toca la que tenía la fecha ya pasada, y la que la tiene justo ahora", async () => {
    const where = await dueReviewExerciseWhere(reader(SCHEDULE).db, SCOPE, NOW);
    expect(served(where)).toEqual(expect.arrayContaining(["overdue", "dueNow"]));
  });

  it("la que aún no toca se queda fuera", async () => {
    const where = await dueReviewExerciseWhere(reader(SCHEDULE).db, SCOPE, NOW);
    expect(served(where)).toEqual(["never", "unscheduled", "overdue", "dueNow"]);
  });

  it("decide el momento: con todo programado para mañana hoy no toca nada, y mañana toca todo", async () => {
    const tomorrow = new Date(NOW.getTime() + DAY_MS);
    const { db } = reader(LEARNED.map((lessonId) => ({ lessonId, nextReviewAt: tomorrow })));

    expect(served(await dueReviewExerciseWhere(db, SCOPE, NOW))).toEqual([]);
    expect(served(await dueReviewExerciseWhere(db, SCOPE, tomorrow))).toEqual(LEARNED);
  });

  it("sin nada programado para después, es lo aprendido entero", async () => {
    expect(await dueReviewExerciseWhere(reader([]).db, SCOPE, NOW)).toEqual(reviewExerciseWhere(SCOPE));
  });

  it("lee el calendario del alumno en ese curso y, sin curso, el de todos", async () => {
    const select = { lessonId: true, nextReviewAt: true };

    const one = reader([]);
    await dueReviewExerciseWhere(one.db, SCOPE, NOW);
    expect(one.asked).toEqual([{ where: { userId: USER, lesson: { chapter: { courseId: COURSE } } }, select }]);

    const every = reader([]);
    await dueReviewExerciseWhere(every.db, { userId: USER }, NOW);
    expect(every.asked).toEqual([{ where: { userId: USER }, select }]);
  });
});

describe("lo aprendido", () => {
  it("son los ejercicios de las lecciones que el alumno completó en el curso, publicado", () => {
    expect(reviewExerciseWhere(SCOPE)).toEqual({
      lesson: {
        chapter: { courseId: COURSE, course: { status: { code: COURSE_STATUS.PUBLISHED } } },
        progresses: { some: { userId: USER, status: { code: PROGRESS_STATUS.COMPLETED } } },
      },
    });
  });

  it("sin curso, los de todos los cursos publicados: lo que cuenta «Mis cursos»", () => {
    expect(reviewExerciseWhere({ userId: USER })).toEqual({
      lesson: {
        chapter: { course: { status: { code: COURSE_STATUS.PUBLISHED } } },
        progresses: { some: { userId: USER, status: { code: PROGRESS_STATUS.COMPLETED } } },
      },
    });
  });
});
