import Link from "next/link";
import Image from "next/image";
import type { Mentor } from "@/interfaces/mentor.interface";
import "./hero.section.css";

interface MentorHeroSectionProps {
  mentor: Mentor;
}

export function MentorHeroSection({ mentor }: MentorHeroSectionProps) {
  return (
    <section className="mentor-hero">
      <div className="mentor-hero__card">
        <div className="mentor-hero__media">
          <div className="mentor-hero__photo">
            <Image src={mentor.photo} alt={mentor.name} fill sizes="(max-width: 720px) 100vw, 270px" />
          </div>
          <div className="mentor-hero__ratings">
            <div className="mentor-hero__rating">
              <span className="mentor-hero__rating-label">Estándar</span>
              <span className="mentor-hero__rating-value">{mentor.fideInfo.standardElo}</span>
            </div>
            <div className="mentor-hero__rating">
              <span className="mentor-hero__rating-label">Rápidas</span>
              <span className="mentor-hero__rating-value">{mentor.fideInfo.rapidElo}</span>
            </div>
            <div className="mentor-hero__rating">
              <span className="mentor-hero__rating-label">Blitz</span>
              <span className="mentor-hero__rating-value">{mentor.fideInfo.blitzElo}</span>
            </div>
          </div>
        </div>

        <div className="mentor-hero__info">
          <span className="mentor-hero__badge">{mentor.fideInfo.longFideTitle}</span>
          <h1 className="mentor-hero__name">{mentor.fullName}</h1>
          <p className="mentor-hero__summary">{mentor.summary}</p>
          <div className="mentor-hero__actions">
            <Link href="/#planes" className="button button_variant_primary">
              Reservar una clase
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
