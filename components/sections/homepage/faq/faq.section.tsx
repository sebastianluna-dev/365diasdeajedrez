import Link from "next/link";
import { faqs } from "@/data/faqs.data";
import { FaqAccordionItem } from "./faq-accordion-item.comp";
import "./faq.section.css";

export function FaqSection() {
  return (
    <section id="preguntas" className="section section_theme_dark faq">
      <div className="section__inner">
        <div className="faq__grid">
          <div>
            <span className="section__eyebrow">Preguntas frecuentes</span>
            <h2 className="section__title">Todo lo que necesitas saber antes de empezar.</h2>
            <p className="section__text">Si te queda alguna duda, escríbenos y la resolvemos contigo.</p>
            <Link
              href="https://wa.me/522291348338?text=Hola%2C+me+gustar%C3%ADa+recibir+informaci%C3%B3n+sobre+la+Academia+365+D%C3%ADas+de+Ajedrez.+Quisiera+conocer+m%C3%A1s+sobre+las+clases+y+los+planes.+%C2%A1Gracias%21"
              className="button button_variant_primary faq__cta"
              target="_blank"
            >
              Hablar con nosotros
            </Link>
          </div>
          <div className="faq__list">
            {faqs.map((faq) => (
              <FaqAccordionItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
