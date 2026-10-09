import { describe, expect, it } from "vitest";
import { initialLiveGameState, liveGameReducer, type LiveGameEvent, type LiveGameState } from "./live-game-machine";

const run = (state: LiveGameState, ...events: LiveGameEvent[]) => events.reduce(liveGameReducer, state);

const asWhite = initialLiveGameState({ initialFen: null, sans: [], humanColor: "white", end: null });
const asBlack = initialLiveGameState({ initialFen: null, sans: [], humanColor: "black", end: null });

describe("liveGameReducer", () => {
  it("waits for the engine, then lets the person move when it is their turn", () => {
    expect(asWhite.status).toBe("booting");
    expect(run(asWhite, { type: "ENGINE_READY" }).status).toBe("human-turn");
  });

  it("starts on its own when the person plays Black: the bot moves first", () => {
    expect(run(asBlack, { type: "ENGINE_READY" }).status).toBe("bot-thinking");
  });

  it("goes person, save, bot, save, person", () => {
    let state = run(asWhite, { type: "ENGINE_READY" }, { type: "HUMAN_MOVE", san: "e4" });
    expect(state).toMatchObject({ status: "human-moved", sans: ["e4"], savedPly: 0 });
    state = run(state, { type: "SAVED", plyCount: 1, end: null });
    expect(state).toMatchObject({ status: "bot-thinking", savedPly: 1 });
    state = run(state, { type: "BOT_REPLY", san: "e5", generation: 0 });
    expect(state).toMatchObject({ status: "bot-moved", sans: ["e4", "e5"] });
    state = run(state, { type: "SAVED", plyCount: 2, end: null });
    expect(state).toMatchObject({ status: "human-turn", savedPly: 2 });
  });

  it("holds a bot reply that arrives before the person's move is saved, and plays it once saved", () => {
    let state = run(
      asWhite,
      { type: "ENGINE_READY" },
      { type: "HUMAN_MOVE", san: "d4" },
      { type: "BOT_REPLY", san: "d5", generation: 0 },
    );
    expect(state).toMatchObject({ status: "human-moved", sans: ["d4"], pendingBotSan: "d5" });
    state = run(state, { type: "SAVED", plyCount: 1, end: null });
    expect(state).toMatchObject({ status: "bot-moved", sans: ["d4", "d5"], pendingBotSan: null });
  });

  it("knows at once that the person's mate ended the game, and never waits for the bot", () => {
    const resumed = initialLiveGameState({
      initialFen: null,
      sans: ["f3", "e5", "g4"],
      humanColor: "black",
      end: null,
    });
    let state = run(resumed, { type: "ENGINE_READY" });
    expect(state.status).toBe("human-turn");
    state = run(state, { type: "HUMAN_MOVE", san: "Qh4#" });
    expect(state.status).toBe("human-moved");
    expect(state.end).toMatchObject({ kind: "checkmate", winner: "black" });
    expect(state.pendingBotSan).toBeNull();
    state = run(state, { type: "SAVED", plyCount: 4, end: state.end });
    expect(state.status).toBe("over");
  });

  it("ignores a move that is not legal, or out of turn", () => {
    const ready = run(asWhite, { type: "ENGINE_READY" });
    expect(run(ready, { type: "HUMAN_MOVE", san: "e5" })).toBe(ready);
    const thinking = run(asBlack, { type: "ENGINE_READY" });
    expect(run(thinking, { type: "HUMAN_MOVE", san: "e4" })).toBe(thinking);
  });

  it("stops at stale when another tab moved, and keeps the state on a throttled save", () => {
    const moved = run(asWhite, { type: "ENGINE_READY" }, { type: "HUMAN_MOVE", san: "e4" });
    expect(run(moved, { type: "SAVE_FAILED", reason: "stale" }).status).toBe("stale");
    expect(run(moved, { type: "SAVE_FAILED", reason: "throttled" })).toBe(moved);
  });

  it("drops a bot reply from before an abandon", () => {
    let state = run(asBlack, { type: "ENGINE_READY" }, { type: "ABANDON" });
    expect(state.generation).toBe(1);
    state = run(state, { type: "BOT_REPLY", san: "e4", generation: 0 });
    expect(state.sans).toEqual([]);
  });

  it("closes as the server says after an abandon", () => {
    const state = run(
      asWhite,
      { type: "ENGINE_READY" },
      { type: "ABANDON" },
      {
        type: "CLOSED",
        end: { kind: "resignation", winner: "black", resultCode: "BLACK_WINS", terminationCode: "RESIGNATION" },
      },
    );
    expect(state).toMatchObject({ status: "over", end: { kind: "resignation" } });
  });

  it("keeps every move when the engine fails mid-thought", () => {
    let state = run(
      asWhite,
      { type: "ENGINE_READY" },
      { type: "HUMAN_MOVE", san: "e4" },
      { type: "SAVED", plyCount: 1, end: null },
    );
    expect(state.status).toBe("bot-thinking");
    state = run(state, { type: "ENGINE_FAILED" });
    expect(state).toMatchObject({ status: "engine-failed", sans: ["e4"], savedPly: 1 });
  });

  it("starts over from what the server has on a reload, one generation later", () => {
    const stale = run(
      asWhite,
      { type: "ENGINE_READY" },
      { type: "HUMAN_MOVE", san: "e4" },
      { type: "SAVE_FAILED", reason: "stale" },
    );
    const reloaded = run(stale, {
      type: "RELOADED",
      game: { initialFen: null, sans: ["d4", "d5"], humanColor: "white", end: null },
    });
    expect(reloaded).toMatchObject({ status: "booting", sans: ["d4", "d5"], savedPly: 2, generation: 1 });
  });

  it("opens a finished game as over, and changes nothing after", () => {
    const end = { kind: "checkmate", winner: "black", resultCode: "BLACK_WINS", terminationCode: "CHECKMATE" } as const;
    const over = initialLiveGameState({ initialFen: null, sans: ["f3", "e5", "g4", "Qh4#"], humanColor: "white", end });
    expect(over.status).toBe("over");
    expect(run(over, { type: "ENGINE_READY" }, { type: "HUMAN_MOVE", san: "a3" })).toBe(over);
  });
});
