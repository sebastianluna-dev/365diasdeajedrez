import Link from "next/link";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { getFaqData } from "@/services/home/home.service";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import { FaqAccordionItem } from "./faq-accordion-item.comp";
import "./faq.section.css";

export async function FaqSection() {
  const [content, { whatsappNumber, whatsappDefaultMessage }] = await Promise.all([
    getFaqData(),
    getSiteSettingsData(),
  ]);
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappDefaultMessage);

  return (
    <section id="preguntas" className="section section_theme_dark faq">
      <div className="section__inner">
        <div className="faq__grid">
          <div>
            <span className="section__eyebrow">{content.eyebrow}</span>
            <h2 className="section__title">{content.sectionTitle}</h2>
            <p className="section__text">{content.sectionDescription}</p>
            <Link href={whatsappUrl} className="button button_variant_primary faq__cta" target="_blank">
              {content.ctaLabel}
            </Link>
          </div>
          <div className="faq__list">
            {content.questions.map((faq) => (
              <FaqAccordionItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
