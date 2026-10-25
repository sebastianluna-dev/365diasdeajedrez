import { describe, expect, it } from "vitest";
import { fixtureBotView } from "@/lib/testing/fixtures/bots";
import { botRecordsOf } from "./profile.mapper";

describe("botRecordsOf", () => {
  it("names each score by its bot, in the bots' order, and leaves out a score whose bot is gone", () => {
    const beto = fixtureBotView({ id: 1, slug: "beto", name: "Beto", elo: 547 });
    const chuy = fixtureBotView({ id: 4 });
    const records = botRecordsOf(
      [
        { botId: 4, wins: 3, losses: 2, draws: 1, open: 0 },
        { botId: 1, wins: 4, losses: 0, draws: 0, open: 1 },
        { botId: 9, wins: 1, losses: 0, draws: 0, open: 0 },
      ],
      [beto, chuy],
    );
    expect(records.map((record) => [record.name, record.elo, record.wins, record.open])).toEqual([
      ["Beto", 547, 4, 1],
      ["Don Chuy", 783, 3, 0],
    ]);
  });
});
