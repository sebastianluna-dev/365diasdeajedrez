import { describe, expect, it } from "vitest";
import { closedEnd, gameEnd, resignationEnd } from "@/lib/chess/game-end";
import type { PlayedSeat } from "@/services/play/play.types";
import { endingOf, liveGamePlayers } from "./live-game-players";

const avatar = { initials: "X", tone: 1, ring: "NONE", country: null } as const;
const ANA: PlayedSeat = { kind: "user", botId: null, name: "Ana", slug: "ana", elo: null, avatar, title: null };
const CHUY: PlayedSeat = { kind: "bot", botId: 4, name: "Don Chuy", slug: "don-chuy", elo: 783, avatar, title: null };
const game = { white: ANA, black: CHUY, viewerSeat: "white" as const };

describe("liveGamePlayers", () => {
  it("lights the person's dot and says «Te toca mover» on their turn", () => {
    const { white, black } = liveGamePlayers(game, { status: "human-turn", initialFen: null, sans: [], end: null });
    expect(white).toMatchObject({ turn: true, status: "Te toca mover" });
    expect(black).toMatchObject({ turn: false, status: undefined, elo: 783, avatar: { busy: false } });
  });

  it("turns the bot's arc and says «Pensando…» while it searches", () => {
    const { black } = liveGamePlayers(game, { status: "bot-thinking", initialFen: null, sans: ["e4"], end: null });
    expect(black).toMatchObject({ turn: true, status: "Pensando…", avatar: { busy: true } });
  });

  it("says who won once it is over, «Ganaste» on the viewer's own strip", () => {
    const sans = ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"];
    const { white, black } = liveGamePlayers(game, {
      status: "over",
      initialFen: null,
      sans,
      end: gameEnd(null, sans),
    });
    expect(white).toMatchObject({
      turn: undefined,
      ending: { kind: "win", label: "Ganaste", reason: "por jaque mate" },
    });
    expect(black.ending).toEqual({ kind: "loss", label: "Perdió", reason: "por jaque mate" });
  });

  it("reads a game as somebody else: «Ganó», never «Ganaste»", () => {
    const reader = { ...game, viewerSeat: null };
    const { black } = liveGamePlayers(reader, {
      status: "over",
      initialFen: null,
      sans: [],
      end: resignationEnd("white"),
    });
    expect(black.ending).toMatchObject({ label: "Ganó", reason: "por abandono" });
  });
});

describe("endingOf", () => {
  it("draws nothing for a cancelled game", () => {
    expect(endingOf(closedEnd("aborted", null), "white", true)).toBeUndefined();
  });
});
