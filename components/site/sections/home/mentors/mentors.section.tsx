import { getMentorsData } from "@/services/mentors/mentors.service";
import { MentorList } from "./mentor-list.comp";
import "./mentors.section.css";

export async function MentorsSection() {
  const content = await getMentorsData();

  return (
    <section id="mentores" className="section section_theme_dark mentors">
      <div className="section__inner">
        <div className="section__head mentors__head">
          <div>
            <span className="section__eyebrow">{content.eyebrow}</span>
            <h2 className="section__title">{content.sectionTitle}</h2>
            <p className="section__text">{content.sectionDescription}</p>
          </div>
        </div>

        <MentorList mentors={content.mentors} />
      </div>
    </section>
  );
}
