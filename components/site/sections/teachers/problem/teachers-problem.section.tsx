import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { ShuffleIcon } from "@/components/icons/shuffle-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { MATE_IN_ONE } from "../hero/mate-in-one.const";
import "./teachers-problem.section.css";

const QUESTIONS = [
  {
    question: "¿Quién resolvió los ejercicios que dejé?",
    answer: "«2 de 3 lo resolvieron»",
    detail: "Cada intento de cada alumno, con la primera jugada equivocada sobre el tablero.",
    today: true,
  },
  {
    question: "¿Dónde quedó la partida que vimos en clase?",
    answer: "En el cuaderno de la clase",
    detail: "Con su tablero y tus comentarios; tu alumno la guarda en sus estudios.",
    today: true,
  },
  {
    question: "¿Qué tiene que preparar para el martes?",
    answer: "«Para preparar», en su inicio",
    detail: "Lo que agregas antes de la clase lo ve en cuanto lo guardas; tu guion, sólo tú.",
    today: true,
  },
  {
    question: "¿Cuántas clases le quedan?",
    answer: "En su ficha: tomadas, programadas y por programar",
    detail:
      "Tú llevas el control de lo que te pagó; tu alumno ve sus clases, nunca importes. Sin cobros en la plataforma.",
    today: false,
  },
] as const;

/** «Profesores · El problema C»: the scattered fragments of three apps, and the four questions the platform answers. */
export function TeachersProblemSection() {
  return (
    <SiteSection id="problema" labelledBy="teachers-problem-title">
      <div className="teachers-problem">
        <div className="teachers-problem__intro">
          <SiteEyebrow>
            <ShuffleIcon variant="classic-solid" />
            El problema
          </SiteEyebrow>
          <SiteHeading id="teachers-problem-title" text="Cada alumno vive en" emphasis="tres apps" />
          <SiteLead text="WhatsApp para avisar, una hoja de cálculo para las clases y los pagos, Lichess para el tablero. Cada una guarda un pedazo; ninguna sabe lo que pasó en las otras." />

          <div className="teachers-problem__fragments" aria-hidden="true">
            <div className="teachers-problem__fragment teachers-problem__fragment_place_chat">
              <span className="teachers-problem__fragment-label">WhatsApp · 21:40</span>
              <span className="teachers-problem__bubble teachers-problem__bubble_side_mine">
                ¿Ya resolviste los ejercicios?
              </span>
              <span className="teachers-problem__bubble">creo que sí jaja</span>
            </div>
            <div className="teachers-problem__fragment teachers-problem__fragment_place_sheet">
              <span className="teachers-problem__fragment-label">Hoja de cálculo · fila 14</span>
              <span className="teachers-problem__sheet">
                <span className="teachers-problem__cell">Sofía R.</span>
                <span className="teachers-problem__cell teachers-problem__cell_tone_doubt">¿pagó?</span>
                <span className="teachers-problem__cell">¿4 o 5?</span>
              </span>
            </div>
            <div className="teachers-problem__fragment teachers-problem__fragment_place_study">
              <div className="teachers-problem__mini-board">
                <SiteBoard fen={MATE_IN_ONE.fen} label="Un estudio de Lichess: el mate del pasillo" />
              </div>
              <span>
                <span className="teachers-problem__fragment-label">Lichess · estudio</span>
                <span className="teachers-problem__fragment-text">
                  El enlace lo mandaste el martes. ¿Lo abrió alguien?
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="teachers-problem__answers">
          <h3 className="teachers-problem__answers-title">
            Lo que hoy no puedes contestar, y dónde lo contesta la plataforma
          </h3>
          <ul className="teachers-problem__list">
            {QUESTIONS.map((item) => (
              <li key={item.question} className="teachers-problem__row">
                <p className="teachers-problem__question">{item.question}</p>
                <span className="teachers-problem__arrow" aria-hidden="true">
                  <ChevronRightIcon className="teachers-problem__arrow-icon" variant="classic-solid" />
                </span>
                <div className="teachers-problem__answer">
                  <strong>{item.answer}</strong>
                  <span className="teachers-problem__detail">{item.detail}</span>
                  {item.today ? (
                    <span className="teachers-problem__tag teachers-problem__tag_state_today">
                      <CheckIcon className="teachers-problem__tag-icon" variant="classic-solid" />
                      Hoy
                    </span>
                  ) : (
                    <span className="teachers-problem__tag teachers-problem__tag_state_soon">
                      <ClockIcon className="teachers-problem__tag-icon" variant="classic-solid" />
                      Próximamente
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteSection>
  );
}
