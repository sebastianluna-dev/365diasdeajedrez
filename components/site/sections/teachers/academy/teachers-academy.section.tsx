import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { BooksIcon } from "@/components/icons/books-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { mdButton } from "@/lib/material/material-classes";
import "./teachers-academy.section.css";

const SHELF = [
  { icon: GraduationCapIcon, text: "Los cursos de la academia, lección por lección" },
  { icon: BooksIcon, text: "La biblioteca de ejercicios" },
  { icon: ListOlIcon, text: "Las series de la academia" },
] as const;

/**
 * «Profesores · Academia A»: the platform is made and used by the academy.
 * The design's figures, quote and team photos are placeholders («[N]»,
 * «[Foto]») with no real values yet, so they stay out until the CMS has them
 * (the owner's rule: no invented stats).
 */
export function TeachersAcademySection() {
  return (
    <SiteSection id="academia" labelledBy="teachers-academy-title">
      <div className="teachers-academy">
        <div className="teachers-academy__copy">
          <SiteEyebrow>
            <GraduationCapIcon variant="classic-solid" />
            Hecha por una academia
          </SiteEyebrow>
          <SiteHeading
            id="teachers-academy-title"
            text="La usa 365 días de ajedrez"
            emphasis="con su equipo de maestros"
          />
          <SiteLead text="La academia da aquí sus clases a sus propios alumnos, así que cada pieza está pensada para una clase de ajedrez de verdad." />
          <Link className={mdButton("outlined", "sm")} href="/">
            Conoce la academia
            <ArrowRightIcon className="site-md-icon" variant="classic-solid" />
          </Link>
        </div>
        <section className="teachers-academy__shelf" aria-labelledby="teachers-academy-shelf-title">
          <h3 className="teachers-academy__shelf-title" id="teachers-academy-shelf-title">
            De la academia, para todos
          </h3>
          <ul className="teachers-academy__shelf-list">
            {SHELF.map(({ icon: Icon, text }) => (
              <li key={text} className="teachers-academy__shelf-item">
                <span className="teachers-academy__shelf-icon-wrap">
                  <Icon className="teachers-academy__shelf-icon" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <p className="teachers-academy__shelf-note">
            Los ve todo el que tiene acceso a la plataforma, también tus alumnos.
          </p>
        </section>
      </div>
    </SiteSection>
  );
}
