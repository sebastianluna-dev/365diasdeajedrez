import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { CourseShowcase } from "./course-showcase.comp";
import "./courses.section.css";

/**
 * The academy's four courses (`AcadCursos3`, `#cursos`): the heading, «Pregunta
 * por los cursos» on WhatsApp, and the cards with the inside of the chosen one
 * (`CourseShowcase`, the client leaf). The courses are the platform's, copied
 * as static data: the site never reads the platform's database.
 */
export function CoursesSection() {
  const { courses } = academyHome;

  return (
    <SiteSection id="cursos" labelledBy="cursos-titulo">
      <div className="home-courses">
        <div className="home-courses__head">
          <div className="home-courses__copy">
            <SiteEyebrow>
              <BookOpenIcon />
              {courses.eyebrow}
            </SiteEyebrow>
            <SiteHeading id="cursos-titulo" text={courses.heading.text} emphasis={courses.heading.emphasis} />
          </div>
          <div className="home-courses__aside">
            {courses.lead && <SiteLead text={courses.lead} />}
            <SiteWhatsappButton
              label={courses.ask.label}
              message={courses.ask.message}
              color="filled"
              size="md"
              className="home-courses__ask"
            />
          </div>
        </div>
        <CourseShowcase courses={courses.courses} inside={courses.inside} />
      </div>
    </SiteSection>
  );
}
