import type { ComponentType } from "react";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { CircleQuestionIcon } from "@/components/icons/circle-question-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { HouseIcon } from "@/components/icons/house-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { mdButton } from "@/lib/material/material-classes";
import { TEACHERS_FAQ, type TeachersFaqIcon } from "./teachers-faq.const";
import "./teachers-faq.section.css";

const ICONS: Record<TeachersFaqIcon, ComponentType<IconProps>> = {
  house: HouseIcon,
  play: CirclePlayIcon,
  tag: TagIcon,
  clock: ClockIcon,
  users: UsersIcon,
  board: ChessBoardIcon,
  cap: GraduationCapIcon,
  eye: EyeIcon,
  calendar: CalendarIcon,
};

/** The question the design opens first: the one about classes inside the platform. */
const OPEN_AT_START = 1;

const QUESTION_MESSAGE = "Hola, soy profesor de ajedrez y tengo una pregunta sobre Plataforma Ajedrez 365:";

interface TeachersFaqSectionProps {
  whatsappNumber: string;
}

/**
 * «Profesores · Preguntas A». An accordion of native `<details>` sharing one
 * `name`, so opening a question closes the other and it all works without
 * JavaScript, as a Server Component.
 */
export function TeachersFaqSection({ whatsappNumber }: TeachersFaqSectionProps) {
  return (
    <SiteSection id="preguntas" labelledBy="teachers-faq-title">
      <div className="teachers-faq">
        <div className="teachers-faq__copy">
          <SiteEyebrow>
            <CircleQuestionIcon variant="classic-solid" />
            Preguntas frecuentes
          </SiteEyebrow>
          <SiteHeading id="teachers-faq-title" text="Lo que nos preguntan los profesores" />
          <SiteLead text="Respuestas cortas y sin promesas: lo que todavía no existe dice «próximamente»." />
          <div className="teachers-faq__help">
            <strong className="teachers-faq__help-title">¿Otra pregunta?</strong>
            <p className="teachers-faq__help-text">Escríbenos por WhatsApp y te contesta alguien del equipo.</p>
            <a
              className={mdButton("tonal", "sm")}
              href={buildWhatsappUrl(whatsappNumber, QUESTION_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon className="site-md-icon" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
        <div className="teachers-faq__list">
          {TEACHERS_FAQ.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
              <details
                key={item.question}
                className="teachers-faq__item"
                name="teachers-faq"
                open={index === OPEN_AT_START}
              >
                <summary className="teachers-faq__question">
                  <span className="teachers-faq__question-icon-wrap">
                    <Icon className="teachers-faq__question-icon" />
                  </span>
                  <span className="teachers-faq__question-text">{item.question}</span>
                  <ChevronRightIcon className="teachers-faq__chevron" variant="classic-solid" />
                </summary>
                <p className="teachers-faq__answer">{item.answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </SiteSection>
  );
}
