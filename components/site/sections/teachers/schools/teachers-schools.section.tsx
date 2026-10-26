import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SchoolWeek } from "./school-week.comp";
import "./teachers-schools.section.css";

const CARDS = [
  {
    icon: ChalkboardUserIcon,
    title: "Cada profesor, sus asientos",
    text: "Tantos alumnos activos como asientos le des. Próximamente.",
  },
  {
    icon: UsersIcon,
    title: "Grupales y webinars de la academia",
    text: "Con maestros titulados, abiertos a alumnos de varios profesores.",
  },
  {
    icon: EyeIcon,
    title: "Lo de otro profesor, fuera de su vista",
    text: "Ni sus alumnos, ni sus clases, ni sus ejercicios.",
  },
] as const;

/** «Profesores · Escuelas C»: one school, three teachers, each in their own agenda. */
export function TeachersSchoolsSection() {
  return (
    <SiteSection id="escuelas" labelledBy="teachers-schools-title">
      <div className="teachers-schools">
        <div className="teachers-schools__copy">
          <SiteEyebrow>
            <CalendarClockIcon variant="classic-solid" />
            Escuelas y clubes
          </SiteEyebrow>
          <SiteHeading id="teachers-schools-title" text="Una semana de tu escuela, como la ve cada profesor" />
          <SiteLead text="Todos trabajan en la misma plataforma, pero cada profesor abre su agenda y encuentra sólo sus clases y a sus alumnos." />
        </div>
        <SchoolWeek />
        <ul className="teachers-schools__cards">
          {CARDS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="teachers-schools__card">
              <span className="teachers-schools__card-icon-wrap">
                <Icon className="teachers-schools__card-icon" />
              </span>
              <span>
                <strong className="teachers-schools__card-title">{title}</strong>
                <span className="teachers-schools__card-text">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SiteSection>
  );
}
