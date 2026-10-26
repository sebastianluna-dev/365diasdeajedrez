import { BellIcon } from "@/components/icons/bell-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { GridIcon } from "@/components/icons/grid-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { mdButton } from "@/lib/material/material-classes";
import { MateInOne } from "./mate-in-one.comp";
import "./teachers-hero.section.css";

const TOOLS = [
  { icon: BellIcon, name: "WhatsApp", job: "para los avisos" },
  { icon: GridIcon, name: "Una hoja de cálculo", job: "para la lista" },
  { icon: ChessBoardIcon, name: "Lichess", job: "para dejar ejercicios" },
] as const;

const JOBS = [
  {
    icon: CirclePlayIcon,
    title: "Das la clase",
    text: "Tus alumnos la ven en su inicio y entran con un botón, con el tema y el material que preparaste.",
  },
  {
    icon: CircleCheckIcon,
    title: "Pasas lista",
    text: "Al terminar marcas quién vino, y les dejas el resumen y la grabación.",
  },
  {
    icon: ChessBoardIcon,
    title: "Les dejas ejercicios",
    text: "Los escribes jugando en el tablero, con variantes y comentarios, y ves quién los resolvió.",
  },
] as const;

/** «Profesores B: de tres a uno»: the three apps a teacher juggles, crossed out, into one panel with a live mate in 1. */
export function TeachersHeroSection() {
  return (
    <section className="teachers-hero" id="inicio" aria-labelledby="teachers-hero-title">
      <div className="teachers-hero__head">
        <SiteEyebrow align="center">
          <ChalkboardUserIcon variant="classic-solid" />
          Para profesores, clubes y escuelas
        </SiteEyebrow>
        <h1 className="teachers-hero__title" id="teachers-hero-title">
          La plataforma para dar clases de ajedrez
        </h1>
        <p className="teachers-hero__lede">
          Tus clases, tus alumnos y su entrenamiento en un solo lugar: das la clase, pasas lista y les dejas ejercicios
          que tú mismo escribes en el tablero, y ves quién los resolvió.
        </p>
        <div className="teachers-hero__actions">
          <a className={mdButton("filled", "md")} href="#demo">
            <CalendarIcon className="site-md-icon" variant="classic-solid" />
            Agenda una demo
          </a>
          <a className={mdButton("outlined", "md")} href="#lista">
            <BellIcon className="site-md-icon" />
            Únete a la lista de espera
          </a>
        </div>
        <div className="teachers-hero__meta">
          <span>
            Hecha y usada a diario por la academia <strong>365 días de ajedrez</strong>.
          </span>
          <span className="teachers-hero__soon">
            <ClockIcon className="teachers-hero__soon-icon" />
            <strong>Próximamente:</strong> asientos para tus alumnos
          </span>
        </div>
      </div>

      <div className="teachers-hero__diagram">
        <div className="teachers-hero__before">
          <p className="teachers-hero__label">Hoy, en tres lugares</p>
          <ul className="teachers-hero__tools">
            {TOOLS.map(({ icon: Icon, name, job }) => (
              <li key={name} className="teachers-hero__tool">
                <span className="teachers-hero__tool-icon-wrap">
                  <Icon className="teachers-hero__tool-icon" />
                </span>
                <s className="teachers-hero__tool-text">
                  <strong>{name}</strong> {job}
                </s>
                <span className="teachers-hero__tool-cross" aria-hidden="true">
                  <XmarkIcon className="teachers-hero__tool-cross-icon" variant="classic-solid" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <svg className="teachers-hero__flow" viewBox="0 0 176 360" aria-hidden="true">
          <path className="teachers-hero__flow-line" d="M0 30 C 90 30 80 180 170 180" />
          <path className="teachers-hero__flow-line" d="M18 112 C 100 112 90 180 170 180" />
          <path className="teachers-hero__flow-line" d="M0 194 C 90 194 80 180 170 180" />
          <circle className="teachers-hero__flow-dot" cx="166" cy="180" r="8" />
          <circle className="teachers-hero__flow-ring" cx="166" cy="180" r="14" />
        </svg>

        <div className="teachers-hero__after">
          <p className="teachers-hero__label teachers-hero__label_tone_accent">Aquí, en uno solo</p>
          <div className="teachers-hero__panel">
            <ul className="teachers-hero__jobs" aria-label="Lo que haces en la plataforma">
              {JOBS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="teachers-hero__job">
                  <span className="teachers-hero__job-icon-wrap">
                    <Icon className="teachers-hero__job-icon" variant="classic-solid" />
                  </span>
                  <span>
                    <strong className="teachers-hero__job-title">{title}</strong>
                    <span className="teachers-hero__job-text">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <MateInOne />
          </div>
        </div>
      </div>
    </section>
  );
}
