import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { StampIcon } from "@/components/icons/stamp-icon.comp";
import { StarIcon } from "@/components/icons/star-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import "@/components/adventure/adventure.css";
import "./map-hud.comp.css";

interface MapHudProps {
  /** The zone the middle of the window is over: its kind («Torneo universitario») and its name. */
  zone: { kind: string; name: string };
  /** How many rivals are beaten, how many there are and the stars earned. */
  beaten: number;
  total: number;
  stars: number;
  /** The victory has just been written down: the two figures come up. */
  isRising?: boolean;
}

/**
 * What stays on the window over the map, under the platform's bar: the way back
 * to «Jugar» (which holds the shelf of notebooks since 2026-10-25), the zone one is in (it changes as the map
 * scrolls and the screen reader hears it) and how far the person is. It is
 * laid out as a row of paper tags; the row lets the map's clicks through
 * and only its tags catch them.
 */
export function MapHud({ zone, beaten, total, stars, isRising = false }: MapHudProps) {
  return (
    <div className="map-hud">
      <div className="map-hud__row">
        <div className="map-hud__links">
          <Link href={platformRoutes.play} className="platform-button platform-button_size_sm">
            <ChevronLeftIcon variant="classic-solid" className="platform-button__icon" />
            <span className="map-hud__link-text">Jugar</span>
          </Link>
        </div>

        <p className="map-hud__zone" aria-live="polite">
          <span className="map-hud__zone-kind">{zone.kind}</span>
          <span className="map-hud__zone-name">{zone.name}</span>
        </p>

        <p className="map-hud__score">
          <span className={`map-hud__figure${isRising ? " map-hud__figure_state_rising" : ""}`} aria-hidden="true">
            <StampIcon variant="classic-solid" className="map-hud__icon" />
            <b>{beaten}</b>/{total} <small>rivales</small>
          </span>
          <span className={`map-hud__figure${isRising ? " map-hud__figure_state_rising" : ""}`} aria-hidden="true">
            <StarIcon variant="classic-solid" className="map-hud__icon map-hud__icon_star" />
            <b>{stars}</b> <small>estrellas</small>
          </span>
          <span className="map-hud__sr-only">
            {beaten} de {total} rivales superados y {stars} {stars === 1 ? "estrella" : "estrellas"}
          </span>
        </p>
      </div>
    </div>
  );
}
