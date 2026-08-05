import Link from "next/link";
import { Footer } from "@/components/sections/common/footer.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { EmailIcon } from "@/components/icons/email-icon.comp";
import "./sticky-cta-and-footer.comp.css";

export function StickyCtaAndFooter() {
  return (
    <>
      <div className="sticky-cta">
        <div className="sticky-cta__inner">
          <div className="sticky-cta__clock">
            <span>⏰</span>
            <span>900s</span>
          </div>
          <div>
            <p className="sticky-cta__title">Se acaba el tiempo.</p>
            <p className="sticky-cta__subtitle">No te quedes sin tu lugar en la academia.</p>
          </div>
          <div className="sticky-cta__actions">
            <Link className="sticky-cta__link" href="https://w.app/365diasdeajedrez">
              <WhatsappIcon />
              WhatsApp
            </Link>
            <Link className="sticky-cta__link" href="mailto:contacto@365diasdeajedrez.com">
              <EmailIcon />
              Email
            </Link>
            <Link href="/#planes" className="sticky-cta__link sticky-cta__link_variant_primary">
              Únete a la academia
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
