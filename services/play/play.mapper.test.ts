import { describe, expect, it } from "vitest";
import { BOT_GROUP } from "@/constants/platform/play-codes.const";
import { adventureOfGame } from "./play.mapper";

const bot = (slug: string, code: string) => ({ slug, group: { code } });

describe("adventureOfGame", () => {
  it("derives the adventure and the encounter from the group of the bot across the board", () => {
    const adventure = adventureOfGame({
      whiteBot: null,
      blackBot: bot("cuaderno-del-viajero-anselmo-quiroga", BOT_GROUP.ADVENTURE_CUADERNO),
    } as Parameters<typeof adventureOfGame>[0]);
    expect(adventure).toEqual({
      slug: "cuaderno-del-viajero",
      title: "El cuaderno del viajero",
      encounter: {
        order: 5,
        name: "Anselmo Quiroga",
        role: "El bibliotecario",
        place: "Sala de lectura",
        zoneName: "Biblioteca Central",
        isFinal: false,
      },
    });
  });

  it("marks the last page, and works with the bot on the white side too", () => {
    const adventure = adventureOfGame({
      whiteBot: bot("cuaderno-del-viajero-julian-esparza", BOT_GROUP.ADVENTURE_CUADERNO),
      blackBot: null,
    } as Parameters<typeof adventureOfGame>[0]);
    expect(adventure?.encounter).toMatchObject({ order: 12, isFinal: true });
  });

  it("is null for a gallery bot, for a game between people and for a gallery slug in the hidden group", () => {
    expect(
      adventureOfGame({ whiteBot: bot("tere", BOT_GROUP.CHARACTERS), blackBot: null } as Parameters<
        typeof adventureOfGame
      >[0]),
    ).toBeNull();
    expect(adventureOfGame({ whiteBot: null, blackBot: null })).toBeNull();
    expect(
      adventureOfGame({ whiteBot: bot("tere", BOT_GROUP.ADVENTURE_CUADERNO), blackBot: null } as Parameters<
        typeof adventureOfGame
      >[0]),
    ).toBeNull();
  });
});
