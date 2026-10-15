import { describe, expect, it } from "vitest";
import { studentVisibleClassBlockWhere } from "./class-block-visibility";

import {
  buildListedDatabasesWhere,
  buildVisibleDatabasesWhere,
  buildVisibleGamesWhere,
} from "@/services/shared/game-visibility-rules";

// The SHAPE of the `where` is checked because it is the only thing this module
// produces: the border that keeps anyone from seeing someone else's material.
// Each branch is a different access path and losing one in a refactor would be
// a silent leak — the query would go on working, only showing too little or too
// much.

const ALICE = "user-alice";
const NOW = new Date("2026-10-14T17:40:00.000Z");
const BOB = "user-bob";

describe("bases visibles", () => {
  const where = buildVisibleDatabasesWhere({ userId: ALICE });

  it("tiene exactamente tres caminos: propias, de curso empezado y repartidas", () => {
    expect(where.OR).toHaveLength(3);
  });

  it("incluye las colecciones que le repartieron", () => {
    expect(where.OR).toContainEqual({ shares: { some: { userId: ALICE } } });
  });

  it("no cuela el id de otro por ninguno de los tres", () => {
    expect(JSON.stringify(where)).not.toContain(BOB);
  });
});

describe("bases que lista «Mis estudios»", () => {
  const where = buildListedDatabasesWhere({ userId: ALICE });

  it("son las visibles, sin perder ninguno de sus tres caminos", () => {
    expect(where.AND).toContainEqual(buildVisibleDatabasesWhere({ userId: ALICE }));
  });

  it("dejan fuera las de un curso, que se siguen abriendo y buscando", () => {
    expect(where.AND).toContainEqual({ courseId: null });
    expect(where.AND).toHaveLength(2);
  });
});

describe("partidas visibles", () => {
  it("añade el camino del reparto a los de siempre", () => {
    const where = buildVisibleGamesWhere({ userId: ALICE }, NOW);
    expect(where.OR).toContainEqual({ database: { shares: { some: { userId: ALICE } } } });
    // Own, course, shared and seen in class.
    expect(where.OR).toHaveLength(4);
  });

  it("las vistas en clase llegan sólo por un bloque que el alumno puede ver", () => {
    const where = buildVisibleGamesWhere({ userId: ALICE }, NOW);
    expect(where.OR).toContainEqual({ classBlocks: { some: studentVisibleClassBlockWhere(ALICE, NOW) } });
    expect(JSON.stringify(where)).not.toContain("TEACHER");
  });

  it("un profesor ve además las de sus alumnos con asignación activa", () => {
    const where = buildVisibleGamesWhere({ userId: ALICE, teacherId: "teacher-1" }, NOW);
    expect(where.OR).toHaveLength(5);
    expect(where.OR).toContainEqual({
      database: { user: { studentAssignments: { some: { teacherId: "teacher-1", endedAt: null } } } },
    });
  });

  it("quien no es profesor no arrastra esa rama", () => {
    expect(JSON.stringify(buildVisibleGamesWhere({ userId: ALICE }, NOW))).not.toContain("studentAssignments");
  });
});
