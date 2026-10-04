import { federationFlag } from "@/lib/chess/federations";
import type { PlayerOutcome } from "@/lib/chess/player-outcomes";
import "./player-strip.comp.css";

/** What a strip says about a player: the name, and whatever the PGN brought. */
export interface PlayerInfo {
  name: string;
  elo?: number;
  title?: string;
  /** Federation code (FIDE's three letters); the flag is derived from it. */
  country?: string;
}

interface PlayerStripProps extends PlayerInfo {
  /** How the game ended for this player; absent while it has not, and nothing is drawn. */
  outcome?: PlayerOutcome;
}

/** The point a player took, as a scoresheet writes it, and what it means said in a word. */
const SCORES: Record<PlayerOutcome, { score: string; label: string }> = {
  win: { score: "1", label: "Ganó" },
  loss: { score: "0", label: "Perdió" },
  draw: { score: "½", label: "Tablas" },
};

/**
 * The line above or below the board that names a player, as Lichess draws
 * it: the point they took (1, 0 or ½) once the game has ended, federation and
 * its flag, title, name and Elo. There is no chip of the pieces' colour: who
 * has White is read from the board's own coordinates. The viewer places each
 * strip, because only it knows which side is on top when the board is flipped.
 */
export function PlayerStrip({ name, elo, title, country, outcome }: PlayerStripProps) {
  const flag = federationFlag(country);
  const score = outcome ? SCORES[outcome] : null;

  return (
    <>
      {score && (
        <span className={`player-strip__score player-strip__score_outcome_${outcome}`}>
          {/* The figure is what is seen; a screen reader is told what it means. */}
          <span aria-hidden="true">{score.score}</span>
          <span className="player-strip__sr">{score.label}</span>
        </span>
      )}

      {country && <span className="player-strip__country">{country}</span>}
      {/* The flag decorates the code next to it: if the code is not in the
          table nothing is painted, instead of making one up. */}
      {flag && (
        <span className="player-strip__flag" aria-hidden="true">
          {flag}
        </span>
      )}
      {title && <span className="player-strip__title">{title}</span>}

      <span className="player-strip__name">{name}</span>
      {elo !== undefined && <span className="player-strip__elo">{elo}</span>}
    </>
  );
}
