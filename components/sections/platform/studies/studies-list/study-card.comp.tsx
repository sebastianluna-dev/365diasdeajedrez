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
        {study.courseName && <span className="study-card__origin">{study.courseName}</span>}

        {study.canDelete ? (
          <DeleteStudy study={study} />
        ) : (
          study.isCourseStudy && <span className="study-card__readonly">Sólo lectura</span>
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
