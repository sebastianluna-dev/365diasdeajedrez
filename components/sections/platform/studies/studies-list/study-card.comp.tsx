import Link from "next/link";
import type { StudySummary } from "@/services/studies/studies.types";
import "./study-card.comp.css";

interface StudyCardProps {
  study: StudySummary;
}

export function StudyCard({ study }: StudyCardProps) {
  return (
    <Link href={study.href} className="platform-card study-card">
      <div className="study-card__tags">
        <span className="platform-tag platform-tag_variant_accent">{study.kindLabel}</span>
        {study.courseName && <span className="platform-tag">{study.courseName}</span>}
      </div>

      <h3 className="study-card__name">{study.name}</h3>
      {study.description && <p className="study-card__description">{study.description}</p>}

      <p className="study-card__meta">
        {study.gameCount} {study.gameCount === 1 ? "partida" : "partidas"} · Actualizado el {study.updatedAtLabel}
      </p>
    </Link>
  );
}
