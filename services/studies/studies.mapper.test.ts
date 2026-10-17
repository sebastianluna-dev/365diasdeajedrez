import { describe, expect, it } from "vitest";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import {
  mapGameView,
  mapStudyDetail,
  mapStudySummary,
  type GameViewRow,
  type StudyDetailRow,
  type StudySummaryRow,
} from "./studies.mapper";
import { STUDY_GAMES_PAGE_SIZE } from "./study-rules";

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
    orientation: null,
    analysisMode: null,
    pinnedComment: null,
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

describe("mapStudyDetail con los totales del estudio", () => {
  it("sin totales, la fila es el estudio entero y se cuenta de ella", () => {
    const detail = mapStudyDetail(study({ games: [game({ id: "a" })] }), "owner");
    expect(detail).toMatchObject({ gameCount: 1, citedGameCount: 0 });
  });

  it("con totales, cuenta y nombra con los del estudio y no con los de las partidas que trae", () => {
    const row = study({ games: [game({ id: "x", event: "Repetido" }), game({ id: "y" })] });
    const detail = mapStudyDetail(row, "owner", {
      gameCount: STUDY_GAMES_PAGE_SIZE * 2 + 2,
      citedGameCount: 7,
      // The event repeats elsewhere in the study, so it does not name the game.
      eventCounts: new Map([["Repetido", 3]]),
    });
    expect(detail.gameCount).toBe(STUDY_GAMES_PAGE_SIZE * 2 + 2);
    expect(detail.citedGameCount).toBe(7);
    expect(detail.games.map((item) => item.label)).toEqual(["Partida 1", "Partida 2"]);
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
  it("shows on its board where the first game ends, from the side that game is seen", () => {
    const row = summary({
      games: [{ id: "g1", pgn: "1. e4 e5 2. Nf3 *", orientation: { code: "BLACK" } }],
    });
    const view = mapStudySummary(row, "owner", 12);
    expect(view.boardFen).toBe("rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2");
    expect(view.boardOrientation).toBe("black");
  });

  it("shows the starting position, from White, for a study with no games", () => {
    const view = mapStudySummary(summary(), "owner", 0);
    expect(view.boardFen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(view.boardOrientation).toBe("white");
  });

  it("searches its name, its description and its games' names, without case or accents", () => {
    const view = mapStudySummary(summary({ name: "Ataques", description: "Clásicos" }), "owner", 2, {
      gameTerms: ["Garri Kaspárov", "La Inmortal"],
    });
    expect(view.searchText).toBe("ataques clasicos garri kasparov la inmortal");
  });

  it("opens on the game the viewer left it on, and its board is where that game ends", () => {
    const row = summary({ games: [{ id: "g1", pgn: "", orientation: null }] });
    const view = mapStudySummary(row, "owner", 2, {
      visit: { openedAt: new Date(2026, 9, 7), game: { id: "g2", pgn: "1. d4 d5 *", orientation: null } },
    });
    expect(view.href).toBe("/estudios/study-1/partidas/g2");
    expect(view.boardFen).toBe("rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2");
  });

  it("goes back to its first game when the one it was left on was deleted", () => {
    const row = summary({ games: [{ id: "g1", pgn: "", orientation: null }] });
    const view = mapStudySummary(row, "owner", 1, { visit: { openedAt: new Date(2026, 9, 7), game: null } });
    expect(view.href).toBe("/estudios/study-1/partidas/g1");
  });

  it("is recent by when it was last opened, or by when it was created", () => {
    const opened = mapStudySummary(summary(), "owner", 0, {
      visit: { openedAt: new Date(Date.UTC(2026, 9, 7)), game: null },
    });
    expect(opened.recentAt).toBe("2026-10-07T00:00:00.000Z");
    expect(mapStudySummary(summary(), "owner", 0).recentAt).toBe(new Date(2026, 0, 1).toISOString());
  });

  it("says where a study that is not theirs comes from", () => {
    const shared = summary({ shares: [{ teacher: { displayName: "GM Profesor Demo" } }] });
    expect(mapStudySummary(shared, "student", 1).origin).toEqual({ code: "TEACHER", label: "GM Profesor Demo" });
    expect(mapStudySummary(summary(), "owner", 1).origin).toBeUndefined();
  });

  it("enlaza a la primera partida, y al estudio sólo cuando no tiene ninguna", () => {
    const withGames = summary({ games: [{ id: "g1", pgn: "", orientation: null }] });
    expect(mapStudySummary(withGames, "owner", 1).href).toBe("/estudios/study-1/partidas/g1");
    expect(mapStudySummary(summary(), "owner", 0).href).toBe("/estudios/study-1");
  });

  it("el total viene del servicio y las citadas de la propia fila", () => {
    const view = mapStudySummary(summary({ _count: { games: 3 } }), "owner", 40);
    expect(view.gameCount).toBe(40);
    expect(view.citedGameCount).toBe(3);
  });

  it("dice hace cuánto se tocó, además de la fecha", () => {
    const view = mapStudySummary(summary(), "owner", 0, { now: new Date(2026, 8, 24) });
    expect(view.updatedAtLabel).toBe("1 de junio, 2026");
    expect(view.updatedAgoLabel).toBe("hace 3 meses");
  });
});

describe("a game's settings in its study's list", () => {
  it("opens from White, in plain analysis and with no comment until its owner says otherwise", () => {
    const [item] = mapStudyDetail(study({ games: [game({ id: "g1" })] }), "owner").games;

    expect(item?.orientationCode).toBe("WHITE");
    expect(item?.analysisModeCode).toBeUndefined();
    expect(item?.pinnedComment).toBeUndefined();
  });

  it("carries the side, the mode and the comment its owner set", () => {
    const [item] = mapStudyDetail(
      study({
        games: [
          game({
            id: "g1",
            orientation: { code: "BLACK" },
            analysisMode: { code: "CONCEAL" },
            pinnedComment: "Juegan las negras.",
          }),
        ],
      }),
      "owner",
    ).games;

    expect(item?.orientationCode).toBe("BLACK");
    expect(item?.analysisModeCode).toBe("CONCEAL");
    expect(item?.pinnedComment).toBe("Juegan las negras.");
  });
});

describe("mapGameView: «Crear ejercicio desde aquí» (D11)", () => {
  /** A game of a study, with the shape `gameViewInclude` returns, owned by `owner`. */
  function row(kindCode: string = DATABASE_KIND.STUDY): GameViewRow {
    return {
      id: "game-1",
      title: null,
      white: "Blancas",
      black: "Negras",
      whiteElo: null,
      blackElo: null,
      whiteTitle: null,
      blackTitle: null,
      whiteCountry: null,
      blackCountry: null,
      round: null,
      eco: null,
      event: null,
      site: null,
      playedAt: null,
      initialFen: null,
      pinnedComment: null,
      pgn: "1. e4 *",
      result: { label: "*", code: "UNFINISHED" },
      orientation: null,
      analysisMode: null,
      source: { label: "Manual" },
      database: { id: "study-1", name: "Mi estudio", userId: "owner", kind: { code: kindCode } },
      _count: { positions: 2 },
    } as unknown as GameViewRow;
  }

  it("lo ofrece sólo en la partida propia, y sólo cuando el servicio dice que quien mira crea ejercicios", () => {
    expect(mapGameView(row(), "owner", true).canCreateExercise).toBe(true);
    expect(mapGameView(row(), "owner", false).canCreateExercise).toBe(false);
    expect(mapGameView(row(), "owner").canCreateExercise).toBe(false);
    expect(mapGameView(row(), "owner", false).createExerciseHref).toBeUndefined();
  });

  it("lleva al banco del profesor, o al de la academia cuando mira el staff (fase 4)", () => {
    expect(mapGameView(row(), "owner", true).createExerciseHref).toMatch(/^\/profesor\/ejercicios\/nuevo\?estudio=/);
    expect(mapGameView(row(), "owner", true, "staff").createExerciseHref).toMatch(
      /^\/administracion\/ejercicios\/nuevo\?estudio=/,
    );
  });

  it("nunca en la partida de otro, aunque quien mira sea profesor", () => {
    const seen = mapGameView(row(), "teacher", true);
    expect(seen.canEdit).toBe(false);
    expect(seen.canCreateExercise).toBe(false);
    expect(mapGameView(row(), null, true).canCreateExercise).toBe(false);
  });
});
