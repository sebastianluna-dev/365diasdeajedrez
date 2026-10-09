import type { PlayerAvatarData } from "@/lib/avatar-tone";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";
import type { BotView } from "@/services/bots/bots.types";

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
