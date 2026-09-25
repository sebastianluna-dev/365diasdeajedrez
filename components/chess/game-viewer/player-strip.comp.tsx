import { federationFlag } from "@/lib/chess/federations";
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
  side: "white" | "black";
}

/**
 * The line above or below the board that names a player: colour chip,
 * federation and its flag, title, name and Elo. The viewer places it by
 * colour, because only it knows which side is on top when the board is flipped.
 */
export function PlayerStrip({ name, elo, title, country, side }: PlayerStripProps) {
  const flag = federationFlag(country);

  return (
    <>
      <span className={`player-strip__chip player-strip__chip_side_${side}`} aria-hidden="true" />

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
