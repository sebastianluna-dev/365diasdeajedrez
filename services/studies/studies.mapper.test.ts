import { describe, expect, it } from "vitest";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import { mapStudyDetail, type StudyDetailRow } from "./studies.mapper";

// Fixture mínimo con la forma que devuelve `studyDetailInclude`. Se construye
// a mano y se afirma el tipo: lo que se prueba es el mapeo, no Prisma.
type GameRow = StudyDetailRow["games"][number];

function game(overrides: Partial<GameRow> & { id: string }): GameRow {
  return {
    title: null,
    white: "Blancas",
    black: "Negras",
    round: null,
    eco: null,
    event: null,
    playedAt: null,
    result: { label: "1-0" },
    _count: { classBlocks: 0 },
    ...overrides,
  };
}

function study(overrides: Partial<StudyDetailRow> = {}): StudyDetailRow {
  return {
    id: "study-1",
    userId: "owner",
    name: "Mi estudio",
    description: null,
    kind: { id: 1, code: DATABASE_KIND.STUDY, label: "Estudio", order: 0 },
    kindId: 1,
    courseId: null,
    course: null,
    isDefault: false,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
    shares: [],
    games: [],
    ...overrides,
  } as unknown as StudyDetailRow;
}

describe("mapStudyDetail", () => {
  it("nombra cada partida bajando por la escalera: título, ronda, evento único, número", () => {
    const row = study({
      games: [
        game({ id: "a", title: "La Inmortal" }),
        game({ id: "b", round: "3" }),
        game({ id: "c", event: "Linares 1994" }),
        game({ id: "d", event: "Material del curso" }),
        game({ id: "e", event: "Material del curso" }),
      ],
    });
    const labels = mapStudyDetail(row, "owner").games.map((item) => item.label);
    expect(labels).toEqual(["La Inmortal", "Ronda 3", "Linares 1994", "Partida 4", "Partida 5"]);
  });

  it("cuenta las partidas citadas en clases y enlaza cada una a su ficha", () => {
    const row = study({ games: [game({ id: "a", _count: { classBlocks: 2 } }), game({ id: "b" })] });
    const detail = mapStudyDetail(row, "owner");
    expect(detail.citedGameCount).toBe(1);
    expect(detail.games.map((item) => item.citedInClass)).toEqual([true, false]);
    expect(detail.games[0].href).toBe("/estudios/study-1/partidas/a");
  });

  it("al dueño le enseña a quién repartió; a quien recibe, de quién viene", () => {
    const row = study({
      kind: { id: 3, code: DATABASE_KIND.COLLECTION, label: "Colección", order: 2 },
      shares: [
        {
          createdAt: new Date(2026, 0, 2),
          user: { id: "alumna", displayName: "Ana", email: "ana@ejemplo.com" },
          teacher: { displayName: "Maestro" },
        },
      ],
    } as Partial<StudyDetailRow>);

    const asOwner = mapStudyDetail(row, "owner");
    expect(asOwner.shares.map((share) => share.displayName)).toEqual(["Ana"]);
    expect(asOwner.sharedByName).toBeUndefined();
    expect(asOwner.permissions.canEditGames).toBe(true);

    const asStudent = mapStudyDetail(row, "alumna");
    expect(asStudent.shares).toEqual([]);
    expect(asStudent.sharedByName).toBe("Maestro");
    expect(asStudent.permissions.canEditGames).toBe(false);
  });
});
