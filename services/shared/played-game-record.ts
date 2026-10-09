import { INITIAL_FEN } from "chessops/fen";
import {
  GAME_TERMINATION_LABELS,
  TIME_CONTROL_VALUES,
  type TimeControlCode,
} from "@/constants/platform/play-codes.const";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import type { GameEnd } from "@/lib/chess/game-end";
import { currentFen, toPgn } from "@/lib/chess/live-game";
import { extractMainline } from "@/lib/chess/mainline";
import { addMove, parseEditableGame, serializeGame } from "@/lib/chess/pgn-edit";
import { sameMoves } from "./game-record";

// THE ONLY WRITER of a played game's derived columns: `pgn`, `plyCount`,
// `finalFen`, `lastMoveAt`, `resultId`, `terminationId` and `finishedAt`
// (prisma/schema.prisma names it on each). It receives the client as its
// first parameter, so it runs inside the transaction of whoever writes, as
// `syncChapterDuration` does.
//
// A move and a close are an `updateMany` guarded by the ply the caller saw
// (`plyCount: expectedPly`) and by the game being open: `written: false` is
// «another tab got there first», never an exception that rolls back a
// legitimate write.

/** The minimum of Prisma this needs, so a transaction serves too. */
export interface PlayedGameWriter {
  playedGame: {
    create(args: unknown): Promise<{ id: string }>;
    findUnique(
      args: unknown,
    ): Promise<{ pgn: string; initialFen: string | null; plyCount: number; finishedAt: Date | null } | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  gameResult: { findUniqueOrThrow(args: unknown): Promise<{ id: number }> };
  gameTermination: { findUniqueOrThrow(args: unknown): Promise<{ id: number }> };
}

/** The seats and the facts of a new game. */
export interface PlayedGameCreateInput {
  whiteUserId?: string | null;
  whiteBotId?: number | null;
  blackUserId?: string | null;
  blackBotId?: number | null;
  whiteName: string;
  blackName: string;
  /** Each seat's strength when it was played. */
  whiteElo: number | null;
  blackElo: number | null;
  timeControlCode: TimeControlCode;
  initialFen: string | null;
  /** When it starts: the PGN's `Date`. */
  at: Date;
}

export type PlayedGameChange =
  | { kind: "create"; data: PlayedGameCreateInput }
  | { kind: "ply"; gameId: string; expectedPly: number; san: string; end: GameEnd | null; at: Date }
  | { kind: "close"; gameId: string; expectedPly: number; end: GameEnd; at: Date }
  | { kind: "annotate"; gameId: string; pgn: string };

/** The PGN token of each result. */
const RESULT_TOKEN: Record<GameResultCode, string> = {
  [GAME_RESULT.WHITE_WINS]: "1-0",
  [GAME_RESULT.BLACK_WINS]: "0-1",
  [GAME_RESULT.DRAW]: "1/2-1/2",
  [GAME_RESULT.ONGOING]: "*",
};

/** The `TimeControl` header: «-» without a clock, «180+2» with one (seconds + increment). */
export function timeControlHeader(code: TimeControlCode): string {
  const row = TIME_CONTROL_VALUES.find((value) => value.code === code);
  return row?.initialSeconds ? `${row.initialSeconds}+${row.incrementSeconds}` : "-";
}

/** `2026.10.08`, as a PGN's `Date` header writes a day. */
function pgnDate(at: Date): string {
  return at.toISOString().slice(0, 10).replaceAll("-", ".");
}

/** The PGN with these headers set, or replaced, keeping the rest and the moves. */
function withHeaders(pgn: string, headers: Record<string, string>): string {
  const game = parseEditableGame(pgn);
  if (!game) throw new Error("A played game's PGN does not parse");
  for (const [name, value] of Object.entries(headers)) game.headers.set(name, value);
  return serializeGame(game);
}

/** The PGN with one more move at the end of its main line. */
function withMove(pgn: string, san: string): string {
  const game = parseEditableGame(pgn);
  if (!game) throw new Error("A played game's PGN does not parse");
  let path = "";
  let node = game.moves;
  while (node.children[0]) {
    node = node.children[0];
    path = path ? `${path}.0` : "0";
  }
  if (!addMove(game, path, san)) throw new Error(`«${san}» is not legal at the end of the played game`);
  return serializeGame(game);
}

/** The PGN headers that say how a game ended. */
function endingHeaders(end: GameEnd): Record<string, string> {
  return { Result: RESULT_TOKEN[end.resultCode], Termination: GAME_TERMINATION_LABELS[end.terminationCode] };
}

/** The columns an ending writes, by id: `updateMany` cannot connect a relation. */
async function endingColumns(db: PlayedGameWriter, end: GameEnd, at: Date) {
  const [result, termination] = await Promise.all([
    db.gameResult.findUniqueOrThrow({ where: { code: end.resultCode }, select: { id: true } }),
    db.gameTermination.findUniqueOrThrow({ where: { code: end.terminationCode }, select: { id: true } }),
  ]);
  return { resultId: result.id, terminationId: termination.id, finishedAt: at };
}

export async function writePlayedGameRecord(
  db: PlayedGameWriter,
  change: PlayedGameChange,
): Promise<{ written: boolean; id: string }> {
  if (change.kind === "create") {
    const { data } = change;
    const pgn = toPgn(
      { initialFen: data.initialFen, sans: [] },
      {
        Event: "Partida en 365 días de ajedrez",
        Site: "365diasdeajedrez.com",
        Date: pgnDate(data.at),
        White: data.whiteName,
        Black: data.blackName,
        Result: "*",
        ...(data.whiteElo !== null ? { WhiteElo: String(data.whiteElo) } : {}),
        ...(data.blackElo !== null ? { BlackElo: String(data.blackElo) } : {}),
        TimeControl: timeControlHeader(data.timeControlCode),
      },
    );
    if (pgn === null) throw new Error("The starting position of a played game does not replay");
    const created = await db.playedGame.create({
      data: {
        ...(data.whiteUserId ? { whiteUser: { connect: { id: data.whiteUserId } } } : {}),
        ...(data.whiteBotId ? { whiteBot: { connect: { id: data.whiteBotId } } } : {}),
        ...(data.blackUserId ? { blackUser: { connect: { id: data.blackUserId } } } : {}),
        ...(data.blackBotId ? { blackBot: { connect: { id: data.blackBotId } } } : {}),
        whiteElo: data.whiteElo,
        blackElo: data.blackElo,
        timeControl: { connect: { code: data.timeControlCode } },
        result: { connect: { code: GAME_RESULT.ONGOING } },
        initialFen: data.initialFen,
        pgn,
        plyCount: 0,
        finalFen: data.initialFen ?? INITIAL_FEN,
        startedAt: data.at,
      },
      select: { id: true },
    });
    return { written: true, id: created.id };
  }

  const stored = await db.playedGame.findUnique({
    where: { id: change.gameId },
    select: { pgn: true, initialFen: true, plyCount: true, finishedAt: true },
  });
  if (!stored) return { written: false, id: change.gameId };

  if (change.kind === "annotate") {
    // The review's evaluations go in; not one move changes.
    if (!sameMoves(stored.pgn, change.pgn)) return { written: false, id: change.gameId };
    const { count } = await db.playedGame.updateMany({
      where: { id: change.gameId, finishedAt: { not: null } },
      data: { pgn: change.pgn },
    });
    return { written: count > 0, id: change.gameId };
  }

  // Behind or closed: nothing to build. The `updateMany` guard below still
  // covers a write that lands between this read and that write.
  if (stored.plyCount !== change.expectedPly || stored.finishedAt !== null) {
    return { written: false, id: change.gameId };
  }

  if (change.kind === "ply") {
    let pgn = withMove(stored.pgn, change.san);
    const sans = extractMainline(pgn)?.sans ?? [];
    const finalFen = currentFen({ initialFen: stored.initialFen, sans }) ?? INITIAL_FEN;
    if (change.end) pgn = withHeaders(pgn, endingHeaders(change.end));
    const { count } = await db.playedGame.updateMany({
      where: { id: change.gameId, plyCount: change.expectedPly, finishedAt: null },
      data: {
        pgn,
        plyCount: change.expectedPly + 1,
        finalFen,
        lastMoveAt: change.at,
        ...(change.end ? await endingColumns(db, change.end, change.at) : {}),
      },
    });
    return { written: count > 0, id: change.gameId };
  }

  const { count } = await db.playedGame.updateMany({
    where: { id: change.gameId, plyCount: change.expectedPly, finishedAt: null },
    data: {
      pgn: withHeaders(stored.pgn, endingHeaders(change.end)),
      ...(await endingColumns(db, change.end, change.at)),
    },
  });
  return { written: count > 0, id: change.gameId };
}
