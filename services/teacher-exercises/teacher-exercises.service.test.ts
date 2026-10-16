import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/lib/platform-db/generated/client";

// The reads of phase 1b whose answer is a refusal when the row is not the
// teacher's: «Crear ejercicio desde aquí» seeds nothing from a game of
// someone else's study. The rule travels in the `where`, so the fake database
// here evaluates exactly that `where` over a handful of rows; the session and
// the rest of Prisma are replaced.

const TEACHER = { id: "t-1", displayName: "Profesor Demo", isActive: true };
const USER = { id: "u-teacher", email: "profesor.demo@example.com", displayName: "Profesor Demo" };

vi.mock("@/lib/platform-auth/roles", () => ({
  requireTeacher: vi.fn(async () => ({ user: USER, teacher: TEACHER })),
}));

/** The games on the fake database, each with its study's owner. */
const GAMES = [
  {
    id: "game-own",
    databaseId: "study-own",
    database: { userId: USER.id },
    title: null,
    white: "Morphy, Paul",
    black: "Duke Karl / Count Isouard",
    event: "Paris",
    playedAt: new Date("1858-11-02T00:00:00.000Z"),
    pgn: "1. e4 e5 2. Nf3 d6 3. d4 Bg4 *",
  },
  {
    id: "game-other",
    databaseId: "study-other",
    database: { userId: "u-someone-else" },
    title: null,
    white: "A",
    black: "B",
    event: null,
    playedAt: null,
    pgn: "1. d4 d5 *",
  },
];

const gameFindFirst = vi.fn(async ({ where }: { where: Prisma.GameWhereInput }) => {
  const owner = (where.database as { userId?: string } | undefined)?.userId;
  return (
    GAMES.find(
      (game) => game.id === where.id && game.databaseId === where.databaseId && game.database.userId === owner,
    ) ?? null
  );
});
vi.mock("@/lib/platform-db/get-platform-db", () => ({
  getPlatformDb: () => ({
    game: { findFirst: gameFindFirst },
  }),
}));

const { getExercisePrefillFromGame } = await import("./teacher-exercises.service");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getExercisePrefillFromGame («Crear ejercicio desde aquí», D11)", () => {
  it("siembra la posición tras la jugada y lo que sigue, con la fuente de la partida", async () => {
    const prefill = await getExercisePrefillFromGame(
      { userId: USER.id },
      { studyId: "study-own", gameId: "game-own", path: "0.0" },
    );
    expect(prefill).not.toBeNull();
    expect(prefill?.solutionPgn).toContain('[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"]');
    expect(prefill?.solutionPgn).toContain("2. Nf3 d6 3. d4 Bg4");
    expect(prefill).toMatchObject({
      title: "Morphy, Paul – Duke Karl / Count Isouard, 1858",
      sourceGameId: "game-own",
    });
  });

  it("la partida de otro no siembra nada: el dueño va en el where y no hay fila que descartar", async () => {
    const prefill = await getExercisePrefillFromGame(
      { userId: USER.id },
      { studyId: "study-other", gameId: "game-other", path: "" },
    );
    expect(prefill).toBeNull();
    expect(gameFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "game-other", databaseId: "study-other", database: { userId: USER.id } },
      }),
    );
  });

  it("una jugada que la partida no tiene, o un estudio que no es el de la partida, tampoco", async () => {
    expect(
      await getExercisePrefillFromGame(
        { userId: USER.id },
        { studyId: "study-own", gameId: "game-own", path: "0.0.9" },
      ),
    ).toBeNull();
    expect(
      await getExercisePrefillFromGame({ userId: USER.id }, { studyId: "study-other", gameId: "game-own", path: "" }),
    ).toBeNull();
  });
});
