import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { mdCard } from "@/lib/material/material-classes";
import type { StudySummary } from "@/services/studies/studies.types";
import { gameCountLabel, StudyChip } from "../study-chip/study-chip.comp";
import { DeleteStudy } from "./delete-study.comp";
import "./study-card.comp.css";

interface StudyCardProps {
  study: StudySummary;
}

/**
 * A study as the library shows it, in the new design system (2026-10-23,
 * «M4» of the owner's canvas): an outlined card with its board on the left —
 * where the game it opens on ends —, and beside it its kind as a chip in its
 * colour, its name in two lines at most, and how many games it has and when
 * it was touched, or that it is read-only when it is not theirs. The whole
 * card takes you to the study: the name is the link, and a pseudo-element of
 * it is stretched over the card (see the stylesheet), which keeps one link in
 * the markup and the delete cross, raised above it, still pressable.
 */
export function StudyCard({ study }: StudyCardProps) {
  const isOwn = study.permissions.canEditGames;

  return (
    <article className={`${mdCard("outlined")} study-card`}>
      {/* A thumbnail: the name says what the study is, so the board is not read out. */}
      <span className="study-card__board" aria-hidden="true">
        <StaticDiagram fen={study.boardFen} orientation={study.boardOrientation} look="material" />
      </span>

      <div className="study-card__body">
        <StudyChip study={study} />

        <Link href={study.href} className="study-card__name">
          {study.name}
        </Link>

        <span className="study-card__meta">
          {gameCountLabel(study.gameCount)} ·{" "}
          {isOwn ? (
            <span title={`Actualizado el ${study.updatedAtLabel}`}>{study.updatedAgoLabel}</span>
          ) : (
            "sólo lectura"
          )}
        </span>
      </div>

      {study.permissions.canDelete && (
        <div className="study-card__actions">
          <DeleteStudy
            id={study.id}
            name={study.name}
            gameCount={study.gameCount}
            citedGameCount={study.citedGameCount}
          />
        </div>
      )}
    </article>
  );
}
