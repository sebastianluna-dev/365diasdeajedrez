import { describe, expect, it } from "vitest";
import { playStatusOf } from "./play-status";

describe("playStatusOf", () => {
  it("tells the viewer what each state of the live game means for the board", () => {
    expect(playStatusOf({ status: "human-turn" })).toBe("your-turn");
    expect(playStatusOf({ status: "booting" })).toBe("thinking");
    expect(playStatusOf({ status: "human-moved" })).toBe("thinking");
    expect(playStatusOf({ status: "bot-thinking" })).toBe("thinking");
    expect(playStatusOf({ status: "bot-moved" })).toBe("saving");
    expect(playStatusOf({ status: "over" })).toBe("over");
    expect(playStatusOf({ status: "stale" })).toBe("halted");
    expect(playStatusOf({ status: "engine-failed" })).toBe("halted");
  });
});
