import { describe, expect, it } from "vitest";
import { gamesOfPage, pageCountOf, pageOfGame } from "./study-games-page";

const games = Array.from({ length: 250 }, (_, index) => ({ id: `g${index + 1}` }));

describe("pageCountOf", () => {
  it("cuenta las páginas que hacen las partidas, y una para una lista vacía", () => {
    expect(pageCountOf(0, 100)).toBe(1);
    expect(pageCountOf(100, 100)).toBe(1);
    expect(pageCountOf(101, 100)).toBe(2);
    expect(pageCountOf(250, 100)).toBe(3);
  });
});

describe("pageOfGame", () => {
  it("dice en qué página cae la partida", () => {
    expect(pageOfGame(games, "g1", 100)).toBe(1);
    expect(pageOfGame(games, "g100", 100)).toBe(1);
    expect(pageOfGame(games, "g101", 100)).toBe(2);
    expect(pageOfGame(games, "g250", 100)).toBe(3);
  });

  it("responde la primera para una partida que no está en la lista", () => {
    expect(pageOfGame(games, "otra", 100)).toBe(1);
    expect(pageOfGame([], "g1", 100)).toBe(1);
  });
});

describe("gamesOfPage", () => {
  it("corta las partidas de la página", () => {
    expect(gamesOfPage(games, 1, 100).map((game) => game.id)).toEqual(games.slice(0, 100).map((game) => game.id));
    expect(gamesOfPage(games, 3, 100)).toHaveLength(50);
    expect(gamesOfPage(games, 3, 100)[0]).toEqual({ id: "g201" });
  });

  it("una página que no existe responde la más cercana, nunca una lista vacía", () => {
    expect(gamesOfPage(games, 9, 100)[0]).toEqual({ id: "g201" });
    expect(gamesOfPage(games, 0, 100)[0]).toEqual({ id: "g1" });
    expect(gamesOfPage(games, Number.NaN, 100)[0]).toEqual({ id: "g1" });
  });
});
