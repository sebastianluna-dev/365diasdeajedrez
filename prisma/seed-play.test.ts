import { describe, expect, it } from "vitest";
import { botSeedOf } from "@/lib/chess/bots/roster";
import { gameEnd } from "@/lib/chess/game-end";
import { replayLiveGame } from "@/lib/chess/live-game";
import { outcomeFor } from "@/services/play/play-rules";
import { DEMO_PLAYED_GAMES, demoGameEnd } from "./seed-play";

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
