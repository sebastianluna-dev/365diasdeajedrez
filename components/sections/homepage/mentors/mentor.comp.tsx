import Link from "next/link";
import type { Mentor as MentorData } from "@/interfaces/mentor.interface";
import "./mentor.comp.css";

interface MentorProps {
  mentor: MentorData;
}

export function Mentor({ mentor }: MentorProps) {
  return (
    <Link href={`/mentores/${mentor.slug}`} className="mentor-card">
      <div className="mentor-card__photo">
        <img src={mentor.photo} alt={mentor.name} />
      </div>
      <div className="mentor-card__body">
        <div>
          <div className="mentor-card__head">
            <h3 className="mentor-card__name">{mentor.name}</h3>
            {mentor.fideInfo.shortFideTitle && (
              <span className="mentor-card__title">{mentor.fideInfo.shortFideTitle}</span>
            )}
          </div>
          <p className="mentor-card__tagline">{mentor.shortDescription}</p>
        </div>
        <div className="mentor-card__ratings">
          <div className="mentor-card__rating">
            <span className="mentor-card__rating-label">Estándar</span>
            <span className="mentor-card__rating-value">{mentor.fideInfo.standardElo}</span>
          </div>
          <div className="mentor-card__rating">
            <span className="mentor-card__rating-label">Rápidas</span>
            <span className="mentor-card__rating-value">{mentor.fideInfo.rapidElo}</span>
          </div>
          <div className="mentor-card__rating">
            <span className="mentor-card__rating-label">Blitz</span>
            <span className="mentor-card__rating-value">{mentor.fideInfo.blitzElo}</span>
          </div>
        </div>
        <span className="mentor-card__cta">
          Ver perfil <span>→</span>
        </span>
      </div>
    </Link>
  );
}
