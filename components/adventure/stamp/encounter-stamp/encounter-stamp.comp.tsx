import type { CSSProperties } from "react";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { StarIcon } from "@/components/icons/star-icon.comp";
import type { EncounterView } from "@/services/adventure/adventure.types";
import { StampArt } from "./stamp-art.comp";
import "@/components/adventure/adventure.css";
import "./encounter-stamp.comp.css";

/**
 * A step of the victory the map is playing, which this stamp draws: the pin of
 * the rival just beaten comes out (`release`), its postmark lands (`postmark`)
 * and its stars come out one by one (`stars`); the next stamp loses its
 * padlock (`unlock`) and is inked and pinned (`arrive`). The stylesheet
 * animates each; any other time there is none.
 */
export type StampPhase = "release" | "postmark" | "stars" | "unlock" | "arrive";

interface EncounterStampProps {
  encounter: EncounterView;
  /** The adventure's slug, where the portrait is looked up. */
  adventure: string;
  /** How many rivals the adventure has: «rival 5 de 12». */
  total: number;
  /** The place written round the postmark of its zone. */
  postmark: string;
  /**
   * Where it sits on the map: the percentage of the world's width and height of
   * its centre, the percentage of the world's width it measures and its tilt in
   * degrees.
   */
  position: { left: number; top: number; width: number; tilt: number };
  /** The stamp the person is to play, or the last one when the adventure is complete: where the map scrolls to. */
  isFocus?: boolean;
  /** The step of the victory being played on this stamp, if one is. */
  phase?: StampPhase | null;
  /** Called with the rival's order when the stamp is pressed: the host opens its card. */
  onOpen: (order: number, trigger: HTMLElement) => void;
}

/** What a screen reader says of the state: «superado al primer intento, 3 de 3 estrellas», «bloqueado». */
function stateText({ state, attempts, stars }: Pick<EncounterView, "state" | "attempts" | "stars">): string {
  if (state === "beaten") {
    const tries = attempts === 1 ? "al primer intento" : `en ${attempts} intentos`;
    return `superado ${tries}, ${stars} de 3 estrellas`;
  }
  if (state === "available")
    return attempts > 0 ? `disponible, intento ${attempts + 1}` : "disponible, es tu próximo rival";
  return "bloqueado";
}

/** The name as the label writes it: «Leonor Aldama, «la Condesa»» keeps the nickname on a second, lighter line. */
function nameLines(name: string): { first: string; second: string | null } {
  const [first = name, ...rest] = name.split(", ");
  return { first, second: rest.length > 0 ? rest.join(", ") : null };
}

/**
 * A rival's stamp on the map: the postage stamp with its label under it, one
 * button whose accessible name says all of it — the name, the place in the
 * story, the level, the state and the stars — because the drawing is only
 * seen. Pressing it asks the host to open the rival's card. The state changes
 * what is drawn: a beaten stamp is cancelled and shows its stars, the
 * available one is pinned, lifted, circled in red and says which attempt it
 * is, and a locked one is blind and shows a lock.
 */
export function EncounterStamp({
  encounter,
  adventure,
  total,
  postmark,
  position,
  isFocus = false,
  phase = null,
  onOpen,
}: EncounterStampProps) {
  const { state, attempts, stars } = encounter;
  const names = nameLines(encounter.name);
  const label = `${encounter.name}, rival ${encounter.order} de ${total}, nivel aproximado ${encounter.elo}, ${stateText(encounter)}`;

  return (
    <button
      type="button"
      className={`encounter-stamp encounter-stamp_status_${state}${encounter.isFinal ? " encounter-stamp_final" : ""}${phase ? ` encounter-stamp_phase_${phase}` : ""}`}
      style={
        {
          left: `${position.left}%`,
          top: `${position.top}%`,
          width: `${position.width}%`,
          "--tilt": `${position.tilt}deg`,
        } as CSSProperties
      }
      aria-label={label}
      aria-haspopup="dialog"
      data-order={encounter.order}
      data-focus={isFocus ? "true" : undefined}
      onClick={(event) => onOpen(encounter.order, event.currentTarget)}
    >
      {state === "available" && (
        <svg
          className="encounter-stamp__circle"
          viewBox="0 0 207 249"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            pathLength={1}
            d="M104 10C160 6 199 52 197 122C195 194 156 241 100 239C42 237 8 190 10 122C12 58 50 14 112 13C132 13 148 20 162 30"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="encounter-stamp__paper">
        <StampArt adventure={adventure} encounter={encounter} postmark={postmark} isUnlocking={phase === "unlock"} />
      </span>
      <span className="encounter-stamp__label" aria-hidden="true">
        {state === "available" && attempts > 0 && (
          <span className="encounter-stamp__attempt">Intento {attempts + 1}</span>
        )}
        <span className="encounter-stamp__name">
          {names.first}
          {names.second && <em className="encounter-stamp__nickname">{names.second}</em>}
        </span>
        <span className="encounter-stamp__meta">
          {state === "locked" && <LockIcon variant="classic-solid" className="encounter-stamp__lock" />}
          <span>≈ {encounter.elo}</span>
          {state === "beaten" && (
            <span className="encounter-stamp__stars">
              {[1, 2, 3].map((star) => (
                <span key={star} className="encounter-stamp__star-slot" style={{ "--star": star } as CSSProperties}>
                  <StarIcon
                    variant={star <= stars ? "classic-solid" : "classic-light"}
                    className={`encounter-stamp__star${star <= stars ? " encounter-stamp__star_on" : ""}`}
                  />
                </span>
              ))}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
