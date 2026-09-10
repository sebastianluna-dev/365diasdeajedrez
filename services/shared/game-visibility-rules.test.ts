import { describe, expect, it } from "vitest";

import { buildVisibleDatabasesWhere, buildVisibleGamesWhere } from "@/services/shared/game-visibility-rules";

// The SHAPE of the `where` is checked because it is the only thing this module
// produces: the border that keeps anyone from seeing someone else's material.
// Each branch is a different access path and losing one in a refactor would be
// a silent leak — the query would go on working, only showing too little or too
// much.

const ALICE = "user-alice";
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

describe("partidas visibles", () => {
  it("añade el camino del reparto a los de siempre", () => {
    const where = buildVisibleGamesWhere({ userId: ALICE });
    expect(where.OR).toContainEqual({ database: { shares: { some: { userId: ALICE } } } });
    // Own, course, shared and seen in class.
    expect(where.OR).toHaveLength(4);
  });

  it("un profesor ve además las de sus alumnos con asignación activa", () => {
    const where = buildVisibleGamesWhere({ userId: ALICE, teacherId: "teacher-1" });
    expect(where.OR).toHaveLength(5);
    expect(where.OR).toContainEqual({
      database: { user: { studentAssignments: { some: { teacherId: "teacher-1", endedAt: null } } } },
    });
  });

  it("quien no es profesor no arrastra esa rama", () => {
    expect(JSON.stringify(buildVisibleGamesWhere({ userId: ALICE }))).not.toContain("studentAssignments");
  });
});
