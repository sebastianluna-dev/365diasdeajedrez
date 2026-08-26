import Link from "next/link";
import { FaqAccordionItem } from "./faq-accordion-item.comp";
import "./faq.section.css";

interface FaqSectionProps {
  eyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  ctaLabel: string;
  questions: { question: string; answer: string }[];
}

export function FaqSection({ eyebrow, sectionTitle, sectionDescription, ctaLabel, questions }: FaqSectionProps) {
  return (
    <section id="preguntas" className="section section_theme_dark faq">
      <div className="section__inner">
        <div className="faq__grid">
          <div>
            <span className="section__eyebrow">{eyebrow}</span>
            <h2 className="section__title">{sectionTitle}</h2>
            <p className="section__text">{sectionDescription}</p>
            <Link
              href="https://wa.me/522291348338?text=Hola%2C+me+gustar%C3%ADa+recibir+informaci%C3%B3n+sobre+la+Academia+365+D%C3%ADas+de+Ajedrez.+Quisiera+conocer+m%C3%A1s+sobre+las+clases+y+los+planes.+%C2%A1Gracias%21"
              className="button button_variant_primary faq__cta"
              target="_blank"
            >
              {ctaLabel}
            </Link>
          </div>
          <div className="faq__list">
            {questions.map((faq) => (
              <FaqAccordionItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
