import { describe, expect, it } from "vitest";

import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import {
  mapChapterView,
  mapCourseDetail,
  mapCourseLevel,
  mapCourseProgress,
  mapCourseSources,
  mapCourseSummary,
  mapLessonView,
  type CourseWithDetail,
  type LessonRowForView,
  type UserCourseState,
} from "./courses.mapper";

// The "only priority" filter lives entirely here: the action merely
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
    isPriority: false,
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
  id: "10000009",
  slug: "curso-de-prueba",
  name: "Curso de prueba",
  description: null,
  cover: null,
  courseContentTypes: [],
  courseLevels: [],
  courseAuthors: [],
  sources: [],
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
} as unknown as CourseWithDetail;

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
    const view = mapChapterView(COURSE, "cap-1", state());
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1", "l2", "l3"]);
    expect(view?.hiddenLessons).toBe(0);
  });
});

describe("con el filtro encendido", () => {
  const filtered = state({ onlyPriorityLessons: true });

  it("deja las prioritarias", () => {
    const view = mapChapterView(COURSE, "cap-1", filtered);
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1"]);
    expect(view?.hiddenLessons).toBe(2);
  });

  it("y también las que el alumno ya tocó, aunque no sean prioritarias", () => {
    // It is half of the rule that avoids the filter's worst effect.
    const view = mapChapterView(COURSE, "cap-1", state({ onlyPriorityLessons: true, lessonStatus: completed("l3") }));
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1", "l3"]);
  });

  it("el número de orden que se enseña es el REAL, sin renumerar", () => {
    const view = mapChapterView(COURSE, "cap-2", state({ onlyPriorityLessons: true, lessonStatus: completed("l6") }));
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

describe("un capítulo de prioridad", () => {
  // The second chapter is priority whole; of the first, only its lesson 1.
  const WITH_PRIORITY_CHAPTER = {
    ...COURSE,
    chapters: [
      chapter("cap-1", 1, [
        { id: "l1", order: 1, priority: true },
        { id: "l2", order: 2 },
      ]),
      {
        ...chapter("cap-2", 2, [
          { id: "l3", order: 1 },
          { id: "l4", order: 2 },
        ]),
        isPriority: true,
      },
    ],
  } as unknown as CourseWithDetail;
  const filtered = state({ onlyPriorityLessons: true });

  it("lo dice en su tarjeta y en su página, y los demás no", () => {
    const [first, second] = mapCourseDetail(WITH_PRIORITY_CHAPTER, state()).chapters;
    expect(first?.isPriority).toBe(false);
    expect(second?.isPriority).toBe(true);
    expect(mapChapterView(WITH_PRIORITY_CHAPTER, "cap-2", state())?.isPriority).toBe(true);
  });

  it("con el filtro encendido entra entero, aunque ninguna de sus lecciones esté marcada", () => {
    const view = mapChapterView(WITH_PRIORITY_CHAPTER, "cap-2", filtered);
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l3", "l4"]);
    expect(view?.hiddenLessons).toBe(0);
    // The lesson's own tag is still the lesson's own mark.
    expect(view?.lessons.map((lesson) => lesson.isPriority)).toEqual([false, false]);
  });

  it("y sus lecciones cuentan en el progreso del curso", () => {
    const progress = mapCourseProgress(WITH_PRIORITY_CHAPTER, filtered);
    expect(progress.totalLessons).toBe(3);
    expect(mapCourseDetail(WITH_PRIORITY_CHAPTER, filtered).hiddenLessons).toBe(1);
  });

  it("la siguiente por aprender pasa por ellas", () => {
    const detail = mapCourseDetail(
      WITH_PRIORITY_CHAPTER,
      state({ onlyPriorityLessons: true, lessonStatus: completed("l1") }),
    );
    expect(detail.learnHref).toContain("l3");
  });
});

describe("un curso completo", () => {
  it("es el que tiene aprendidas todas las lecciones que se ven", () => {
    const all = completed("l1", "l2", "l3", "l4", "l5", "l6");
    expect(mapCourseSummary(COURSE, state({ lessonStatus: all })).isCompleted).toBe(true);
    expect(mapCourseDetail(COURSE, state({ lessonStatus: completed("l1") })).isCompleted).toBe(false);
  });

  it("con el filtro encendido, el que tiene aprendidas las de prioridad", () => {
    const summary = mapCourseSummary(COURSE, state({ onlyPriorityLessons: true, lessonStatus: completed("l1", "l4") }));
    expect(summary.isCompleted).toBe(true);
  });

  it("uno sin lecciones no lo está", () => {
    const empty = { ...COURSE, chapters: [] } as unknown as CourseWithDetail;
    expect(mapCourseDetail(empty, state()).isCompleted).toBe(false);
  });
});

describe("por dónde sigue el curso", () => {
  it("si donde se quedó queda escondido, va a la primera visible sin terminar", () => {
    const view = mapChapterView(COURSE, "cap-1", state({ onlyPriorityLessons: true, lastLessonId: "l2" }));
    expect(view?.course.learnHref).toContain("l1");
    expect(view?.lessons.find((lesson) => lesson.isNext)?.id).toBe("l1");
  });

  it("sin ninguna visible, a la ficha del curso y sin NaN", () => {
    const sinPrioritarias = {
      ...COURSE,
      chapters: [chapter("cap-3", 1, [{ id: "l7", order: 1 }])],
    } as unknown as CourseWithDetail;

    const progress = mapCourseProgress(sinPrioritarias, state({ onlyPriorityLessons: true }));
    expect(progress.totalLessons).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.minutesPercent).toBe(0);

    const view = mapChapterView(sinPrioritarias, "cap-3", state({ onlyPriorityLessons: true }));
    expect(view?.lessons).toEqual([]);
    // Nothing in view, nothing to learn: the button is not drawn.
    expect(view?.course.learnHref).toBeUndefined();
    expect(view?.isCompleted).toBe(false);
  });
});

describe("la siguiente lección por aprender", () => {
  it("es la primera sin terminar, en el orden en que se lee el curso", () => {
    const detail = mapCourseDetail(COURSE, state({ lessonStatus: completed("l1", "l2") }));
    expect(detail.learnHref).toContain("l3");
  });

  it("es donde se quedó, si la dejó a medias", () => {
    const status = new Map<string, ProgressStatusCode>([
      ["l1", PROGRESS_STATUS.COMPLETED],
      ["l5", PROGRESS_STATUS.IN_PROGRESS],
    ]);
    const detail = mapCourseDetail(COURSE, state({ lessonStatus: status, lastLessonId: "l5" }));
    expect(detail.learnHref).toContain("l5");
  });

  it("NO es donde se quedó si ya la terminó: «Aprender» promete algo nuevo", () => {
    const detail = mapCourseDetail(COURSE, state({ lessonStatus: completed("l1", "l2"), lastLessonId: "l2" }));
    expect(detail.learnHref).toContain("l3");
  });

  it("no hay ninguna cuando todas están aprendidas", () => {
    const all = completed("l1", "l2", "l3", "l4", "l5", "l6");
    const detail = mapCourseDetail(COURSE, state({ lessonStatus: all }));
    expect(detail.learnHref).toBeUndefined();
    expect(detail.ctaLabel).toBe("Repasar");
  });

  it("es una sola en todo el curso, y la lista del capítulo la marca", () => {
    const status = state({ lessonStatus: completed("l1", "l2", "l3") });
    const first = mapChapterView(COURSE, "cap-1", status);
    const second = mapChapterView(COURSE, "cap-2", status);

    expect(first?.lessons.filter((lesson) => lesson.isNext)).toEqual([]);
    expect(second?.lessons.filter((lesson) => lesson.isNext).map((lesson) => lesson.id)).toEqual(["l4"]);
  });
});

describe("un curso agregado", () => {
  it("es el que tiene fila de progreso, aunque no haya empezado", () => {
    expect(mapCourseSummary(COURSE, state()).isAdded).toBe(false);
    expect(mapCourseSummary(COURSE, state({ courseStatus: PROGRESS_STATUS.NOT_STARTED })).isAdded).toBe(true);
    expect(mapCourseDetail(COURSE, state({ courseStatus: PROGRESS_STATUS.IN_PROGRESS })).isAdded).toBe(true);
  });

  it("dice «Empezar» recién agregado, «Continuar» con algo hecho y «Repasar» terminado", () => {
    const added = { courseStatus: PROGRESS_STATUS.NOT_STARTED };
    expect(mapCourseSummary(COURSE, state(added)).ctaLabel).toBe("Empezar");
    expect(mapCourseSummary(COURSE, state({ ...added, lessonStatus: completed("l1") })).ctaLabel).toBe("Continuar");
    expect(
      mapCourseSummary(COURSE, state({ ...added, lessonStatus: completed("l1", "l2", "l3", "l4", "l5", "l6") }))
        .ctaLabel,
    ).toBe("Repasar");
  });

  it("se estudia por su id y se lee por su slug", () => {
    const summary = mapCourseSummary(COURSE, state());
    expect(summary.href).toBe("/cursos/10000009");
    expect(summary.infoHref).toBe("/cursos/curso-de-prueba");
  });
});

describe("los capítulos del curso", () => {
  const WITH_NAMES = {
    ...COURSE,
    chapters: [
      {
        ...chapter("cap-1", 1, [
          { id: "l1", order: 1, priority: true, minutes: 20 },
          { id: "l2", order: 2, minutes: 20 },
        ]),
        name: "Los años de aprendizaje (1957–1959)",
      },
      { ...chapter("cap-2", 2, [{ id: "l3", order: 1, minutes: 15 }]), name: "El final", estimatedDuration: 90 },
    ],
  } as unknown as CourseWithDetail;

  it("llevan su nombre entero, con los años que lo cierran", () => {
    const [first, second] = mapCourseDetail(WITH_NAMES, state()).chapters;
    expect(first?.name).toBe("Los años de aprendizaje (1957–1959)");
    expect(second?.name).toBe("El final");
  });

  it("duran lo que dice su cifra y, sin ella, lo que suman sus lecciones", () => {
    const [first, second] = mapCourseDetail(WITH_NAMES, state()).chapters;
    expect(first?.durationMin).toBe(40);
    expect(second?.durationMin).toBe(90);
  });

  it("cuentan TODAS sus lecciones para la ficha, y las que se ven para su progreso", () => {
    const [first] = mapCourseDetail(WITH_NAMES, state({ onlyPriorityLessons: true })).chapters;
    expect(first).toMatchObject({ lessonCount: 2, totalLessons: 1 });
  });

  it("están completos cuando todas las lecciones que se ven están aprendidas", () => {
    const [first, second] = mapCourseDetail(WITH_NAMES, state({ lessonStatus: completed("l1", "l3") })).chapters;
    expect(first).toMatchObject({ completedLessons: 1, totalLessons: 2, isCompleted: false });
    expect(second).toMatchObject({ completedLessons: 1, totalLessons: 1, isCompleted: true });
  });

  it("uno sin lecciones a la vista no está completo: no hay nada aprendido", () => {
    const [, second] = mapCourseDetail(WITH_NAMES, state({ onlyPriorityLessons: true })).chapters;
    expect(second).toMatchObject({ totalLessons: 0, isCompleted: false });
  });

  it("el curso suma todas sus lecciones y minutos, diga lo que diga el filtro", () => {
    const detail = mapCourseDetail(WITH_NAMES, state({ onlyPriorityLessons: true }));
    expect(detail).toMatchObject({ lessonCount: 3, totalMinutes: 55, hiddenLessons: 2 });
  });

  it("el capítulo sabe cuál va antes y cuál después", () => {
    expect(mapChapterView(WITH_NAMES, "cap-1", state())).toMatchObject({
      previous: undefined,
      next: { name: "El final", href: "/cursos/10000009/2" },
    });
    expect(mapChapterView(WITH_NAMES, "cap-2", state())).toMatchObject({
      previous: { name: "Los años de aprendizaje (1957–1959)", href: "/cursos/10000009/1" },
      next: undefined,
    });
  });

  it("cada lección trae cómo se abre, y la que no tiene jugadas no trae nada", () => {
    const previews = new Map([["l1", "1.e4 c5 2.Cf3 …"]]);
    const view = mapChapterView(WITH_NAMES, "cap-1", state(), { previews, reviewCount: 3 });

    expect(view?.lessons.map((lesson) => lesson.preview)).toEqual(["1.e4 c5 2.Cf3 …", undefined]);
    expect(view?.course.reviewCount).toBe(3);
    expect(view?.course.reviewHref).toBe("/entrenador?course=10000009");
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

describe("mapCourseSources", () => {
  it("cita cada fuente con su tipo, sin nulos y sin las notas del staff", () => {
    const sources = mapCourseSources([
      {
        id: "s1",
        originalTitle: "Piense como un gran maestro",
        authors: "Alexander Kotov",
        url: null,
        publicationYear: 1971,
        edition: "2.ª ed.",
        specificReference: null,
        sourceType: { label: "Libro" },
      },
      {
        id: "s2",
        originalTitle: null,
        authors: null,
        url: null,
        publicationYear: null,
        edition: null,
        specificReference: null,
        sourceType: { label: "Material de elaboración propia" },
      },
    ]);

    expect(sources).toEqual([
      {
        id: "s1",
        typeLabel: "Libro",
        originalTitle: "Piense como un gran maestro",
        authors: "Alexander Kotov",
        url: undefined,
        publicationYear: 1971,
        edition: "2.ª ed.",
        specificReference: undefined,
      },
      {
        id: "s2",
        typeLabel: "Material de elaboración propia",
        originalTitle: undefined,
        authors: undefined,
        url: undefined,
        publicationYear: undefined,
        edition: undefined,
        specificReference: undefined,
      },
    ]);
    expect(sources[0]).not.toHaveProperty("notes");
  });
});

describe("los niveles del curso", () => {
  const level = (slug: string, name: string, eloMin: number, eloMax: number | null) => ({
    level: { id: 1, slug, name, description: `Qué se trabaja en ${name}.`, order: 1, eloMin, eloMax, isActive: true },
  });
  const WITH_LEVELS = {
    ...COURSE,
    courseLevels: [level("iniciacion", "Iniciación", 0, 799), level("maestro", "Maestro", 2200, null)],
    sources: [],
  } as unknown as CourseWithDetail;

  it("redacta el rango de cada nivel, con el máximo abierto como «o más»", () => {
    expect(mapCourseLevel(level("experto", "Experto", 2000, 2199).level)).toEqual({
      slug: "experto",
      name: "Experto",
      description: "Qué se trabaja en Experto.",
      eloRange: "2000–2199",
      eloMin: 2000,
      eloMax: 2199,
    });
    expect(mapCourseLevel(level("maestro", "Maestro", 2200, null).level).eloRange).toBe("2200 o más");
  });

  it("la tarjeta y la ficha llevan los niveles en el orden en que llegan", () => {
    const summary = mapCourseSummary(WITH_LEVELS, state());
    const detail = mapCourseDetail(WITH_LEVELS, state());

    expect(summary.levels.map((item) => item.slug)).toEqual(["iniciacion", "maestro"]);
    expect(detail.levels.map((item) => `${item.name}: ${item.eloRange}`)).toEqual([
      "Iniciación: Menos de 800",
      "Maestro: 2200 o más",
    ]);
  });

  it("un curso sin niveles no tiene ninguno, y sigue siendo un curso", () => {
    const bare = { ...COURSE, sources: [] } as unknown as CourseWithDetail;
    expect(mapCourseDetail(bare, state()).levels).toEqual([]);
  });
});
