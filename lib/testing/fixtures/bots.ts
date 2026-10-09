import type { PlayerAvatarData } from "@/lib/avatar-tone";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import type { BotView } from "@/services/bots/bots.types";
import type { PlayedGameCard } from "@/services/play/play.types";

// Two invented characters and a student, for the stories and tests of «Jugar»:
// never a real player's name in a fixture (IMPROVEMENTS #106).

/** A portrait from a name and a seed, as the mappers build it. */
export function avatarOf(name: string, seed: string, extra: Partial<PlayerAvatarData> = {}): PlayerAvatarData {
  return { initials: initialsOf(name), tone: avatarToneOf(seed), ring: "NONE", country: null, ...extra };
}

export const FIXTURE_STUDENT = { name: "Ana Torres", avatar: avatarOf("Ana Torres", "ana-torres") };

export const FIXTURE_BOT = {
  slug: "don-chuy",
  name: "Don Chuy",
  elo: 783,
  avatar: avatarOf("Don Chuy", "don-chuy", { country: "MEX" }),
};

export const FIXTURE_STRONG_BOT = {
  slug: "el-ingeniero",
  name: "El Ingeniero",
  elo: 1868,
  avatar: avatarOf("El Ingeniero", "el-ingeniero", { country: "MEX" }),
};

/** Opera-like moves for a game in progress, the student with White. */
export const FIXTURE_SANS = ["e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6"];

/** A bot as «Jugar» shows it (`BotView`), for the lobby's stories. */
export function fixtureBotView(overrides: Partial<BotView> = {}): BotView {
  return {
    id: 4,
    slug: FIXTURE_BOT.slug,
    name: FIXTURE_BOT.name,
    elo: FIXTURE_BOT.elo,
    bio: "Juega en el parque los domingos. Ataca rápido y a veces se olvida de su rey.",
    openings: ["Apertura italiana"],
    fideElo: null,
    fideTitle: null,
    country: "MEX",
    ratingAsOfLabel: null,
    groupCode: "CHARACTERS",
    avatar: FIXTURE_BOT.avatar,
    ...overrides,
  };
}

/** An invented titled player of a national team, with the facts a real one's sheet carries. */
export const FIXTURE_TEAM_BOT = fixtureBotView({
  id: 20,
  slug: "valeria-montes",
  name: "Valeria Montes",
  elo: 2041,
  bio: "Seleccionada nacional. Prefiere las posiciones cerradas y las maniobras largas.",
  openings: ["Defensa francesa", "Sistema Londres"],
  fideElo: 2041,
  fideTitle: "WIM",
  ratingAsOfLabel: "1 de septiembre, 2026",
  groupCode: "MEXICO_WOMEN",
  avatar: avatarOf("Valeria Montes", "valeria-montes", { ring: "TRICOLOR", country: "MEX" }),
});

/** The person's games as a list shows them (`PlayedGameCard`): one open, one won, one lost, one drawn. */
export function fixturePlayedGames(now = new Date("2026-10-08T18:00:00Z")): PlayedGameCard[] {
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000);
  const rival = (name: string, slug: string, elo: number): PlayedGameCard["rival"] => ({
    kind: "bot",
    botId: 1,
    name,
    slug,
    elo,
    title: null,
    avatar: avatarOf(name, slug, { country: "MEX" }),
  });
  return [
    {
      id: "open0001",
      rival: rival("Beto", "beto", 547),
      color: "black",
      outcome: null,
      isOpen: true,
      terminationLabel: null,
      moves: 2,
      finalFen: "rnbqkbnr/pppp1ppp/8/4p3/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      at: hoursAgo(1),
    },
    {
      id: "win00001",
      rival: rival("Tere", "tere", 412),
      color: "white",
      outcome: "win",
      isOpen: false,
      terminationLabel: "Jaque mate",
      moves: 4,
      finalFen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
      at: hoursAgo(5),
    },
    {
      id: "loss0001",
      rival: rival("Don Chuy", "don-chuy", 783),
      color: "black",
      outcome: "loss",
      isOpen: false,
      terminationLabel: "Abandono",
      moves: 6,
      finalFen: "rn1qkbnr/ppp1pKpp/3p4/4N3/4P3/2N5/PPPP1PPP/R1Bb3R b kq - 0 6",
      at: hoursAgo(30),
    },
    {
      id: "draw0001",
      rival: rival("Mariana", "mariana", 891),
      color: "white",
      outcome: "draw",
      isOpen: false,
      terminationLabel: "Triple repetición",
      moves: 21,
      finalFen: "6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 21",
      at: hoursAgo(80),
    },
  ];
}
