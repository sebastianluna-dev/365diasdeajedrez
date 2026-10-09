import type { PlayerAvatarData } from "@/lib/avatar-tone";
import { federationFlag } from "@/lib/chess/federations";
import "./player-avatar.comp.css";

interface PlayerAvatarProps extends PlayerAvatarData {
  /** `sm` 28px (a row), `md` 40px (a strip), `lg` 56px (a card), `xl` 120px and square (the profile's header). */
  size?: "sm" | "md" | "lg" | "xl";
  /** The bot is thinking: an arc of the accent turns around the portrait (D2). */
  busy?: boolean;
}

/**
 * A portrait without a picture, for a bot or a person: the initials on one of
 * six tones that come from the slug (`avatarToneOf`), so the same player has
 * the same colour on every screen; a gold ring for a world champion and
 * Mexico's three colours for its Olympiad teams; the flag of the federation in
 * a corner. Decorative: whoever draws it writes the name beside it, so the
 * portrait itself is hidden from a screen reader.
 */
export function PlayerAvatar({ initials, tone, ring, country, size = "md", busy = false }: PlayerAvatarProps) {
  const flag = federationFlag(country);
  const ringClass = ring === "NONE" ? "" : ` player-avatar_ring_${ring.toLowerCase()}`;
  return (
    <span
      className={`player-avatar player-avatar_size_${size} player-avatar_tone_${tone}${ringClass}${busy ? " player-avatar_state_busy" : ""}`}
      aria-hidden="true"
    >
      <span className="player-avatar__face">{initials}</span>
      {flag && size !== "sm" && <span className="player-avatar__flag">{flag}</span>}
      {busy && <span className="player-avatar__busy" />}
    </span>
  );
}
