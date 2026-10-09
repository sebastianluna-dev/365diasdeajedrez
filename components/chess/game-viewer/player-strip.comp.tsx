import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import type { PlayerAvatarData } from "@/lib/avatar-tone";
import { federationFlag } from "@/lib/chess/federations";
import type { PlayerOutcome } from "@/lib/chess/player-outcomes";
import "./player-strip.comp.css";

/** How a game against a bot ended for this player, said in the strip itself (G6). */
export interface PlayerEnding {
  kind: PlayerOutcome;
  /** «Ganaste» on the person's own strip, «Ganó» on the other's; «Perdió»; «Tablas». */
  label: "Ganaste" | "Ganó" | "Perdió" | "Tablas";
  /** The line under the name: «por jaque mate», «por abandono»… */
  reason: string;
}

/** What a strip says about a player: the name, and whatever the PGN or the game brought. */
export interface PlayerInfo {
  name: string;
  elo?: number;
  title?: string;
  /** Federation code (FIDE's three letters); the flag is derived from it. */
  country?: string;
  /** A portrait, for a game played on the platform; `busy` while a bot thinks (D2). */
  avatar?: PlayerAvatarData & { busy?: boolean };
  /** Whose move it is, as a dot before the portrait (E4): lit for the mover, dim for the other; none outside a live game. */
  turn?: boolean;
  /** The line under the name while the game is on: «Pensando…», «Te toca mover». */
  status?: string;
  /**
   * A clock, for the games between people that will have one; its slot is
   * reserved beside the name and nothing is drawn against a bot (`null`).
   */
  clock?: { remainingMs: number; running: boolean } | null;
  /** How the game ended for this player; the strip is tinted with it. */
  ending?: PlayerEnding;
}

interface PlayerStripProps extends PlayerInfo {
  /** How the game ended for this player, by its point; absent while it has not, and nothing is drawn. */
  outcome?: PlayerOutcome;
}

/** The point a player took, as a scoresheet writes it, and what it means said in a word. */
const SCORES: Record<PlayerOutcome, { score: string; label: string }> = {
  win: { score: "1", label: "Ganó" },
  loss: { score: "0", label: "Perdió" },
  draw: { score: "½", label: "Tablas" },
};

/** «4:07», a clock's minutes and seconds. */
function clockText(remainingMs: number): string {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * The line above or below the board that names a player, as Lichess draws
 * it. For a game of a study: the point they took (1, 0 or ½) once it has
 * ended, federation and its flag, title, name and Elo. For a game played on
 * the platform it also carries a portrait, a dot for the turn, a line under
 * the name (thinking, or how it ended) and the slot of a clock; the viewer
 * tints the strip with the ending (G6), so who won is read without anything
 * covering the board. The viewer places each strip, because only it knows
 * which side is on top when the board is flipped.
 */
export function PlayerStrip({
  name,
  elo,
  title,
  country,
  avatar,
  turn,
  status,
  clock,
  ending,
  outcome,
}: PlayerStripProps) {
  const flag = federationFlag(country);
  // A played game says its result in words; the figure is a study game's.
  const score = outcome && !ending ? SCORES[outcome] : null;
  const line = ending?.reason ?? status;

  const identity = (
    <>
      {country && <span className="player-strip__country">{country}</span>}
      {/* The flag decorates the code next to it: if the code is not in the
          table nothing is painted, instead of making one up. A portrait
          carries its own flag, so the line does not repeat it. */}
      {flag && !avatar && (
        <span className="player-strip__flag" aria-hidden="true">
          {flag}
        </span>
      )}
      {title && <span className="player-strip__title">{title}</span>}

      <span className="player-strip__name">{name}</span>
      {elo !== undefined && <span className="player-strip__elo">{elo}</span>}
    </>
  );

  return (
    <>
      {turn !== undefined && (
        <span className={`player-strip__turn${turn ? " player-strip__turn_state_on" : ""}`} aria-hidden="true" />
      )}

      {score && (
        <span className={`player-strip__score player-strip__score_outcome_${outcome}`}>
          {/* The figure is what is seen; a screen reader is told what it means. */}
          <span aria-hidden="true">{score.score}</span>
          <span className="player-strip__sr">{score.label}</span>
        </span>
      )}

      {avatar ? (
        <>
          <PlayerAvatar {...avatar} size="md" />
          <span className="player-strip__who">
            <span className="player-strip__line">
              {identity}
              {ending && (
                <span className={`player-strip__ending player-strip__ending_kind_${ending.kind}`}>
                  {ending.label === "Ganaste" && (
                    <TrophyIcon variant="classic-solid" className="player-strip__ending-icon" />
                  )}
                  {ending.label}
                </span>
              )}
            </span>
            {line && <span className="player-strip__status">{line}</span>}
          </span>
        </>
      ) : (
        identity
      )}

      {clock && (
        <span className={`player-strip__clock${clock.running ? " player-strip__clock_state_running" : ""}`}>
          {clockText(clock.remainingMs)}
        </span>
      )}
    </>
  );
}
