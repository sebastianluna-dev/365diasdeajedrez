import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { ClassWeek } from "./class-week.comp";
import "./teachers-calendar.section.css";

/** «Profesores · Calendario A»: the teacher's week, with what exists today said beside it. */
export function TeachersCalendarSection() {
  return (
    <SiteSection id="como-funciona" labelledBy="teachers-calendar-title">
      <div className="teachers-calendar">
        <div className="teachers-calendar__head">
          <div className="teachers-calendar__copy">
            <SiteEyebrow>
              <CalendarIcon variant="classic-solid" />
              Tu calendario
            </SiteEyebrow>
            <SiteHeading id="teachers-calendar-title" text="Tu semana de clases, de un vistazo" />
            <SiteLead text="Cada clase con su hora, sus alumnos, su tema y su estado. Toca un día para ver su agenda, o una clase para entrar, pasar lista o prepararla." />
          </div>
          <ul className="teachers-calendar__honest" aria-label="Qué existe hoy">
            <li className="teachers-calendar__tag teachers-calendar__tag_state_today">
              <CircleCheckIcon className="teachers-calendar__tag-icon" variant="classic-solid" />
              Hoy: ves las clases que te asigna la academia
            </li>
            <li className="teachers-calendar__tag teachers-calendar__tag_state_preview">
              <EyeIcon className="teachers-calendar__tag-icon" />
              Semana y mes: en vista previa
            </li>
            <li className="teachers-calendar__tag teachers-calendar__tag_state_soon">
              <ClockIcon className="teachers-calendar__tag-icon" variant="classic-solid" />
              Próximamente: creas y programas tus clases
            </li>
          </ul>
        </div>
        <ClassWeek />
      </div>
    </SiteSection>
  );
}
