import Link from "next/link";
import type { StudySummary } from "@/services/studies/studies.types";
import { DeleteStudy } from "./delete-study.comp";
import "./study-card.comp.css";

interface StudyCardProps {
  study: StudySummary;
}

export function StudyCard({ study }: StudyCardProps) {
  return (
    <article className="study-card">
      <div className="study-card__tags">
        <span className="study-card__kind">{study.kindLabel}</span>
        {/* Where what is not theirs comes from: the course that brings it or the
            teacher who handed it out. Without this, two read-only collections would
            be indistinguishable in the list. */}
        {study.courseName && <span className="study-card__origin">{study.courseName}</span>}
        {study.sharedByName && <span className="study-card__origin">{study.sharedByName}</span>}

        {study.permissions.canDelete ? (
          <DeleteStudy
            id={study.id}
            name={study.name}
            gameCount={study.gameCount}
            citedGameCount={study.citedGameCount}
          />
        ) : (
          !study.permissions.canEditGames && <span className="study-card__readonly">Sólo lectura</span>
        )}
      </div>

      <Link href={study.href} className="study-card__name">
        {study.name}
      </Link>

      {study.description && <p className="study-card__description">{study.description}</p>}

      <p className="study-card__meta">
        <span className="study-card__count">
          {study.gameCount} {study.gameCount === 1 ? "partida" : "partidas"}
        </span>
        <span className="study-card__dot">·</span>
        <span>Actualizado el {study.updatedAtLabel}</span>
      </p>
    </article>
  );
}
