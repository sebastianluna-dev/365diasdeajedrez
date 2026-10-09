import type { BotRingCode } from "@/constants/platform/play-codes.const";

// A portrait without a picture: initials on one of six tones, the same for a
// bot or a person on every screen, because the tone comes from a stable seed
// (the slug). Pure module; the tones themselves are CSS tokens
// (`--platform-avatar-1` … `-6`), never colours here.

export type AvatarTone = 1 | 2 | 3 | 4 | 5 | 6;

/** What a portrait needs: initials, a tone, a ring and, maybe, a flag. */
export interface PlayerAvatarData {
  initials: string;
  tone: AvatarTone;
  ring: BotRingCode;
  /** FIDE's three-letter code, for the flag in a corner. */
  country: string | null;
}

/** One of the six tones from a seed (FNV-1a), stable across screens and sessions. */
export function avatarToneOf(seed: string): AvatarTone {
  let hash = 0x811c9dc5;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (((hash >>> 0) % 6) + 1) as AvatarTone;
}

/**
 * Up to two initials, from the words that start with a letter: «Don Chuy» →
 * «DC», «Gukesh D» → «GD», «Sofía» → «S». A name without letters gives «?».
 */
export function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => Boolean(letter));
  if (letters.length === 0) return "?";
  const pair = letters.length === 1 ? letters : [letters[0]!, letters[letters.length - 1]!];
  return pair.join("").toLocaleUpperCase("es");
}
