import { mentors } from "@/data/mentors.data";
import { MentorList } from "./mentor-list.comp";
import "./mentors.section.css";

export function MentorsSection() {
  return (
    <section id="mentores" className="section section_theme_dark mentors">
      <div className="section__inner">
        <div className="section__head mentors__head">
          <div>
            <span className="section__eyebrow">Nuestros mentores</span>
            <h2 className="section__title">
              Más que profesores, mentores de tu aprendizaje.
            </h2>
            <p className="section__text">
              Creemos que enseñar ajedrez es formar la manera de pensar de un
              jugador. Nuestros instructores te acompañarán paso a paso para
              desarrollar criterio, disciplina y confianza sobre el tablero.
            </p>
          </div>
        </div>

        <MentorList mentors={mentors} />
      </div>
    </section>
  );
}
