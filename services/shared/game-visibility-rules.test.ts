import { describe, expect, it } from "vitest";

import { buildVisibleDatabasesWhere, buildVisibleGamesWhere } from "@/services/shared/game-visibility-rules";

// Se comprueba la FORMA del `where` porque es lo único que este módulo produce:
// la frontera que impide que alguien vea material de otro. Cada rama es un
// camino de acceso distinto y perder una en una refactorización sería una fuga
// silenciosa —la consulta seguiría funcionando, sólo que enseñando de menos o
// de más—.

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
    // Propias, de curso, repartidas y vistas en clase.
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
