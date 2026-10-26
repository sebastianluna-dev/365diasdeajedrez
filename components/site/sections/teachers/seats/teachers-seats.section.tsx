import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { ShuffleIcon } from "@/components/icons/shuffle-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SeatCalculator } from "./seat-calculator.comp";
import "./teachers-seats.section.css";

const RULES = [
  { icon: UserIcon, text: "1 asiento = 1 alumno activo contigo" },
  { icon: UsersIcon, text: "Dos profesores: un asiento de cada uno" },
  { icon: ShuffleIcon, text: "Si cambia de profesor, el asiento se va con él" },
] as const;

interface TeachersSeatsSectionProps {
  whatsappNumber: string;
}

/** «Profesores · Asientos, calculadora A»: how seats are counted, before they exist. */
export function TeachersSeatsSection({ whatsappNumber }: TeachersSeatsSectionProps) {
  return (
    <SiteSection id="asientos" labelledBy="teachers-seats-title">
      <div className="teachers-seats">
        <div className="teachers-seats__head">
          <span className="teachers-seats__soon">
            <ClockIcon className="teachers-seats__soon-icon" variant="classic-solid" />
            Próximamente
          </span>
          <SiteHeading id="teachers-seats-title" text="Un asiento por alumno, no por clase" />
          <SiteLead text="Mueve las barras y mira tus asientos. Una grupal de seis son seis asientos; un alumno que también tiene otro profesor sigue siendo uno tuyo." />
        </div>
        <SeatCalculator whatsappNumber={whatsappNumber} />
        <ul className="teachers-seats__rules" aria-label="Cómo cuentan los asientos">
          {RULES.map(({ icon: Icon, text }) => (
            <li key={text} className="teachers-seats__rule">
              <Icon className="teachers-seats__rule-icon" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </SiteSection>
  );
}
