import { describe, expect, it } from "vitest";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { platformRoutes, teacherRoutes } from "@/lib/platform-routes";
import { GAME_ORIGIN } from "@/services/shared/game-origin";
import { mapExplorerGame, type ExplorerGameRow, type ExplorerViewer } from "./game-explorer.mapper";

/** Loose on purpose: the fixtures name only what the mapper reads. */
function row(overrides: Record<string, unknown> & { database: Record<string, unknown> }): ExplorerGameRow {
  const { database, ...rest } = overrides;
  return {
    id: "g1",
    white: "Blancas",
    black: "Negras",
    whiteElo: null,
    blackElo: null,
    playedAt: null,
    event: null,
    result: { label: "1-0" },
    classBlocks: [],
    ...rest,
    database: {
      id: "db1",
      userId: "alumna",
      ownerType: { code: OWNER_TYPE.USER },
      user: { teacher: null, staff: null },
      ...database,
    },
  } as unknown as ExplorerGameRow;
}

const student: ExplorerViewer = { userId: "alumna", assignedStudentIds: new Set() };
const teacher: ExplorerViewer = { userId: "profe", assignedStudentIds: new Set(["alumna"]) };
const stranger: ExplorerViewer = { userId: "otro", assignedStudentIds: new Set() };

describe("mapExplorerGame", () => {
  it("la propia partida abre en el estudio del que mira", () => {
    expect(mapExplorerGame(row({ database: {} }), student).href).toBe(platformRoutes.gameDetail("db1", "g1"));
  });

  it("una partida de curso abre en su colección sea quien sea", () => {
    const game = row({ database: { userId: null, ownerType: { code: OWNER_TYPE.COURSE }, user: null } });
    expect(mapExplorerGame(game, stranger)).toMatchObject({
      href: platformRoutes.gameDetail("db1", "g1"),
      origin: GAME_ORIGIN.COURSE,
      originLabel: "Curso",
    });
  });

  it("el profesor abre la partida de su alumno asignado en su panel", () => {
    expect(mapExplorerGame(row({ database: {} }), teacher).href).toBe(teacherRoutes.studentGame("alumna", "db1", "g1"));
  });

  it("una partida ajena vista en clase lleva a esa clase; sin nada de eso, no lleva a ningún sitio", () => {
    const seen = row({ database: {}, classBlocks: [{ classId: "c9" }] });
    expect(mapExplorerGame(seen, stranger)).toMatchObject({
      href: platformRoutes.classDetail("c9"),
      seenInClass: true,
    });
    expect(mapExplorerGame(row({ database: {} }), stranger)).toMatchObject({ href: undefined, seenInClass: false });
  });

  it("el origen sale de quién es el dueño de la base", () => {
    const editor = row({ database: { userId: "profe", user: { teacher: { id: "t1" }, staff: null } } });
    expect(mapExplorerGame(editor, stranger)).toMatchObject({ origin: GAME_ORIGIN.EDITOR, originLabel: "Profesorado" });
    expect(mapExplorerGame(row({ database: {} }), stranger)).toMatchObject({ origin: GAME_ORIGIN.STUDENT_STUDY });
  });

  it("los Elo y el evento ausentes salen como undefined, no como null", () => {
    const game = mapExplorerGame(row({ database: {}, whiteElo: 2500 }), student);
    expect(game).toMatchObject({ whiteElo: 2500, blackElo: undefined, event: undefined, playedAtLabel: undefined });
  });
});
