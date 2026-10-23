"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { mdIconButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import "./study-trail.comp.css";

/** A game of the study, as the trail names it and goes to it. */
export interface StudyTrailGame {
  id: string;
  name: string;
  href: string;
}

interface StudyTrailProps {
  /** Every game of the study, in its order. */
  games: StudyTrailGame[];
}

/**
 * The panel's toolbar on a study's game, in the new design system
 * (2026-10-23, «M4» of the owner's canvas): back to «Mis estudios», and at
 * its right which game of how many it is, with the arrows to the one before
 * and the one after. No crumbs since the same day: the side column already
 * names the study and lights the game.
 *
 * It is the layout's, which is not rendered again from one game to the next,
 * so which game is on the board is read here from the address, as the list
 * of the side column reads it (`StudyGames`).
 */
export function StudyTrail({ games }: StudyTrailProps) {
  const { gameId = "" } = useParams<{ gameId?: string }>();
  const index = games.findIndex((game) => game.id === gameId);
  const current = games[index];
  const previous = index > 0 ? games[index - 1] : undefined;
  const next = index >= 0 ? games[index + 1] : undefined;

  return (
    <nav className="study-trail" aria-label="Partidas del estudio">
      <Link href={platformRoutes.studies} className={mdIconButton("standard", "sm")} aria-label="Volver a tus estudios">
        <ArrowLeftIcon variant="classic-solid" className="platform-md-icon" />
      </Link>

      {current && games.length > 1 && (
        <span className="study-trail__games">
          <span className="study-trail__count">
            Partida {index + 1} de {games.length}
          </span>
          <TrailArrow game={previous} label="Partida anterior" direction="previous" />
          <TrailArrow game={next} label="Partida siguiente" direction="next" />
        </span>
      )}
    </nav>
  );
}

interface TrailArrowProps {
  game?: StudyTrailGame;
  label: string;
  direction: "previous" | "next";
}

/** An arrow to the game before or after: a link while there is one, switched off at either end. */
function TrailArrow({ game, label, direction }: TrailArrowProps) {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon;
  const icon = <Icon variant="classic-solid" className="platform-md-icon" />;
  if (!game) {
    return (
      <button type="button" className={mdIconButton("standard", "sm")} aria-label={label} disabled>
        {icon}
      </button>
    );
  }
  return (
    <Link href={game.href} className={mdIconButton("standard", "sm")} aria-label={`${label}: ${game.name}`}>
      {icon}
    </Link>
  );
}
