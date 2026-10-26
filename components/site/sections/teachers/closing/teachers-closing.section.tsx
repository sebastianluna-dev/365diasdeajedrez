import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { DemoForm } from "./demo-form.comp";
import "./teachers-closing.section.css";

const PROMISES = [
  "Una videollamada con alguien del equipo",
  "Para profesores, clubes y escuelas",
  "Te contestamos por WhatsApp",
] as const;

interface TeachersClosingSectionProps {
  whatsappNumber: string;
}

/** «Profesores · Cierre A»: the demo and the waiting list, one form that writes to WhatsApp. */
export function TeachersClosingSection({ whatsappNumber }: TeachersClosingSectionProps) {
  return (
    <SiteSection id="lista" labelledBy="teachers-closing-title">
      <div className="teachers-closing" id="demo">
        <div className="teachers-closing__copy">
          <span className="teachers-closing__eyebrow">
            <CalendarIcon className="teachers-closing__eyebrow-icon" variant="classic-solid" />
            Agenda una demo
          </span>
          <h2 className="teachers-closing__title" id="teachers-closing-title">
            Te enseñamos la plataforma con tus propias clases en mente
          </h2>
          <p className="teachers-closing__lede">
            Una videollamada con alguien del equipo: te mostramos la agenda, el pase de lista y los ejercicios, y
            resolvemos tus dudas.
          </p>
          <ul className="teachers-closing__promises">
            {PROMISES.map((promise) => (
              <li key={promise} className="teachers-closing__promise">
                <span className="teachers-closing__promise-icon-wrap">
                  <CheckIcon className="teachers-closing__promise-icon" variant="classic-solid" />
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </div>
        <DemoForm whatsappNumber={whatsappNumber} />
      </div>
    </SiteSection>
  );
}
