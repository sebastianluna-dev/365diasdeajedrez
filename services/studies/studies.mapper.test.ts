import { describe, expect, it } from "vitest";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import {
  mapStudyDetail,
  mapStudySummary,
  STUDY_GAMES_PAGE_SIZE,
  type StudyDetailRow,
  type StudySummaryRow,
} from "./studies.mapper";

// Minimal fixture with the shape `studyDetailInclude` returns. It is built by
// hand and the type is asserted: what is tested is the mapping, not Prisma.
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
    expect(detail.games[0]?.href).toBe("/estudios/study-1/partidas/a");
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

describe("mapStudyDetail con paginación", () => {
  it("sin datos de paginación, la fila es el estudio entero: una página", () => {
    const detail = mapStudyDetail(study({ games: [game({ id: "a" })] }), "owner");
    expect(detail).toMatchObject({ gameCount: 1, page: 1, pageCount: 1 });
  });

  it("numera las partidas de una página con el desplazamiento de las anteriores", () => {
    const row = study({ games: [game({ id: "x", event: "Repetido" }), game({ id: "y" })] });
    const detail = mapStudyDetail(row, "owner", {
      gameCount: STUDY_GAMES_PAGE_SIZE * 2 + 2,
      citedGameCount: 7,
      // The event repeats elsewhere in the study, so it does not name the game.
      eventCounts: new Map([["Repetido", 3]]),
      page: 3,
    });
    expect(detail.pageCount).toBe(3);
    expect(detail.citedGameCount).toBe(7);
    expect(detail.games.map((item) => item.label)).toEqual([
      `Partida ${STUDY_GAMES_PAGE_SIZE * 2 + 1}`,
      `Partida ${STUDY_GAMES_PAGE_SIZE * 2 + 2}`,
    ]);
  });
});

function summary(overrides: Partial<StudySummaryRow> = {}): StudySummaryRow {
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
    updatedAt: new Date(2026, 5, 1),
    shares: [],
    _count: { games: 0 },
    games: [],
    ...overrides,
  } as unknown as StudySummaryRow;
}

describe("mapStudySummary", () => {
  it("lista las primeras partidas por su título o por sus jugadores", () => {
    const row = summary({
      games: [
        { id: "g1", title: "La Inmortal", white: "Anderssen", black: "Kieseritzky" },
        { id: "g2", title: null, white: "Luna, Sebastián", black: "Cervantes, Andrea" },
      ],
    });
    expect(mapStudySummary(row, "owner", 12).previewGames).toEqual([
      "La Inmortal",
      "Luna, Sebastián – Cervantes, Andrea",
    ]);
  });

  it("enlaza a la primera partida, y al estudio sólo cuando no tiene ninguna", () => {
    const withGames = summary({ games: [{ id: "g1", title: null, white: "A", black: "B" }] });
    expect(mapStudySummary(withGames, "owner", 1).href).toBe("/estudios/study-1/partidas/g1");
    expect(mapStudySummary(summary(), "owner", 0).href).toBe("/estudios/study-1");
  });

  it("el total viene del servicio y las citadas de la propia fila", () => {
    const view = mapStudySummary(summary({ _count: { games: 3 } }), "owner", 40);
    expect(view.gameCount).toBe(40);
    expect(view.citedGameCount).toBe(3);
  });

  it("dice hace cuánto se tocó, además de la fecha", () => {
    const view = mapStudySummary(summary(), "owner", 0, new Date(2026, 8, 24));
    expect(view.updatedAtLabel).toBe("1 de junio, 2026");
    expect(view.updatedAgoLabel).toBe("hace 3 meses");
  });
});
