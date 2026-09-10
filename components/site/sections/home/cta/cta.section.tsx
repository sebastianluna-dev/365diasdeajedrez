import Link from "next/link";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { getCtaData } from "@/services/home/home.service";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import { CtaClock } from "./cta-clock.comp";
import "./cta.section.css";

export async function CtaSection() {
  const [content, { whatsappNumber, whatsappDefaultMessage }] = await Promise.all([
    getCtaData(),
    getSiteSettingsData(),
  ]);
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappDefaultMessage);

  return (
    <section className="sticky-cta">
      <div className="sticky-cta__inner">
        <CtaClock />
        <div className="sticky-cta__copy">
          <p className="sticky-cta__title">{content.title}</p>
          <p className="sticky-cta__subtitle">{content.subtitle}</p>
        </div>
        <div className="sticky-cta__actions">
          <Link className="sticky-cta__link sticky-cta__link_variant_primary" href={whatsappUrl} target="_blank">
            <WhatsappIcon className="sticky-cta__link-icon" />
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
