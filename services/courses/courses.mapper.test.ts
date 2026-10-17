import { describe, expect, it } from "vitest";

import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import {
  mapChapterView,
  mapCourseDetail,
  mapCourseLevel,
  mapCourseOutline,
  mapCourseProgress,
  mapCourseSources,
  mapCourseSummary,
  mapLessonView,
  mapMyCourse,
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
  const rows = lessons.map((lesson) => ({
    id: lesson.id,
    chapterId: id,
    name: `Lección ${lesson.order}`,
    description: null,
    order: lesson.order,
    isPriority: lesson.priority ?? false,
    estimatedDuration: lesson.minutes ?? 10,
  }));

  return {
    id,
    order,
    name: `Capítulo ${order}`,
    description: null,
    isPriority: false,
    // The chapter's cached duration is what its lessons add up, which is what
    // `syncChapterDuration` writes. A test that wants a figure out of line with
    // them overrides it.
    estimatedDuration: rows.reduce((total, lesson) => total + (lesson.estimatedDuration ?? 0), 0) || null,
    lessons: rows,
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
    trainingExercises: [],
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

  it("y nada más: una lección empezada o terminada que no es de prioridad no se ve", () => {
    // Until 2026-10-07 the touched ones passed too; a list of priority lessons
    // with others among them, untagged, read as a mistake.
    const view = mapChapterView(COURSE, "cap-1", state({ onlyPriorityLessons: true, lessonStatus: completed("l3") }));
    expect(view?.lessons.map((lesson) => lesson.id)).toEqual(["l1"]);
    expect(view?.hiddenLessons).toBe(2);
  });

  it("el número de orden de cada lección es el REAL, sin renumerar", () => {
    const course = {
      ...COURSE,
      chapters: [
        chapter("cap-3", 1, [
          { id: "x1", order: 1 },
          { id: "x2", order: 2, priority: true },
          { id: "x3", order: 3, priority: true },
        ]),
      ],
    } as unknown as CourseWithDetail;
    const view = mapChapterView(course, "cap-3", state({ onlyPriorityLessons: true }));
    expect(view?.lessons.map((lesson) => lesson.order)).toEqual([2, 3]);
  });

  it("el progreso cuenta sólo las de prioridad mientras está encendido", () => {
    // Two non-priority lessons done out of six (33 %). With the filter on the
    // path is the two priority ones, none of them done: the figure drops to 0,
    // and comes back when the filter goes off. That is the price of showing
    // nothing but priority lessons (2026-10-07).
    const status = completed("l2", "l3");
    const antes = mapCourseProgress(COURSE, state({ lessonStatus: status }));
    const despues = mapCourseProgress(COURSE, state({ onlyPriorityLessons: true, lessonStatus: status }));

    expect(antes.completedLessons).toBe(2);
    expect(despues.completedLessons).toBe(0);
    expect(despues.totalLessons).toBe(2);
    expect(despues.percent).toBe(0);

    const conUnaDePrioridad = mapCourseProgress(
      COURSE,
      state({ onlyPriorityLessons: true, lessonStatus: completed("l1", "l2") }),
    );
    expect(conUnaDePrioridad.completedLessons).toBe(1);
    expect(conUnaDePrioridad.percent).toBe(50);
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

  it("lo dice en su tarjeta, y los demás no", () => {
    const [first, second] = mapCourseDetail(WITH_PRIORITY_CHAPTER, state()).chapters;
    expect(first?.isPriority).toBe(false);
    expect(second?.isPriority).toBe(true);
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
    expect(view?.hiddenLessons).toBe(1);
    // Nothing in view, nothing to learn: the button is not drawn.
    expect(view?.course.learnHref).toBeUndefined();
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

  it("con todas aprendidas «Aprender» no se apaga: vuelve a empezar el curso", () => {
    const all = completed("l1", "l2", "l3", "l4", "l5", "l6");
    const detail = mapCourseDetail(COURSE, state({ lessonStatus: all, lastLessonId: "l6" }));
    expect(detail.learnHref).toContain("l1");
    expect(detail.ctaLabel).toBe("Repasar");
  });

  it("y ninguna lección se marca como la siguiente en un curso terminado", () => {
    const all = completed("l1", "l2", "l3", "l4", "l5", "l6");
    const view = mapChapterView(COURSE, "cap-1", state({ lessonStatus: all }));
    expect(view?.lessons.filter((lesson) => lesson.isNext)).toEqual([]);
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

describe("un curso de «Mis cursos»", () => {
  const added = { courseStatus: PROGRESS_STATUS.IN_PROGRESS };

  it("trae su resumen, la siguiente lección por aprender y lo que hay por repasar", () => {
    const course = mapMyCourse(COURSE, state({ ...added, lessonStatus: completed("l1") }), { reviewCount: 4 });
    expect(course).toMatchObject({
      isAdded: true,
      ctaLabel: "Continuar",
      reviewCount: 4,
      isReviewUpToDate: false,
      reviewHref: "/entrenador?course=10000009",
    });
    expect(course.learnHref).toContain("l2");
  });

  it("sin nada aprendido no hay nada que repasar, y tampoco está al día", () => {
    expect(mapMyCourse(COURSE, state(added))).toMatchObject({ reviewCount: 0, isReviewUpToDate: false });
  });

  it("con lo aprendido repasado y nada que toque hoy, está al día", () => {
    const review = { reviewCount: 0, isReviewUpToDate: true };
    const learned = state({ ...added, lessonStatus: completed("l1") });
    expect(mapMyCourse(COURSE, learned, review)).toMatchObject(review);
    expect(mapCourseDetail(COURSE, learned, review)).toMatchObject(review);
  });

  it("con todo aprendido «Aprender» sigue llevando a algún sitio: a la primera lección", () => {
    const all = completed("l1", "l2", "l3", "l4", "l5", "l6");
    const course = mapMyCourse(COURSE, state({ ...added, lessonStatus: all }));
    expect(course.learnHref).toContain("l1");
    expect(course.isCompleted).toBe(true);
  });

  it("sin lecciones a la vista no lleva a ninguno", () => {
    const empty = { ...COURSE, chapters: [] } as unknown as CourseWithDetail;
    expect(mapMyCourse(empty, state(added)).learnHref).toBeUndefined();
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
      // A figure out of line with its lessons on purpose: what is read is the
      // column, and this is what proves nobody sums the lessons behind it.
      { ...chapter("cap-2", 2, [{ id: "l3", order: 1, minutes: 15 }]), name: "El final", estimatedDuration: 90 },
    ],
  } as unknown as CourseWithDetail;

  it("llevan su nombre entero, con los años que lo cierran", () => {
    const [first, second] = mapCourseDetail(WITH_NAMES, state()).chapters;
    expect(first?.name).toBe("Los años de aprendizaje (1957–1959)");
    expect(second?.name).toBe("El final");
  });

  it("duran lo que dice su cifra, que es la suma de sus lecciones ya hecha", () => {
    const [first] = mapCourseDetail(WITH_NAMES, state()).chapters;
    expect(first?.durationMin).toBe(40);
  });

  it("una cifra que no cuadra con sus lecciones se respeta: la lectura no las suma", () => {
    const [, second] = mapCourseDetail(WITH_NAMES, state()).chapters;
    expect(second?.durationMin).toBe(90);
  });

  it("sin cifra no duran nada, en vez de un cero que se lee como «no lleva tiempo»", () => {
    const withoutFigure = {
      ...WITH_NAMES,
      chapters: [{ ...chapter("cap-1", 1, [{ id: "l1", order: 1, minutes: 0 }]), estimatedDuration: null }],
    } as unknown as CourseWithDetail;
    const [only] = mapCourseDetail(withoutFigure, state()).chapters;
    expect(only?.durationMin).toBeUndefined();
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

  it("cada lección trae las jugadas de su partida y cómo acabó, y la que no tiene jugadas no trae nada", () => {
    const games = new Map([["l1", { moves: "1.f3 e5 2.g4 Dh4#", result: "0-1" }]]);
    const view = mapChapterView(WITH_NAMES, "cap-1", state(), { games, reviewCount: 3 });

    expect(view?.lessons.map((lesson) => lesson.moves)).toEqual(["1.f3 e5 2.g4 Dh4#", undefined]);
    expect(view?.lessons.map((lesson) => lesson.result)).toEqual(["0-1", undefined]);
    expect(view?.course.reviewCount).toBe(3);
    expect(view?.course.reviewHref).toBe("/entrenador?course=10000009");
  });
});

describe("los ejercicios de una lección (D25)", () => {
  const practice = {
    total: 2,
    solved: 1,
    items: [],
    start: { href: "/cursos/10000009/1/l3/practica/2", label: "Continuar" },
  };

  it("viajan en la vista, y sin ellos la lección no es de práctica", () => {
    expect(mapLessonView(COURSE, lessonRow("l3", "cap-1", 3), state())).toMatchObject({
      practice: null,
      isPracticeOnly: false,
    });
    expect(mapLessonView(COURSE, lessonRow("l3", "cap-1", 3), state(), practice)).toMatchObject({
      practice,
      isPracticeOnly: false,
    });
  });

  it("una lección sin partida ni PGN y con ejercicios es sólo de práctica; sin ejercicios, no", () => {
    const empty = { ...lessonRow("l3", "cap-1", 3), pgn: "   " };
    expect(mapLessonView(COURSE, empty, state(), practice)?.isPracticeOnly).toBe(true);
    expect(mapLessonView(COURSE, empty, state(), null)?.isPracticeOnly).toBe(false);
    // The linked game rules: with one, it is a lesson to read.
    const linked = { ...empty, game: { pgn: "1. d4 *" } };
    expect(mapLessonView(COURSE, linked, state(), practice)?.isPracticeOnly).toBe(false);
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

describe("la columna junto a una lección", () => {
  it("trae todos los capítulos del curso, cada uno con sus lecciones en orden", () => {
    const outline = mapCourseOutline(COURSE, 2, state());
    expect(outline?.chapters.map((chapter) => chapter.id)).toEqual(["cap-1", "cap-2"]);
    expect(outline?.chapters[1]?.lessons.map((lesson) => lesson.id)).toEqual(["l4", "l5", "l6"]);
    expect(outline?.chapters[1]?.lessons[0]?.href).toBe("/cursos/10000009/2/l4");
  });

  it("con el filtro encendido, cada capítulo trae sólo lo que se ve", () => {
    const outline = mapCourseOutline(COURSE, 1, state({ onlyPriorityLessons: true }));
    expect(outline?.chapters.map((chapter) => chapter.lessons.map((lesson) => lesson.id))).toEqual([["l1"], ["l4"]]);
  });

  it("marca lo aprendido en cada lección", () => {
    const outline = mapCourseOutline(COURSE, 1, state({ lessonStatus: completed("l5") }));
    expect(outline?.chapters[1]?.lessons[1]?.statusCode).toBe(PROGRESS_STATUS.COMPLETED);
  });

  it("no existe para un capítulo que el curso no tiene", () => {
    expect(mapCourseOutline(COURSE, 9, state())).toBeNull();
  });
});
