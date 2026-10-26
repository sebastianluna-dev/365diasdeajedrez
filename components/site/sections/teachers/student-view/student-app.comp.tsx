"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { HouseIcon } from "@/components/icons/house-icon.comp";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { MATE_IN_ONE } from "../hero/mate-in-one.const";
import "./student-app.comp.css";

const TABS = [
  { label: "Inicio", title: "Inicio", icon: HouseIcon, caption: "Su inicio pone primero lo que sigue: hoy, tu clase." },
  {
    label: "Clases",
    title: "Clases",
    icon: CalendarIcon,
    caption: "Sus clases y cuántas le quedan, en número de clases: nunca importes.",
  },
  {
    label: "Cursos",
    title: "Lección",
    icon: GraduationCapIcon,
    caption: "Los cursos de la academia, lección por lección sobre el tablero.",
  },
  {
    label: "Ejercicios",
    title: "Ejercicios",
    icon: TrophyIcon,
    caption: "Lo que tú le dejas y las series de la academia, en un solo lugar.",
  },
  {
    label: "Racha",
    title: "Estadísticas",
    icon: FireIcon,
    caption: "Su racha y sus minutos: estudiar cuenta; jugar, no.",
  },
] as const;

/** The lesson's position: the Najdorf after 6.Ae3 (the English attack). */
const NAJDORF_FEN = "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6";

/** Intensity of each of the last 35 days in the streak's heat map, 0 to 3. */
const HEAT = [0, 1, 2, 3, 2, 0, 1, 2, 3, 3, 1, 2, 0, 2, 3, 3, 2, 3, 1, 2, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 1];

/** The seats of the student's paid classes: 4 taken, 3 scheduled, 1 to schedule. */
const SEATS = ["taken", "taken", "taken", "taken", "scheduled", "scheduled", "scheduled", "open"] as const;

function HomePanel() {
  return (
    <>
      <div>
        <p className="student-app__greeting">¿Qué vamos a estudiar hoy, Andrea?</p>
        <p className="student-app__small student-app__muted">Lo más importante primero; lo demás, debajo.</p>
      </div>
      <div className="student-app__focus">
        <div className="student-app__focus-copy">
          <p className="student-app__small student-app__strong">Lo siguiente · tu clase empieza en 8 minutos</p>
          <p className="student-app__focus-title">Finales de torres</p>
          <p className="student-app__small">Hoy a las 18:00 · con Laura Méndez · grupal, con Ana, Diego y Mateo</p>
          <p className="student-app__focus-actions">
            <span className="student-app__white-pill">
              <CirclePlayIcon className="student-app__pill-icon" variant="classic-solid" />
              Entrar a la clase
            </span>
            <strong className="student-app__small">Ver la clase</strong>
          </p>
        </div>
        <div className="student-app__countdown" role="img" aria-label="Faltan 8 minutos">
          <svg className="student-app__countdown-ring" viewBox="0 0 140 140" aria-hidden="true">
            <circle className="student-app__countdown-track" cx="70" cy="70" r="58" />
            <circle className="student-app__countdown-left" cx="70" cy="70" r="58" transform="rotate(-90 70 70)" />
          </svg>
          <span className="student-app__countdown-text" aria-hidden="true">
            <strong className="student-app__countdown-number">8</strong>
            minutos
          </span>
        </div>
      </div>
      <p className="student-app__label">Después</p>
      <div className="student-app__later-row">
        <span className="student-app__later">
          <span className="student-app__later-icon student-app__later-icon_tone_success">
            <GraduationCapIcon className="student-app__icon" variant="classic-solid" />
          </span>
          <span>
            <strong className="student-app__later-title">Continuar el curso</strong>
            <span className="student-app__small student-app__muted">Najdorf: 6.Ae3 · 40 %</span>
          </span>
        </span>
        <span className="student-app__later">
          <span className="student-app__later-icon student-app__later-icon_tone_warning">
            <TrophyIcon className="student-app__icon" variant="classic-solid" />
          </span>
          <span>
            <strong className="student-app__later-title">Ejercicios de tu clase</strong>
            <span className="student-app__small student-app__muted">1 de 3 hechos</span>
          </span>
        </span>
      </div>
      <div className="student-app__footer">
        <span className="student-app__streak-inline">
          <FireIcon className="student-app__fire" variant="classic-solid" />
          <strong>12 días</strong> de racha
        </span>
        <span className="student-app__today">
          <span className="student-app__muted">Hoy 12 de 20 min</span>
          <span className="student-app__progress">
            <span className="student-app__progress-fill student-app__progress-fill_value_60" />
          </span>
        </span>
        <strong className="student-app__link">Ver tus estadísticas</strong>
      </div>
    </>
  );
}

function ClassesPanel() {
  return (
    <div className="student-app__classes">
      <div className="student-app__classes-side">
        <span className="student-app__filter student-app__filter_selected">
          Próximas<small>3</small>
        </span>
        <span className="student-app__filter">
          Pasadas<small className="student-app__muted">12</small>
        </span>
        <p className="student-app__label">Tus clases pagadas</p>
        <div className="student-app__balance">
          <strong className="student-app__balance-number">4</strong>
          <strong>clases por tomar</strong>
          <span
            className="student-app__seats"
            role="img"
            aria-label="8 clases pagadas: 4 tomadas, 3 programadas, 1 por programar"
          >
            {SEATS.map((seat, index) => (
              <i key={index} className={`student-app__seat student-app__seat_state_${seat}`} />
            ))}
          </span>
          <span className="student-app__small student-app__muted">3 programadas · 1 por programar</span>
          <span className="student-app__small student-app__muted">Tus clases pagadas no caducan.</span>
        </div>
      </div>
      <div className="student-app__classes-list">
        <p className="student-app__day-title">
          Hoy <span className="student-app__small student-app__muted">jueves 22 de octubre</span>
        </p>
        <div className="student-app__ticket-today">
          <div className="student-app__ticket-time">
            <span className="student-app__small student-app__strong">Hoy</span>
            <strong className="student-app__ticket-hour">18:00</strong>
            <span className="student-app__small">→ 19:00</span>
          </div>
          <div className="student-app__ticket-body">
            <span className="student-app__badge">Enlace abierto</span>
            <strong className="student-app__ticket-title">Finales de torres</strong>
            <span className="student-app__small student-app__muted">
              Laura Méndez · Grupal · con Ana, Diego y Mateo
            </span>
            <span className="student-app__ticket-actions">
              <span className="student-app__mock-button student-app__mock-button_variant_filled">
                Entrar a la clase
              </span>
              <span className="student-app__mock-button student-app__mock-button_variant_tonal">Copiar el enlace</span>
            </span>
          </div>
        </div>
        <p className="student-app__day-title">Mañana</p>
        <div className="student-app__ticket">
          <strong className="student-app__ticket-start">17:00</strong>
          <span className="student-app__ticket-main">
            <strong>Ataques al enroque</strong>
            <span className="student-app__small student-app__muted">Laura Méndez · Individual</span>
          </span>
          <span className="student-app__state">Programada</span>
        </div>
        <div className="student-app__unscheduled">
          <strong>1 clase pagada sin fecha</strong>
          <span className="student-app__small">La programamos contigo.</span>
        </div>
      </div>
    </div>
  );
}

function LessonPanel() {
  return (
    <div className="student-app__lesson">
      <div className="student-app__lesson-board">
        <SiteBoard
          fen={NAJDORF_FEN}
          lastMove={{ from: "c1", to: "e3" }}
          label="La lección: la posición después de 6.Ae3 en la Najdorf"
        />
      </div>
      <div className="student-app__lesson-copy">
        <span className="student-app__small student-app__muted">Najdorf: 6.Ae3 · Lección 4 de 12</span>
        <strong className="student-app__lesson-title">El ataque inglés</strong>
        <p className="student-app__moves">
          <span>1.e4 c5</span>
          <span>2.Cf3 d6</span>
          <span>3.d4 cxd4</span>
          <span>4.Cxd4 Cf6</span>
          <span>5.Cc3 a6</span>
          <span className="student-app__move-current">6.Ae3</span>
        </p>
        <p className="student-app__lesson-text">
          Las blancas preparan f3, Dd2 y el enroque largo. La idea: lanzar los peones del flanco de rey contra el tuyo.
        </p>
        <span className="student-app__progress student-app__progress_place_end">
          <span className="student-app__progress-fill student-app__progress-fill_value_40" />
        </span>
        <span className="student-app__small student-app__muted">
          40 % del curso · <strong className="student-app__link">Siguiente lección</strong>
        </span>
      </div>
    </div>
  );
}

function ExercisesPanel() {
  return (
    <div className="student-app__exercises">
      <p className="student-app__panel-title">Ejercicios</p>
      <div className="student-app__ticket student-app__ticket_tone_class">
        <span className="student-app__mini-board">
          <SiteBoard fen={MATE_IN_ONE.fen} label="El mate del pasillo" />
        </span>
        <span className="student-app__ticket-main">
          <strong>De tu clase: Finales de torres</strong>
          <span className="student-app__small student-app__muted">De Laura Méndez · 1 de 3 hechos</span>
        </span>
        <span className="student-app__mock-button student-app__mock-button_variant_filled">Seguir</span>
      </div>
      <div className="student-app__ticket">
        <span className="student-app__mini-board">
          <SiteBoard
            fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"
            label="Una celada de la apertura italiana"
          />
        </span>
        <span className="student-app__ticket-main">
          <strong>Serie: Celadas de apertura</strong>
          <span className="student-app__small student-app__muted">De la academia · 5 de 8 resueltos</span>
        </span>
        <span className="student-app__state student-app__state_tone_success">
          <CheckIcon className="student-app__state-icon" variant="classic-solid" />5
        </span>
      </div>
      <div className="student-app__ticket">
        <span className="student-app__mini-board">
          <SiteBoard fen="1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1" label="Un final de torres: construye el puente" />
        </span>
        <span className="student-app__ticket-main">
          <strong>Construye el puente</strong>
          <span className="student-app__small student-app__muted">Gana · juegan las blancas</span>
        </span>
        <span className="student-app__state student-app__state_tone_danger">
          <XmarkIcon className="student-app__state-icon" variant="classic-solid" />
          Fallado
        </span>
      </div>
    </div>
  );
}

function StreakPanel() {
  return (
    <div className="student-app__streak">
      <div className="student-app__streak-head">
        <span className="student-app__streak-icon">
          <FireIcon className="student-app__icon" variant="classic-solid" />
        </span>
        <span>
          <strong className="student-app__streak-days">12 días</strong>
          <span className="student-app__small student-app__muted">de racha · tu meta: 20 min al día</span>
        </span>
      </div>
      <div className="student-app__heat" aria-hidden="true">
        {HEAT.map((level, index) => (
          <i key={index} className={`student-app__heat-day student-app__heat-day_level_${level}`} />
        ))}
      </div>
      <div className="student-app__later-row">
        <span className="student-app__later">
          <strong className="student-app__stat">14</strong>
          <span className="student-app__small student-app__muted">ejercicios superados</span>
        </span>
        <span className="student-app__later">
          <strong className="student-app__stat">3 h</strong>
          <span className="student-app__small student-app__muted">esta semana</span>
        </span>
      </div>
    </div>
  );
}

const PANELS = [HomePanel, ClassesPanel, LessonPanel, ExercisesPanel, StreakPanel];

/**
 * The platform as the student sees it (the owner's «Alumno A»): a window with
 * the student's five screens as tabs. A drawing of the real screens with
 * sample data, so nothing in it is a link; the tabs follow the ARIA pattern
 * (arrows, Home and End move between them).
 */
export function StudentApp() {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = TABS[selected] ?? TABS[0];
  const Panel = PANELS[selected] ?? HomePanel;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = TABS.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? selected === last
          ? 0
          : selected + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? selected === 0
            ? last
            : selected - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="student-app" role="group" aria-label="La plataforma vista por tu alumna, Andrea">
      <div className="student-app__bar">
        <span className="student-app__bar-title">{tab.title}</span>
        <span className="student-app__search">
          <MagnifyingGlassIcon className="student-app__search-icon" />
          Buscar
        </span>
        <span className="student-app__bar-streak">
          <FireIcon className="student-app__fire" variant="classic-solid" />
          12 días
        </span>
        <span className="student-app__avatar" aria-hidden="true">
          AD
        </span>
      </div>
      <div className="student-app__body">
        <div className="student-app__nav">
          <div
            className="student-app__tabs"
            role="tablist"
            aria-orientation="vertical"
            aria-label="Pantallas del alumno"
          >
            {TABS.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`student-app-tab-${index}`}
                aria-controls="student-app-panel"
                aria-selected={index === selected}
                tabIndex={index === selected ? 0 : -1}
                className={`student-app__tab${index === selected ? " student-app__tab_selected" : ""}`}
                onClick={() => setSelected(index)}
                onKeyDown={handleKeyDown}
              >
                <Icon className="student-app__tab-icon" />
                {label}
              </button>
            ))}
          </div>
          <p className="student-app__caption" aria-live="polite">
            {tab.caption}
          </p>
        </div>
        <div
          className="student-app__panel"
          role="tabpanel"
          id="student-app-panel"
          aria-labelledby={`student-app-tab-${selected}`}
          tabIndex={0}
        >
          <Panel />
        </div>
      </div>
    </div>
  );
}
