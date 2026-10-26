import Link from "next/link";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { EnvelopeIcon } from "@/components/icons/envelope-icon.comp";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { siteConfig } from "@/config/site.config";
import { getSiteSettingsData, getWhatsappHref } from "@/services/site-settings/site-settings.service";
import type { SiteFooterColumn, SiteFooterCrossLink, SiteNavLink } from "@/types/site-config.types";
import "./site-footer.section.css";

interface SiteFooterProps {
  /**
   * A flat list of links, for a page whose footer is one column («Enlaces»);
   * when it is given it replaces `columns`. Kept from the footer's first
   * version, whose only prop it was.
   */
  links?: SiteNavLink[];
  /** The columns of links; the academy's (config/site.config.ts → `shell.footerColumns`) when left out. */
  columns?: SiteFooterColumn[];
  /** The band to the other landing; the academy's «¿Eres maestro?» when left out, none with `null`. */
  crossLink?: SiteFooterCrossLink | null;
}

/**
 * The footer of every page of the site's new look (the owner's «Cierre y pie
 * B», 2026-10-26): a white sheet with rounded top corners, the wordmark drawn
 * large in blue, the columns of links and the contact column, the band that
 * sends a teacher to «Plataforma Ajedrez 365», and the copyright. The
 * WhatsApp number and the message its link opens with are the CMS's
 * (`site-settings`). There is no «Aviso de privacidad»: that page does not
 * exist yet.
 */
export async function SiteFooter({
  links,
  columns = siteConfig.shell.footerColumns,
  crossLink = siteConfig.shell.footerCrossLink,
}: SiteFooterProps) {
  const [{ whatsappNumber }, whatsappHref] = await Promise.all([getSiteSettingsData(), getWhatsappHref()]);
  const { contactEmail } = siteConfig.shell;
  const shown = links ? [{ title: "Enlaces", links }] : columns;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link href="/" className="site-footer__brand" aria-label={`${LOGO_LABEL}, inicio`}>
          <LogoWordmarkIcon
            className="site-footer__wordmark"
            accentClassName="site-footer__wordmark-accent"
            wordClassName="site-footer__wordmark-word"
            marksClassName="site-footer__wordmark-marks"
          />
        </Link>

        <div className="site-footer__grid">
          {shown.map((column) => (
            <nav key={column.title} className="site-footer__column" aria-label={column.title}>
              <h2 className="site-footer__heading">{column.title}</h2>
              <ul className="site-footer__links">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="site-footer__column">
            <h2 className="site-footer__heading">Contacto</h2>
            <ul className="site-footer__links">
              <li>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="site-footer__link">
                  <WhatsappIcon className="site-footer__icon" />
                  WhatsApp +{whatsappNumber}
                  <span className="site-sr-only"> (abre WhatsApp en una pestaña nueva)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="site-footer__link">
                  <EnvelopeIcon className="site-footer__icon" />
                  {contactEmail}
                </a>
              </li>
              <li className="site-footer__language">Clases en línea · Español</li>
            </ul>
          </div>
        </div>

        {crossLink && (
          <p className="site-footer__cross">
            <span className="site-footer__cross-icon">
              <ChalkboardUserIcon />
            </span>
            <span className="site-footer__cross-question">{crossLink.question}</span>
            <Link href={crossLink.href} className="site-footer__cross-link">
              {crossLink.label}
              <ChevronRightIcon variant="classic-solid" className="site-footer__cross-chevron" />
            </Link>
            <span className="site-footer__cross-note">{crossLink.note}</span>
          </p>
        )}

        <div className="site-footer__legal">© {new Date().getFullYear()} 365 días de ajedrez</div>
      </div>
    </footer>
  );
}
