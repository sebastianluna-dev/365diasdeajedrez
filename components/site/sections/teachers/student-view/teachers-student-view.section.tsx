import { CheckIcon } from "@/components/icons/check-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { StudentApp } from "./student-app.comp";
import "./teachers-student-view.section.css";

const PROMISES = [
  "Nunca ve importes: sólo cuántas clases le quedan.",
  "Ve los cursos y las series de la academia.",
  "De tu clase ve lo que tú decides, cuando tú decides.",
] as const;

/** «Profesores · Alumno A»: the platform from the student's side, a window to walk through. */
export function TeachersStudentViewSection() {
  return (
    <SiteSection id="alumno" labelledBy="teachers-student-view-title">
      <div className="teachers-student-view">
        <div className="teachers-student-view__head">
          <div className="teachers-student-view__copy">
            <SiteEyebrow>
              <UserIcon variant="classic-solid" />
              Lo que ve tu alumno
            </SiteEyebrow>
            <SiteHeading id="teachers-student-view-title" text="Tu alumno estudia en una app de verdad" />
            <SiteLead text="Así se ve la plataforma del otro lado: la misma que usan hoy los alumnos de la academia. Recórrela." />
          </div>
          <ul className="teachers-student-view__promises" aria-label="Lo que cuida por ti">
            {PROMISES.map((promise) => (
              <li key={promise} className="teachers-student-view__promise">
                <CheckIcon className="teachers-student-view__promise-icon" variant="classic-solid" />
                {promise}
              </li>
            ))}
          </ul>
        </div>
        <StudentApp />
      </div>
    </SiteSection>
  );
}
