import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import { ACADEMY_STATS } from "./academy-stats.const";
import { TeacherGameSection } from "./teacher-game.section";
import "./teacher.section.css";

const TEACHER = {
  name: "Sebastián Luna",
  fullName: "Sebastian Luna",
  photo: "/design-import/assets/profesores/diego.jpg",
  summary:
    "Mi pasión por el juego me ha llevado a buscar una comprensión profunda del ajedrez y, como maestro, disfruto compartir ese conocimiento para ayudar a mis alumnos a mejorar, ganar confianza y desarrollar su propio criterio frente al tablero.",
  fideInfo: {
    standardElo: 1834,
    rapidElo: 1804,
    blitzElo: 1798,
    chessComElo: 2200,
  },
};

export function TeacherSection() {
  return (
    <>
      <section id="maestro" className="teacher">
        <div className="teacher__media">
          <Image className="teacher__photo" src={TEACHER.photo} alt={TEACHER.name} width={1536} height={2048} />
          <div className="teacher__photo-overlay" />

          <div className="teacher__stats">
            {ACADEMY_STATS.map((stat) => (
              <div key={stat.label} className="teacher__stat">
                <span className="teacher__stat-value">{stat.value}</span>
                <p className="teacher__stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="teacher__content">
          <span className="teacher__eyebrow">Hola, soy</span>
          <h1 className="teacher__name">{TEACHER.fullName}</h1>
          <span className="teacher__badge">Maestro de la academia</span>
          <p className="teacher__summary">{TEACHER.summary}</p>

          <p className="teacher__elo-label">Clasificación Elo actual por modalidad de juego</p>
          <div className="teacher__elo-grid teacher__elo-grid_cols_4">
            <div className="teacher__elo-item">
              <span className="teacher__elo-item-label">Estándar</span>
              <span className="teacher__elo-item-value">{TEACHER.fideInfo.standardElo}</span>
            </div>
            <div className="teacher__elo-item">
              <span className="teacher__elo-item-label">Rápidas</span>
              <span className="teacher__elo-item-value">{TEACHER.fideInfo.rapidElo}</span>
            </div>
            <div className="teacher__elo-item">
              <span className="teacher__elo-item-label">Blitz</span>
              <span className="teacher__elo-item-value">{TEACHER.fideInfo.blitzElo}</span>
            </div>
            <div className="teacher__elo-item">
              <span className="teacher__elo-item-label">Chess.com</span>
              <span className="teacher__elo-item-value">{TEACHER.fideInfo.chessComElo}</span>
            </div>
          </div>

          <div className="teacher__actions">
            <Link href="/#planes" className="button button_variant_primary button_size_hero">
              <CalendarCheck size={16} />
              Agenda tu primera clase
            </Link>
          </div>
        </div>
      </section>

      <TeacherGameSection />
    </>
  );
}
