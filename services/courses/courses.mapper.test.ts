import { describe, expect, it } from "vitest";

import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import {
  mapChapterView,
  mapCourseProgress,
  mapLessonView,
  type CourseWithContent,
  type LessonRowForView,
  type UserCourseState,
} from "./courses.mapper";

// The "only essential lessons" filter lives entirely here: the action merely
// stores a row. That is why it is tested in the mapper, without a database.
//
// Test course: two chapters of three lessons. Priority ones are 1 and 4.

interface LessonSpec {
  id: string;
  order: number;
  priority?: boolean;
  minutes?: number;
}

function chapter(id: string, order: number, lessons: LessonSpec[]) {
  return {
    id,
    order,
    name: `Capítulo ${order}`,
    description: null,
    estimatedDuration: null,
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      chapterId: id,
      name: `Lección ${lesson.order}`,
      description: null,
      order: lesson.order,
      isPriority: lesson.priority ?? false,
      estimatedDuration: lesson.minutes ?? 10,
    })),
  };
}

const COURSE = {
  id: "curso-1",
  name: "Curso de prueba",
  description: null,
  cover: null,
  type: { label: "Estrategia" },
  courseLevels: [],
  courseAuthors: [],
  chapters: [
    chapter("cap-1", 1, [
      { id: "l1", order: 1, priority: true },
      { id: "l2", order: 2 },
      { id: "l3", order: 3 },
    ]),
    chapter("cap-2", 2, [
      { id: "l4", order: 1, priority: true },
      { id: "l5", order: 2 },
      { id: "l6", order: 3 },
    ]),
  ],
} as unknown as CourseWithContent;

function state(overrides: Partial<UserCourseState> = {}): UserCourseState {
  return { lessonStatus: new Map(), onlyPriorityLessons: false, ...overrides };
}

const completed = (...ids: string[]) =>
  new Map<string, ProgressStatusCode>(ids.map((id) => [id, PROGRESS_STATUS.COMPLETED]));

const lessonRow = (id: string, chapterId: string, order: number): LessonRowForView =>
  ({
    id,
    chapterId,
    name: `Lección ${order}`,
    description: null,
    order,
    isPriority: false,
    estimatedDuration: 10,
    pgn: "1. e4 *",
    game: null,
    orientation: { code: "WHITE" },
    exercises: [],
  }) as LessonRowForView;

describe("con el filtro apagado, todo como siempre", () => {
  it("cuenta las seis lecciones y sus minutos", () => {
    const progress = mapCourseProgress(COURSE, state({ lessonStatus: completed("l1", "l2") }));
    expect(progress.totalLessons).toBe(6);
    expect(progress.completedLessons).toBe(2);
    expect(progress.totalMinutes).toBe(60);
  });

  it("la lista del capítulo las trae todas", () => {
    const view = mapChapterView(COURSE, "cap-1", state(), { hasExercises: false, inTrainer: false });
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1", "l2", "l3"]);
    expect(view?.hiddenLessons).toBe(0);
  });
});

describe("con el filtro encendido", () => {
  const filtered = state({ onlyPriorityLessons: true });

  it("deja las prioritarias", () => {
    const view = mapChapterView(COURSE, "cap-1", filtered, { hasExercises: false, inTrainer: false });
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1"]);
    expect(view?.hiddenLessons).toBe(2);
  });

  it("y también las que el alumno ya tocó, aunque no sean prioritarias", () => {
    // It is half of the rule that avoids the filter's worst effect.
    const view = mapChapterView(COURSE, "cap-1", state({ onlyPriorityLessons: true, lessonStatus: completed("l3") }), {
      hasExercises: false,
      inTrainer: false,
    });
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1", "l3"]);
  });

  it("el número de orden que se enseña es el REAL, sin renumerar", () => {
    const view = mapChapterView(COURSE, "cap-2", state({ onlyPriorityLessons: true, lessonStatus: completed("l6") }), {
      hasExercises: false,
      inTrainer: false,
    });
    expect(view?.lessons.map((lesson) => lesson.order)).toEqual([1, 3]);
  });

  it("el porcentaje NUNCA retrocede al encenderlo", () => {
    // Two completed out of six (33 %). When filtering, the two priority ones plus
    // the two done remain: the done ones keep counting above and below.
    const status = completed("l2", "l3");
    const antes = mapCourseProgress(COURSE, state({ lessonStatus: status }));
    const despues = mapCourseProgress(COURSE, state({ onlyPriorityLessons: true, lessonStatus: status }));

    expect(antes.completedLessons).toBe(2);
    expect(despues.completedLessons).toBe(2);
    expect(despues.percent).toBeGreaterThanOrEqual(antes.percent);
  });

  it("los minutos se cuentan sobre las mismas lecciones que se enseñan", () => {
    const progress = mapCourseProgress(COURSE, state({ onlyPriorityLessons: true }));
    expect(progress.totalLessons).toBe(2);
    expect(progress.totalMinutes).toBe(20);
  });
});

describe("por dónde sigue el curso", () => {
  it("si donde se quedó queda escondido, va a la primera visible sin terminar", () => {
    const view = mapChapterView(COURSE, "cap-1", state({ onlyPriorityLessons: true, lastLessonId: "l2" }), {
      hasExercises: false,
      inTrainer: false,
    });
    expect(view?.continueHref).toContain("l1");
  });

  it("sin ninguna visible, a la ficha del curso y sin NaN", () => {
    const sinPrioritarias = {
      ...COURSE,
      chapters: [chapter("cap-3", 1, [{ id: "l7", order: 1 }])],
    } as unknown as CourseWithContent;

    const progress = mapCourseProgress(sinPrioritarias, state({ onlyPriorityLessons: true }));
    expect(progress.totalLessons).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.minutesPercent).toBe(0);

    const view = mapChapterView(sinPrioritarias, "cap-3", state({ onlyPriorityLessons: true }), {
      hasExercises: false,
      inTrainer: false,
    });
    expect(view?.lessons).toEqual([]);
    expect(view?.continueHref).toContain("curso-1");
  });
});

describe("anterior y siguiente desde una lección escondida", () => {
  // It is still served by URL — a link from a class cannot break over a display
  // preference — so it has to have neighbours.
  const filtered = state({ onlyPriorityLessons: true });

  it("apuntan a las visibles de alrededor, no a la nada", () => {
    const view = mapLessonView(COURSE, lessonRow("l3", "cap-1", 3), filtered);
    expect(view?.prevLessonHref).toContain("l1");
    expect(view?.nextLessonHref).toContain("l4");
  });

  it("la primera visible no tiene anterior", () => {
    const view = mapLessonView(COURSE, lessonRow("l1", "cap-1", 1), filtered);
    expect(view?.prevLessonHref).toBeUndefined();
    expect(view?.nextLessonHref).toContain("l4");
  });

  it("sin filtro, son las vecinas de verdad", () => {
    const view = mapLessonView(COURSE, lessonRow("l3", "cap-1", 3), state());
    expect(view?.prevLessonHref).toContain("l2");
    expect(view?.nextLessonHref).toContain("l4");
  });
});
