import { describe, expect, it } from "vitest";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { adventureBotSlug, adventureOf } from "@/lib/adventure/adventures";
import type { OpenGameSummary } from "@/services/play/play.types";
import { encounterStatesOf } from "./adventure-rules";
import { adventureGamesOf, progressView, type AdventureGameRow } from "./adventure.mapper";

const ADVENTURE = adventureOf("cuaderno-del-viajero")!;
const slugOf = (encounter: string) => adventureBotSlug(ADVENTURE.slug, encounter);

/** A finished game of `ana` against a bot, as the query selects it. */
function row(
  bot: string,
  seat: "white" | "black",
  result: "WHITE_WINS" | "BLACK_WINS" | "DRAW" | "ONGOING",
  minute = 1,
) {
  const botSide = { slug: bot };
  return {
    whiteUserId: seat === "white" ? "ana" : null,
    blackUserId: seat === "black" ? "ana" : null,
    whiteBotId: seat === "white" ? null : 7,
    blackBotId: seat === "white" ? 7 : null,
    whiteElo: seat === "white" ? null : 412,
    blackElo: seat === "white" ? 412 : null,
    finishedAt: new Date(minute * 60_000),
    result: { code: result },
    whiteBot: seat === "white" ? null : botSide,
    blackBot: seat === "white" ? botSide : null,
  } satisfies AdventureGameRow;
}

describe("adventureGamesOf", () => {
  it("ties each game to the encounter of its bot, with the seat the person held", () => {
    const games = adventureGamesOf(
      [row(slugOf("don-chema"), "white", GAME_RESULT.WHITE_WINS), row(slugOf("chayo-rios"), "black", GAME_RESULT.DRAW)],
      "ana",
      ADVENTURE,
    );
    expect(games.map((game) => [game.order, game.seat, game.resultCode])).toEqual([
      [1, "white", "WHITE_WINS"],
      [2, "black", "DRAW"],
    ]);
  });

  it("leaves out a game against a bot that is not one of the adventure's rivals", () => {
    expect(adventureGamesOf([row("tere", "white", GAME_RESULT.WHITE_WINS)], "ana", ADVENTURE)).toEqual([]);
  });
});

describe("progressView", () => {
  const states = encounterStatesOf(
    ADVENTURE.encounters,
    adventureGamesOf(
      [
        row(slugOf("don-chema"), "white", GAME_RESULT.WHITE_WINS, 1),
        row(slugOf("chayo-rios"), "white", GAME_RESULT.BLACK_WINS, 2),
        row(slugOf("chayo-rios"), "white", GAME_RESULT.WHITE_WINS, 3),
      ],
      "ana",
      ADVENTURE,
    ),
  );

  it("puts the content and the progress of all twelve encounters together", () => {
    const view = progressView(ADVENTURE, states, null);
    expect(view.encounters).toHaveLength(12);
    expect(view.total).toBe(12);
    expect(view.beaten).toBe(2);
    expect(view.stars).toBe(5);
    expect(view.isComplete).toBe(false);
    expect(view.current?.slug).toBe("profe-leal");
    expect(view.encounters[0]).toMatchObject({
      order: 1,
      state: "beaten",
      stars: 3,
      botSlug: "cuaderno-del-viajero-don-chema",
      zoneName: "Plaza de las Jacarandas",
      elo: 412,
      difficultyLabel: "Fácil",
    });
    expect(view.encounters[11]).toMatchObject({ isFinal: true, state: "locked", elo: 1309 });
  });

  it("says which encounter an open game plays, when it is one of this adventure's", () => {
    const open = (slug: string): OpenGameSummary => ({
      id: "g1",
      color: "white",
      plyCount: 4,
      rival: { slug } as OpenGameSummary["rival"],
    });
    expect(progressView(ADVENTURE, states, open(slugOf("profe-leal"))).openGameEncounter).toBe(3);
    expect(progressView(ADVENTURE, states, open("tere")).openGameEncounter).toBeNull();
    expect(progressView(ADVENTURE, states, null).openGameEncounter).toBeNull();
  });
});
