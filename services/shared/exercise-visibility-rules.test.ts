import { describe, expect, it } from "vitest";
import {
  buildOwnExercisesWhere,
  buildPickableExercisesWhere,
  buildSolvableExercisesWhere,
  seriesItemAvailability,
  solvableInContextWhere,
  studentVisibleSeriesWhere,
  teacherVisibleAttemptsWhere,
  USABLE_STATUS_CODES,
  type ExerciseViewer,
} from "./exercise-visibility-rules";

// The SHAPE of each `where` is checked, and each one is also evaluated over a
// handful of rows by a small reader of exactly the filters it uses: the rule
// is the border that keeps a student from solving what is not theirs and a
// teacher from watching another teacher's material (D08), and a branch lost in
// a refactor would be a silent leak — the query would go on working.

type Row = Record<string, unknown>;

/**
 * Reads a Prisma `where` over plain objects: AND/OR, equalities, `in`, `not`,
 * `some` over a list, and a relation as a nested object. Only what this
 * module writes.
 */
function holds(row: Row | null | undefined, where: Row): boolean {
  if (!row) return false;
  return Object.entries(where).every(([key, condition]) => {
    if (key === "AND") return (condition as Row[]).every((part) => holds(row, part));
    if (key === "OR") return (condition as Row[]).some((part) => holds(row, part));
    const value = row[key];
    if (condition === null || typeof condition !== "object") return (value ?? null) === condition;
    const op = condition as { in?: unknown[]; not?: unknown; some?: Row };
    if (op.some) return ((value as Row[] | undefined) ?? []).some((item) => holds(item, op.some!));
    if ("in" in op) return op.in!.includes(value);
    if ("not" in op) return (value ?? null) !== op.not;
    return holds(value as Row | null, condition as Row);
  });
}

const ALICE = "u-alice";
const BOB = "u-bob";
const T1 = "t-1";
const T2 = "t-2";

const assignment = (studentId: string, endedAt: Date | null = null) => ({ studentId, endedAt });

/** A teacher's series shared with `userId`, by a teacher whose assignments are `students`. */
function series(
  id: string,
  teacherId: string | null,
  shares: string[],
  students: Row[],
  publishedAt: Date | null = null,
) {
  return {
    id,
    teacherId,
    publishedAt,
    shares: shares.map((userId) => ({ userId })),
    teacher: teacherId ? { id: teacherId, students } : null,
  };
}

function exercise(
  id: string,
  teacherId: string | null,
  status: string,
  inSeries: Row[] = [],
  publishedAt: Date | null = null,
) {
  return { id, teacherId, publishedAt, status: { code: status }, seriesItems: inSeries.map((s) => ({ series: s })) };
}

const ALICE_WITH_T1: ExerciseViewer = { userId: ALICE, activeTeacherId: T1 };
const ALICE_ALONE: ExerciseViewer = { userId: ALICE, activeTeacherId: null };

const T1_SERIES = series("s-1", T1, [ALICE], [assignment(ALICE)]);
const T1_SERIES_FOR_BOB = series("s-2", T1, [BOB], [assignment(ALICE), assignment(BOB)]);
const ACADEMY_SERIES = series("s-3", null, [], [], new Date("2026-10-01"));

describe("lo que un alumno puede resolver", () => {
  const solvable = (row: Row, viewer: ExerciseViewer = ALICE_WITH_T1) =>
    holds(row, buildSolvableExercisesWhere(viewer) as Row);

  it("el ejercicio listo de su profesor, en una serie que le dio", () => {
    expect(solvable(exercise("e", T1, "READY", [T1_SERIES]))).toBe(true);
    expect(solvable(exercise("e", T1, "IN_REVIEW", [T1_SERIES]))).toBe(true);
  });

  it("nunca un borrador ni uno archivado, aunque esté en la serie", () => {
    expect(solvable(exercise("e", T1, "DRAFT", [T1_SERIES]))).toBe(false);
    expect(solvable(exercise("e", T1, "ARCHIVED", [T1_SERIES]))).toBe(false);
  });

  it("una serie dada a otro alumno no le llega", () => {
    expect(solvable(exercise("e", T1, "READY", [T1_SERIES_FOR_BOB]))).toBe(false);
  });

  it("el ejercicio listo de un profesor no está en la biblioteca", () => {
    expect(solvable(exercise("e", T2, "READY"))).toBe(false);
    expect(solvable(exercise("e", T1, "READY"))).toBe(false);
  });

  it("la serie de un profesor cuya asignación terminó ya no le llega", () => {
    const ended = series("s-4", T2, [ALICE], [assignment(ALICE, new Date("2026-10-10"))]);
    expect(solvable(exercise("e", T2, "READY", [ended]), ALICE_WITH_T1)).toBe(false);
    expect(solvable(exercise("e", T2, "PUBLISHED", [ended]), ALICE_WITH_T1)).toBe(true); // the library, not the series
    expect(solvable(exercise("e", T1, "READY", [T1_SERIES]), ALICE_ALONE)).toBe(false);
  });

  it("el ejercicio de otro profesor que sale de la biblioteca sale de la serie al momento", () => {
    // T1 put T2's library exercise in a series; the staff took it out (PUBLISHED → READY).
    expect(solvable(exercise("e", T2, "PUBLISHED", [T1_SERIES]))).toBe(true);
    expect(solvable(exercise("e", T2, "READY", [T1_SERIES]))).toBe(false);
  });

  it("la biblioteca, y las series de la academia publicadas", () => {
    expect(solvable(exercise("e", null, "PUBLISHED"), ALICE_ALONE)).toBe(true);
    expect(solvable(exercise("e", null, "PUBLISHED", [ACADEMY_SERIES]), ALICE_ALONE)).toBe(true);
    expect(holds(ACADEMY_SERIES, studentVisibleSeriesWhere(ALICE) as Row)).toBe(true);
    expect(holds({ ...ACADEMY_SERIES, publishedAt: null }, studentVisibleSeriesWhere(ALICE) as Row)).toBe(false);
  });

  it("no cuela el id de otro alumno por ningún camino", () => {
    expect(JSON.stringify(buildSolvableExercisesWhere(ALICE_WITH_T1))).not.toContain(BOB);
  });
});

describe("lo que puede resolver por el camino que dice el intento", () => {
  it("una serie: sólo los ejercicios de esa serie", () => {
    const where = solvableInContextWhere({ kind: "SERIES", seriesId: "s-1" }, ALICE_WITH_T1) as Row;
    expect(holds(exercise("e", T1, "READY", [T1_SERIES]), where)).toBe(true);
    const other = series("s-9", T1, [ALICE], [assignment(ALICE)]);
    expect(holds(exercise("e", T1, "READY", [other]), where)).toBe(false);
    // In the library, but not in this series: the attempt does not claim that path.
    expect(holds(exercise("e", null, "PUBLISHED"), where)).toBe(false);
  });

  it("la práctica libre: sólo la biblioteca; el repaso: cualquier camino", () => {
    const practice = solvableInContextWhere({ kind: "PRACTICE" }, ALICE_WITH_T1) as Row;
    expect(holds(exercise("e", null, "PUBLISHED"), practice)).toBe(true);
    expect(holds(exercise("e", T1, "READY", [T1_SERIES]), practice)).toBe(false);
    expect(solvableInContextWhere({ kind: "REVIEW" }, ALICE_WITH_T1)).toEqual(
      buildSolvableExercisesWhere(ALICE_WITH_T1),
    );
  });
});

describe("lo que un autor puede elegir para una serie (D08)", () => {
  it("lo suyo utilizable y la biblioteca; nunca lo de otro profesor", () => {
    const where = buildPickableExercisesWhere({ teacherId: T1 }) as Row;
    expect(holds(exercise("e", T1, "READY"), where)).toBe(true);
    expect(holds(exercise("e", T1, "DRAFT"), where)).toBe(false);
    expect(holds(exercise("e", T1, "ARCHIVED"), where)).toBe(false);
    expect(holds(exercise("e", T2, "READY"), where)).toBe(false);
    expect(holds(exercise("e", T2, "PUBLISHED"), where)).toBe(true);
  });

  it("el staff, sólo la biblioteca", () => {
    const where = buildPickableExercisesWhere({ teacherId: null }) as Row;
    expect(holds(exercise("e", null, "PUBLISHED"), where)).toBe(true);
    expect(holds(exercise("e", null, "DRAFT"), where)).toBe(false);
    expect(holds(exercise("e", T1, "READY"), where)).toBe(false);
  });

  it("el ejercicio publicado de una lección no es de la biblioteca: nadie lo elige para una serie (D04)", () => {
    const inLesson = { ...exercise("e", null, "PUBLISHED"), lessonId: "l-1" };
    expect(holds(inLesson, buildPickableExercisesWhere({ teacherId: null }) as Row)).toBe(false);
    expect(holds(inLesson, buildPickableExercisesWhere({ teacherId: T1 }) as Row)).toBe(false);
    // Nor does it reach a student by the library's path, even inside an academy series.
    const inSeries = { ...exercise("e", null, "PUBLISHED", [ACADEMY_SERIES]), lessonId: "l-1" };
    expect(holds(inSeries, solvableInContextWhere({ kind: "PRACTICE" }, ALICE_ALONE) as Row)).toBe(false);
    expect(holds(inSeries, solvableInContextWhere({ kind: "SERIES", seriesId: "s-3" }, ALICE_ALONE) as Row)).toBe(
      false,
    );
  });

  it("«Mis ejercicios» son los suyos, en cualquier estado", () => {
    expect(buildOwnExercisesWhere(T1)).toEqual({ teacherId: T1 });
    expect(USABLE_STATUS_CODES).toEqual(["READY", "IN_REVIEW", "PUBLISHED"]);
  });
});

describe("los intentos que un profesor puede ver", () => {
  const visible = (attempt: Row) => holds(attempt, teacherVisibleAttemptsWhere(T1, ALICE) as Row);
  const attempt = (context: string, ex: Row, seriesRow: Row | null = null) => ({
    userId: ALICE,
    exerciseId: ex.id,
    seriesId: seriesRow ? seriesRow.id : null,
    context: { code: context },
    exercise: ex,
    series: seriesRow,
  });

  it("los de su serie, sea de quien sea el ejercicio, también después de salir de la biblioteca", () => {
    expect(visible(attempt("SERIES", exercise("e", T1, "READY"), T1_SERIES))).toBe(true);
    expect(visible(attempt("SERIES", exercise("e", T2, "READY", [], new Date("2026-09-01")), T1_SERIES))).toBe(true);
  });

  it("nunca los de la serie de otro profesor con el ejercicio de ese profesor", () => {
    const t2Series = series("s-5", T2, [ALICE], [assignment(ALICE)]);
    expect(visible(attempt("SERIES", exercise("e", T2, "READY"), t2Series))).toBe(false);
  });

  it("en un contexto neutro: el suyo aunque esté archivado, el que estuvo en la biblioteca, nunca el inédito de otro", () => {
    expect(visible(attempt("REVIEW", exercise("e", T1, "ARCHIVED")))).toBe(true);
    expect(visible(attempt("PRACTICE", exercise("e", null, "PUBLISHED", [], new Date("2026-09-01"))))).toBe(true);
    // An academy exercise that left the library keeps its first publication.
    expect(visible(attempt("REVIEW", exercise("e", null, "ARCHIVED", [], new Date("2026-09-01"))))).toBe(true);
    expect(visible(attempt("REVIEW", exercise("e", T2, "READY")))).toBe(false);
  });

  it("los de una serie eliminada en su propio ejercicio, también archivado (D45); en el de otro, no", () => {
    // «Eliminar la serie» leaves the attempt with no series and its SERIES context.
    expect(visible(attempt("SERIES", exercise("e", T1, "READY")))).toBe(true);
    expect(visible(attempt("SERIES", exercise("e", T1, "ARCHIVED")))).toBe(true);
    expect(visible(attempt("SERIES", exercise("e", T2, "READY")))).toBe(false);
    expect(visible(attempt("SERIES", exercise("e", null, "PUBLISHED", [], new Date("2026-09-01"))))).toBe(false);
  });

  it("sólo del alumno pedido, y sólo intentos de ejercicios", () => {
    const where = teacherVisibleAttemptsWhere(T1, ALICE);
    expect(where).toMatchObject({ userId: ALICE, exerciseId: { not: null } });
    expect(JSON.stringify(where)).not.toContain("status");
  });
});

describe("seriesItemAvailability", () => {
  it("dice lo mismo que la rama de las series", () => {
    expect(seriesItemAvailability({ teacherId: T1, statusCode: "READY" }, T1)).toBe("available");
    expect(seriesItemAvailability({ teacherId: T2, statusCode: "PUBLISHED" }, T1)).toBe("available");
    expect(seriesItemAvailability({ teacherId: T1, statusCode: "ARCHIVED" }, T1)).toBe("archived");
    expect(seriesItemAvailability({ teacherId: T1, statusCode: "DRAFT" }, T1)).toBe("unavailable");
    expect(seriesItemAvailability({ teacherId: T2, statusCode: "READY" }, T1)).toBe("unavailable");
    expect(seriesItemAvailability({ teacherId: null, statusCode: "ARCHIVED" }, null)).toBe("unavailable");
  });

  it("coincide con la regla del alumno en cada combinación", () => {
    for (const status of ["DRAFT", "READY", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const) {
      for (const owner of [T1, T2]) {
        const row = exercise("e", owner, status, [T1_SERIES]);
        const rule = holds(row, buildSolvableExercisesWhere(ALICE_WITH_T1) as Row);
        const said = seriesItemAvailability({ teacherId: owner, statusCode: status }, T1) === "available";
        expect(said, `${owner} ${status}`).toBe(rule);
      }
    }
  });
});
