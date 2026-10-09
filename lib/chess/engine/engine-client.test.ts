import { afterEach, describe, expect, it, vi } from "vitest";
import { createScriptedEngine, settle } from "@/lib/testing/scripted-engine";
import {
  createEngineClient,
  EngineError,
  goCommand,
  optionCommands,
  positionCommand,
  searchTimeoutMs,
} from "./engine-client";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

afterEach(() => {
  vi.useRealTimers();
});

describe("the commands", () => {
  it("writes a position from the start or from a FEN, with the moves played", () => {
    expect(positionCommand(null)).toBe("position startpos");
    expect(positionCommand(null, ["e2e4", "e7e5"])).toBe("position startpos moves e2e4 e7e5");
    expect(positionCommand(START, ["e2e4"])).toBe(`position fen ${START} moves e2e4`);
  });

  it("writes a budget by depth, by nodes, or both, and only the module's by time", () => {
    expect(goCommand({ depth: 7 })).toBe("go depth 7");
    expect(goCommand({ nodes: 15000 })).toBe("go nodes 15000");
    expect(goCommand({ depth: 11, nodes: 400000 })).toBe("go depth 11 nodes 400000");
    expect(goCommand({ movetime: 300 })).toBe("go movetime 300");
  });

  it("names every option the way the engine knows it", () => {
    expect(optionCommands({ hash: 16, multiPv: 8, limitStrength: false, skillLevel: 20 })).toEqual([
      "setoption name Hash value 16",
      "setoption name MultiPV value 8",
      "setoption name UCI_LimitStrength value false",
      "setoption name Skill Level value 20",
    ]);
    expect(optionCommands({ limitStrength: true, uciElo: 1447, showWdl: true })).toEqual([
      "setoption name UCI_LimitStrength value true",
      "setoption name UCI_Elo value 1447",
      "setoption name UCI_ShowWDL value true",
    ]);
  });

  it("gives a search four times what it should take on a slow phone, never under five seconds", () => {
    expect(searchTimeoutMs({ nodes: 1500 })).toBe(5000);
    expect(searchTimeoutMs({ nodes: 400_000 })).toBe(16_000);
    expect(searchTimeoutMs({ movetime: 300 })).toBe(5000);
    expect(searchTimeoutMs({ depth: 16 })).toBe(20_000);
  });
});

describe("createEngineClient", () => {
  it("asks nothing before readyok, and never sends UCI_AnalyseMode", async () => {
    const engine = createScriptedEngine((command) => (command === "isready" ? [] : undefined));
    const client = createEngineClient(engine);
    const reply = client.bestMove({ fen: null, moves: [], search: { depth: 1 } });
    await settle();
    expect(engine.sent).toEqual(["uci", "isready"]);

    engine.emit("readyok");
    expect(engine.sent).toEqual(["uci", "isready", "position startpos", "go depth 1"]);
    engine.emit("info depth 1 seldepth 1 multipv 1 score cp 30 nodes 20 pv e2e4", "bestmove e2e4 ponder e7e5");
    await expect(reply).resolves.toMatchObject({ bestMove: "e2e4" });
    expect(engine.sent.some((command) => command.includes("UCI_AnalyseMode"))).toBe(false);
  });

  it("answers a move with the candidates of the last complete iteration", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const reply = client.bestMove({ fen: START, moves: [], search: { nodes: 1000 } });
    engine.emit(
      "info depth 2 multipv 1 score cp 40 nodes 300 pv e2e4",
      "info depth 2 multipv 2 score cp 25 nodes 300 pv d2d4",
      "info depth 3 multipv 1 score cp 35 nodes 900 pv e2e4",
      "info depth 3 multipv 2 score cp 30 lowerbound nodes 1000 pv d2d4",
      "bestmove e2e4",
    );
    const { candidates } = await reply;
    expect(candidates.map((candidate) => [candidate.uci, candidate.depth])).toEqual([
      ["e2e4", 2],
      ["d2d4", 2],
    ]);
  });

  it("does not send a position while a search is running: the next one waits for bestmove", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const first = client.bestMove({ fen: START, moves: [], search: { depth: 5 } });
    const second = client.bestMove({ fen: AFTER_E4, moves: [], search: { depth: 5 } });
    expect(engine.sent.filter((command) => command.startsWith("position"))).toHaveLength(1);

    engine.emit("bestmove e2e4");
    await expect(first).resolves.toMatchObject({ bestMove: "e2e4" });
    expect(engine.sent.slice(-2)).toEqual([`position fen ${AFTER_E4}`, "go depth 5"]);
    engine.emit("bestmove e7e5");
    await expect(second).resolves.toMatchObject({ bestMove: "e7e5" });
  });

  it("starts a new game mid-search with exactly stop, then bestmove, then ucinewgame and isready", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    void client.bestMove({ fen: START, moves: [], search: { nodes: 10_000 } });
    const before = engine.sent.length;

    const newGame = client.newGame();
    expect(engine.sent.slice(before)).toEqual(["stop"]);
    engine.emit("bestmove e2e4");
    expect(engine.sent.slice(before)).toEqual(["stop", "ucinewgame", "isready"]);
    await newGame;
  });

  it("sends options only in idle, each followed by isready", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    void client.bestMove({ fen: START, moves: [], search: { depth: 4 } });
    const options = client.setOptions({ uciElo: 1447, limitStrength: true });
    expect(engine.sent.at(-1)).toBe("stop");
    expect(engine.sent.some((command) => command.startsWith("setoption"))).toBe(false);

    engine.emit("bestmove e2e4");
    expect(engine.sent.slice(-3)).toEqual([
      "setoption name UCI_LimitStrength value true",
      "setoption name UCI_Elo value 1447",
      "isready",
    ]);
    await options;
  });

  it("replaces a running analysis: stop, wait, then the newer position; the old one says nothing more", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const seen: string[] = [];
    client.analyse({ fen: START, depth: 20 }, (info) => seen.push(`start:${info.pv[0]}`));
    client.analyse({ fen: AFTER_E4, depth: 20 }, (info) => seen.push(`e4:${info.pv[0]}`));
    expect(engine.sent.at(-1)).toBe("stop");

    engine.emit("info depth 9 multipv 1 score cp 30 nodes 900 pv d2d4");
    engine.emit("bestmove d2d4");
    expect(engine.sent.slice(-2)).toEqual([`position fen ${AFTER_E4}`, "go depth 20"]);
    engine.emit("info depth 9 multipv 1 score cp -30 nodes 900 pv e7e5");
    expect(seen).toEqual(["start:d2d4", "e4:e7e5"]);
  });

  it("lets an analysis give way to a move asked for", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    client.analyse({ fen: START, depth: 20 }, () => {});
    const reply = client.bestMove({ fen: AFTER_E4, moves: [], search: { movetime: 300 } });
    expect(engine.sent.at(-1)).toBe("stop");
    engine.emit("bestmove e2e4");
    expect(engine.sent.slice(-2)).toEqual([`position fen ${AFTER_E4}`, "go movetime 300"]);
    engine.emit("bestmove e7e5");
    await expect(reply).resolves.toMatchObject({ bestMove: "e7e5" });
  });

  it("rejects everything pending when the engine dies, and every later request", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const first = client.bestMove({ fen: START, moves: [], search: { depth: 8 } });
    const queued = client.newGame();
    engine.die("RuntimeError: unreachable");

    await expect(first).rejects.toMatchObject({ reason: "failed" });
    await expect(queued).rejects.toBeInstanceOf(EngineError);
    await expect(client.bestMove({ fen: START, moves: [], search: { depth: 1 } })).rejects.toMatchObject({
      reason: "failed",
    });
    expect(engine.terminated).toBe(true);
  });

  it("rejects the boot when the engine dies before readyok", async () => {
    const engine = createScriptedEngine((command) => (command === "isready" ? [] : undefined));
    const client = createEngineClient(engine);
    engine.die();
    await expect(client.ready()).rejects.toMatchObject({ reason: "failed" });
  });

  it("takes for dead a search that never answers", async () => {
    vi.useFakeTimers();
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await vi.advanceTimersByTimeAsync(0);
    await client.ready();
    const reply = client.bestMove({ fen: START, moves: [], search: { nodes: 1500 } });
    const settled = expect(reply).rejects.toMatchObject({ reason: "timeout" });
    await vi.advanceTimersByTimeAsync(5_001);
    await settled;
    expect(engine.terminated).toBe(true);
  });

  it("rejects what is pending when terminated", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const reply = client.bestMove({ fen: START, moves: [], search: { depth: 3 } });
    client.terminate();
    await expect(reply).rejects.toMatchObject({ reason: "terminated" });
    expect(engine.terminated).toBe(true);
  });

  it("answers a position with no move with a null bestmove and no candidates", async () => {
    const engine = createScriptedEngine();
    const client = createEngineClient(engine);
    await client.ready();
    const mated = "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
    const reply = client.bestMove({ fen: mated, moves: [], search: { depth: 4 } });
    engine.emit("info depth 0 score mate 0", "bestmove (none)");
    await expect(reply).resolves.toEqual({ bestMove: null, candidates: [] });
  });
});
