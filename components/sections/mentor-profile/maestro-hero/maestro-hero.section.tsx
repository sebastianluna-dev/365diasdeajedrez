import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import type { Mentor } from "@/interfaces/mentor.interface";
import "./maestro-hero.section.css";

interface MaestroHeroSectionProps {
  mentor: Mentor;
}

const HERO_STATS = [
  { value: "10+", label: "Años jugando" },
  { value: "3+", label: "Como entrenador" },
  { value: "20+", label: "Alumnos formados" },
  { value: "365", label: "Método propio" },
  { value: "8+", label: "Torneos nacionales" },
];

export function MaestroHeroSection({ mentor }: MaestroHeroSectionProps) {
  return (
    <section className="maestro-hero">
      <span aria-hidden="true" className="maestro-hero__word">
        MAESTRO
      </span>

      <div className="maestro-hero__media">
        <Image
          className="maestro-hero__photo"
          src={mentor.photo}
          alt={mentor.name}
          fill
          sizes="(max-width: 720px) 100vw, 50vw"
          style={{ objectPosition: mentor.photoFocus }}
        />
        <div className="maestro-hero__photo-overlay" />

        <div className="maestro-hero__stats">
          {HERO_STATS.map((stat) => (
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
        <span className="maestro-hero__badge">{mentor.fideInfo.longFideTitle}</span>
        <p className="maestro-hero__summary">{mentor.summary}</p>

        <p className="maestro-hero__elo-label">Clasificación Elo actual por modalidad de juego</p>
        <div className="maestro-hero__elo-grid">
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
        </div>

        <div className="maestro-hero__actions">
          <Link href="/#planes" className="button button_variant_primary">
            <CalendarCheck size={16} />
            Agenda tu primera clase
          </Link>
        </div>
      </div>
    </section>
  );
}
