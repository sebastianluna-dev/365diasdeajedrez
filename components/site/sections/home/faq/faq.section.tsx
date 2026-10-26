import { CircleQuestionIcon } from "@/components/icons/circle-question-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { getFaqData } from "@/services/home/home.service";
import { FaqAccordion } from "./faq-accordion.comp";
import "./faq.section.css";

/**
 * The questions most asked (`AcadFaqA`, `#preguntas`). The questions and
 * their answers are the CMS's (`home-faq`), as before; the heading, the lead
 * and the «¿No está tu pregunta?» card with its WhatsApp button are the
 * home's copy, since the new heading carries its words in blue. The answers
 * are the owner's to keep true (a class is joined with its link today; the
 * classroom inside the platform is «Próximamente»).
 */
export async function FaqSection() {
  const { faq, closing } = academyHome;
  const { questions } = await getFaqData();
  if (questions.length === 0) return null;

  return (
    <SiteSection id="preguntas" labelledBy="preguntas-titulo">
      <div className="home-faq">
        <div className="home-faq__aside">
          <SiteEyebrow>
            <CircleQuestionIcon />
            {faq.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="preguntas-titulo" text={faq.heading.text} emphasis={faq.heading.emphasis} />
          {faq.lead && <SiteLead text={faq.lead} />}
          <div className="home-faq__help">
            <b className="home-faq__help-title">{faq.help.title}</b>
            <p className="home-faq__help-text">{faq.help.text}</p>
            <SiteWhatsappButton label={faq.help.button} message={closing.info.message} color="filled" />
          </div>
        </div>
        <FaqAccordion questions={questions} />
      </div>
    </SiteSection>
  );
}
