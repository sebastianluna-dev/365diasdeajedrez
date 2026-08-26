import { getProgramData } from "@/services/home/home.service";
import { ProgramInteractive } from "./program-interactive.comp";
import "./program.section.css";

export async function ProgramSection() {
  const content = await getProgramData();

  return (
    <section id="programa" className="section section_theme_light program">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <h2 className="section__title program__title">{content.sectionTitle}</h2>
            <p className="section__text">{content.sectionDescription}</p>
          </div>
        </div>

        <ProgramInteractive modules={content.modules} />

        {content.note && <p className="program__note">{content.note}</p>}
      </div>
    </section>
  );
}
