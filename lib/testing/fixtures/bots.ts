import type { PlayerAvatarData } from "@/lib/avatar-tone";
import { avatarToneOf, initialsOf } from "@/lib/avatar-tone";

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
