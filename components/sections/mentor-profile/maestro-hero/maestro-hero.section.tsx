import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import type { Mentor } from "@/interfaces/mentor.interface";
import { ACADEMY_STATS } from "@/components/sections/mentor-profile/academy-stats.const";
import "./maestro-hero.section.css";

interface MaestroHeroSectionProps {
  mentor: Mentor;
}

export function MaestroHeroSection({ mentor }: MaestroHeroSectionProps) {
  return (
    <section className="maestro-hero">
      <div className="maestro-hero__media">
        <Image className="maestro-hero__photo" src={mentor.photo} alt={mentor.name} width={1536} height={2048} />
        <div className="maestro-hero__photo-overlay" />

        <div className="maestro-hero__stats">
          {ACADEMY_STATS.map((stat) => (
            <div key={stat.label} className="maestro-hero__stat">
              <span className="maestro-hero__stat-value">{stat.value}</span>
              <p className="maestro-hero__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="maestro-hero__content">
        <span className="maestro-hero__eyebrow">Hola, soy</span>
        <h1 className="maestro-hero__name">{mentor.fullName}</h1>
        <span className="maestro-hero__badge">Maestro de la academia</span>
        <p className="maestro-hero__summary">{mentor.summary}</p>

        <p className="maestro-hero__elo-label">Clasificación Elo actual por modalidad de juego</p>
        <div className={`maestro-hero__elo-grid${mentor.fideInfo.chessComElo ? " maestro-hero__elo-grid_cols_4" : ""}`}>
          <div className="maestro-hero__elo-item">
            <span className="maestro-hero__elo-item-label">Estándar</span>
            <span className="maestro-hero__elo-item-value">{mentor.fideInfo.standardElo}</span>
          </div>
          <div className="maestro-hero__elo-item">
            <span className="maestro-hero__elo-item-label">Rápidas</span>
            <span className="maestro-hero__elo-item-value">{mentor.fideInfo.rapidElo}</span>
          </div>
          <div className="maestro-hero__elo-item">
            <span className="maestro-hero__elo-item-label">Blitz</span>
            <span className="maestro-hero__elo-item-value">{mentor.fideInfo.blitzElo}</span>
          </div>
          {mentor.fideInfo.chessComElo && (
            <div className="maestro-hero__elo-item">
              <span className="maestro-hero__elo-item-label">Chess.com</span>
              <span className="maestro-hero__elo-item-value">{mentor.fideInfo.chessComElo}</span>
            </div>
          )}
        </div>

        <div className="maestro-hero__actions">
          <Link href="/#planes" className="button button_variant_primary button_size_hero">
            <CalendarCheck size={16} />
            Agenda tu primera clase
          </Link>
        </div>
      </div>
    </section>
  );
}
