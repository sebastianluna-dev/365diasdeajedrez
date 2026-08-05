import Link from "next/link";
import { SiteFooter } from "../../../layout/site-footer.comp";
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
            <Link className="sticky-cta__link" href="https://wa.me/520000000000">WhatsApp</Link>
            <Link className="sticky-cta__link" href="mailto:contacto@365diasdeajedrez.com">Email</Link>
            <Link href="/#planes" className="sticky-cta__link sticky-cta__link_variant_primary">
              Únete a la academia
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
