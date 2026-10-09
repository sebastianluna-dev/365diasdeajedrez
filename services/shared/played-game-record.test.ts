import { describe, expect, it } from "vitest";
import { closedEnd, gameEnd, resignationEnd } from "@/lib/chess/game-end";
import { extractMainline } from "@/lib/chess/mainline";
import { timeControlHeader, writePlayedGameRecord, type PlayedGameWriter } from "./played-game-record";

interface Row {
  id: string;
  pgn: string;
  initialFen: string | null;
  plyCount: number;
  finalFen: string;
  lastMoveAt: Date | null;
  resultId: number | null;
  terminationId: number | null;
  finishedAt: Date | null;
  data: Record<string, unknown>;
}

const RESULT_IDS: Record<string, number> = { WHITE_WINS: 1, BLACK_WINS: 2, DRAW: 3, ONGOING: 4 };
const TERMINATION_IDS: Record<string, number> = { CHECKMATE: 11, RESIGNATION: 16, ABANDONED: 17, ABORTED: 18 };

/** A writer that keeps one table in memory and applies the guards as Postgres would. */
function memoryWriter(): PlayedGameWriter & { rows: Map<string, Row> } {
  const rows = new Map<string, Row>();
  let next = 0;
  return {
    rows,
    playedGame: {
      async create(args) {
        const data = (args as { data: Record<string, unknown> }).data;
        const id = `game${++next}`;
        rows.set(id, {
          id,
          pgn: data.pgn as string,
          initialFen: (data.initialFen as string | null) ?? null,
          plyCount: data.plyCount as number,
          finalFen: data.finalFen as string,
          lastMoveAt: null,
          resultId: RESULT_IDS.ONGOING!,
          terminationId: null,
          finishedAt: null,
          data,
        });
        return { id };
      },
      async findUnique(args) {
        const row = rows.get((args as { where: { id: string } }).where.id);
        return row
          ? { pgn: row.pgn, initialFen: row.initialFen, plyCount: row.plyCount, finishedAt: row.finishedAt }
          : null;
      },
      async updateMany(args) {
        const { where, data } = args as { where: Record<string, unknown>; data: Partial<Row> };
        const row = rows.get(where.id as string);
        if (!row) return { count: 0 };
        if ("plyCount" in where && row.plyCount !== where.plyCount) return { count: 0 };
        if (where.finishedAt === null && row.finishedAt !== null) return { count: 0 };
        if (where.finishedAt && row.finishedAt === null) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
    },
    gameResult: {
      async findUniqueOrThrow(args) {
        return { id: RESULT_IDS[(args as { where: { code: string } }).where.code]! };
      },
    },
    gameTermination: {
      async findUniqueOrThrow(args) {
        return { id: TERMINATION_IDS[(args as { where: { code: string } }).where.code]! };
      },
    },
  };
}

const AT = new Date("2026-10-08T18:00:00Z");

async function newGame(db: ReturnType<typeof memoryWriter>) {
  const { id } = await writePlayedGameRecord(db, {
    kind: "create",
    data: {
      whiteUserId: "ana",
      blackBotId: 4,
      whiteName: "Ana Torres",
      blackName: "Don Chuy",
      whiteElo: null,
      blackElo: 783,
      timeControlCode: "NONE",
      initialFen: null,
      at: AT,
    },
  });
  return id;
}

describe("writePlayedGameRecord", () => {
  it("creates a game with its headers, no moves, open and without a result", async () => {
    const db = memoryWriter();
    const id = await newGame(db);
    const row = db.rows.get(id)!;
    expect(row.plyCount).toBe(0);
    expect(row.finishedAt).toBeNull();
    expect(row.finalFen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    for (const header of [
      '[White "Ana Torres"]',
      '[Black "Don Chuy"]',
      '[BlackElo "783"]',
      '[Result "*"]',
      '[TimeControl "-"]',
      '[Date "2026.10.08"]',
    ]) {
      expect(row.pgn).toContain(header);
    }
    expect(row.pgn).not.toContain("WhiteElo");
  });

  it("adds a ply guarded by the ply the caller saw, and moves the board and the clock of the last move", async () => {
    const db = memoryWriter();
    const id = await newGame(db);
    expect(
      await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: 0, san: "e4", end: null, at: AT }),
    ).toEqual({ written: true, id });
    const row = db.rows.get(id)!;
    expect(row.plyCount).toBe(1);
    expect(extractMainline(row.pgn)?.sans).toEqual(["e4"]);
    expect(row.finalFen).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    expect(row.lastMoveAt).toEqual(AT);
  });

  it("writes nothing when another tab got there first", async () => {
    const db = memoryWriter();
    const id = await newGame(db);
    await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: 0, san: "e4", end: null, at: AT });
    expect(
      await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: 0, san: "d4", end: null, at: AT }),
    ).toEqual({ written: false, id });
    expect(db.rows.get(id)!.plyCount).toBe(1);
  });

  it("closes the game on the move that ends it, with its result and termination", async () => {
    const db = memoryWriter();
    const id = await newGame(db);
    const sans = ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"];
    for (const [ply, san] of sans.entries()) {
      const end = gameEnd(null, sans.slice(0, ply + 1));
      await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: ply, san, end, at: AT });
    }
    const row = db.rows.get(id)!;
    expect(row.finishedAt).toEqual(AT);
    expect(row.resultId).toBe(RESULT_IDS.WHITE_WINS);
    expect(row.terminationId).toBe(TERMINATION_IDS.CHECKMATE);
    expect(row.pgn).toContain('[Result "1-0"]');
    expect(row.pgn).toContain('[Termination "Jaque mate"]');
    expect(row.pgn).toMatch(/Qxf7# 1-0/);
    // Closed: no more moves.
    expect(
      await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: 7, san: "Ke7", end: null, at: AT }),
    ).toMatchObject({ written: false });
  });

  it("closes on a resignation, and an aborted game keeps no result", async () => {
    const db = memoryWriter();
    const resigned = await newGame(db);
    await writePlayedGameRecord(db, {
      kind: "close",
      gameId: resigned,
      expectedPly: 0,
      end: resignationEnd("white"),
      at: AT,
    });
    expect(db.rows.get(resigned)).toMatchObject({
      resultId: RESULT_IDS.BLACK_WINS,
      terminationId: TERMINATION_IDS.RESIGNATION,
      finishedAt: AT,
    });

    const aborted = await newGame(db);
    await writePlayedGameRecord(db, {
      kind: "close",
      gameId: aborted,
      expectedPly: 0,
      end: closedEnd("aborted", null),
      at: AT,
    });
    expect(db.rows.get(aborted)).toMatchObject({
      resultId: RESULT_IDS.ONGOING,
      terminationId: TERMINATION_IDS.ABORTED,
    });
    expect(db.rows.get(aborted)!.pgn).toContain('[Result "*"]');
  });

  it("annotates a finished game only when not one move changes", async () => {
    const db = memoryWriter();
    const id = await newGame(db);
    await writePlayedGameRecord(db, { kind: "ply", gameId: id, expectedPly: 0, san: "e4", end: null, at: AT });
    await writePlayedGameRecord(db, {
      kind: "close",
      gameId: id,
      expectedPly: 1,
      end: resignationEnd("black"),
      at: AT,
    });
    const stored = db.rows.get(id)!.pgn;
    const annotated = stored.replace("1. e4", "1. e4 { [%eval 0.3] }");
    expect(await writePlayedGameRecord(db, { kind: "annotate", gameId: id, pgn: annotated })).toMatchObject({
      written: true,
    });
    expect(
      await writePlayedGameRecord(db, { kind: "annotate", gameId: id, pgn: stored.replace("1. e4", "1. d4") }),
    ).toMatchObject({ written: false });
  });
});

describe("timeControlHeader", () => {
  it("writes «-» without a clock and seconds plus increment with one", () => {
    expect(timeControlHeader("NONE")).toBe("-");
    expect(timeControlHeader("BLITZ_3_2")).toBe("180+2");
  });
});
