import { describe, expect, it } from "vitest";
import { BOT_GROUP } from "@/constants/platform/play-codes.const";
import { allBotSeeds } from "@/lib/adventure/adventure-bots";
import { botSeedOf } from "@/lib/chess/bots/roster";
import { gameEnd } from "@/lib/chess/game-end";
import { replayLiveGame } from "@/lib/chess/live-game";
import { outcomeFor } from "@/services/play/play-rules";
import { DEMO_ADVENTURE_GAMES, DEMO_PLAYED_GAMES, demoGameEnd } from "./seed-play";

describe("DEMO_PLAYED_GAMES", () => {
  it("plays bots of the roster, with legal moves", () => {
    for (const game of DEMO_PLAYED_GAMES) {
      expect(botSeedOf(game.bot), game.bot).toBeDefined();
      expect(replayLiveGame({ initialFen: null, sans: game.sans }), game.bot).not.toBeNull();
    }
  });

  it("ends each game as it says: by the board, by a resignation before the board ends it, or not at all", () => {
    for (const game of DEMO_PLAYED_GAMES) {
      if (game.ending === "board") expect(gameEnd(null, game.sans), game.bot).not.toBeNull();
      else expect(gameEnd(null, game.sans), game.bot).toBeNull();
    }
  });

  it("leaves the student one win, one loss and a single open game on their turn", () => {
    const outcomes = DEMO_PLAYED_GAMES.map((game) => {
      const end = demoGameEnd(game);
      return end ? outcomeFor(end.resultCode, game.seat) : "open";
    });
    expect(outcomes.sort()).toEqual(["loss", "open", "win"]);

    const open = DEMO_PLAYED_GAMES.filter((game) => game.ending === "open");
    expect(open).toHaveLength(1);
    const toMove = open[0]!.sans.length % 2 === 0 ? "white" : "black";
    expect(toMove).toBe(open[0]!.seat);
    expect(demoGameEnd(open[0]!)).toBeNull();
  });
});

describe("DEMO_ADVENTURE_GAMES", () => {
  const rivals = allBotSeeds().filter((bot) => bot.group === BOT_GROUP.ADVENTURE_CUADERNO);

  it("plays the adventure's rivals, with legal moves, the oldest first", () => {
    expect(DEMO_ADVENTURE_GAMES).toHaveLength(9);
    for (const game of DEMO_ADVENTURE_GAMES) {
      expect(
        rivals.some((rival) => rival.slug === game.bot),
        game.bot,
      ).toBe(true);
      expect(replayLiveGame({ initialFen: null, sans: game.sans }), game.bot).not.toBeNull();
    }
    const ages = DEMO_ADVENTURE_GAMES.map((game) => game.daysAgo);
    expect(ages).toEqual([...ages].sort((a, b) => b - a));
    expect(new Set(ages).size).toBe(ages.length);
  });

  it("ends every game, none of them open, so the student's open game stays the one in the gallery", () => {
    for (const game of DEMO_ADVENTURE_GAMES) {
      expect(game.ending, game.bot).not.toBe("open");
      expect(demoGameEnd(game), game.bot).not.toBeNull();
    }
  });

  it("leaves four wins and five losses", () => {
    const outcomes = DEMO_ADVENTURE_GAMES.map((game) => outcomeFor(demoGameEnd(game)!.resultCode, game.seat));
    expect(outcomes.filter((outcome) => outcome === "win")).toHaveLength(4);
    expect(outcomes.filter((outcome) => outcome === "loss")).toHaveLength(5);
  });
});
