import { describe, expect, it } from "vitest";
import type { BotGroupView, BotView } from "./bots.types";
import { eloSpanOf, suggestedBot } from "./bot-rules";

const bot = (id: number, elo: number): BotView => ({
  id,
  slug: `bot-${id}`,
  name: `Bot ${id}`,
  elo,
  bio: "",
  openings: [],
  fideElo: null,
  fideTitle: null,
  country: null,
  ratingAsOfLabel: null,
  groupCode: "CHARACTERS",
  avatar: { initials: "B", tone: 1, ring: "NONE", country: null },
});

const GROUPS: BotGroupView[] = [
  { code: "CHARACTERS", label: "Personajes", bots: [bot(1, 412), bot(2, 547), bot(3, 668)] },
  { code: "ACTIVE", label: "En activo", bots: [bot(9, 2798)] },
];
const score = (botId: number, wins: number, draws = 0) => ({ botId, wins, losses: 0, draws, open: 0 });

describe("suggestedBot", () => {
  it("starts with the weakest bot", () => {
    expect(suggestedBot(GROUPS, [])).toEqual({ bot: GROUPS[0]!.bots[0], after: null });
  });

  it("suggests the first bot above the strongest one beaten, across groups", () => {
    expect(suggestedBot(GROUPS, [score(1, 1), score(2, 2)])?.bot.id).toBe(3);
    expect(suggestedBot(GROUPS, [score(3, 1)])).toMatchObject({ bot: { id: 9 }, after: { id: 3 } });
  });

  it("does not move on a draw, and stays on the strongest once all are beaten", () => {
    expect(suggestedBot(GROUPS, [score(1, 0, 3)])?.bot.id).toBe(1);
    expect(suggestedBot(GROUPS, [score(9, 1)])?.bot.id).toBe(9);
  });

  it("has nothing to suggest without bots", () => {
    expect(suggestedBot([], [])).toBeNull();
  });
});

describe("eloSpanOf", () => {
  it("says a group's span of labels", () => {
    expect(eloSpanOf(GROUPS[0]!)).toBe("De 412 a 668");
    expect(eloSpanOf(GROUPS[1]!)).toBe("2798");
  });
});
