import Link from "next/link";
import { EnvelopeIcon } from "@/components/icons/envelope-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { SiteLogo } from "@/components/site/shared/site-logo/site-logo.comp";
import { siteConfig } from "@/config/site.config";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { getSiteSettingsData, getWhatsappHref } from "@/services/site-settings/site-settings.service";
import type { SiteNavLink } from "@/types/site-config.types";
import "./site-footer.section.css";

interface SiteFooterProps {
  /** The footer's links; the academy's (config/site.config.ts → `shell.footerNav`) when left out. */
  links?: SiteNavLink[];
}

/**
 * The footer of every page of the site's new look, one slim white band: the
 * wordmark, the site's links, the three ways in (WhatsApp, e-mail and the
 * platform's login) and, under them, the line of the academy's contact. The
 * WhatsApp number is the CMS's (`site-settings`), opened with its default
 * message.
 */
export async function SiteFooter({ links = siteConfig.shell.footerNav }: SiteFooterProps) {
  const [{ whatsappNumber }, whatsappHref] = await Promise.all([getSiteSettingsData(), getWhatsappHref()]);
  const { contactEmail } = siteConfig.shell;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <SiteLogo size="sm" />
          <nav aria-label="Pie de página">
            <ul className="site-footer__links">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="site-footer__ways" aria-label="Contacto y acceso">
            <li>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="site-footer__way">
                <WhatsappIcon className="site-footer__way-icon" />
                WhatsApp
                <span className="site-sr-only"> (abre WhatsApp en una pestaña nueva)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contactEmail}`} className="site-footer__way">
                <EnvelopeIcon className="site-footer__way-icon" />
                Correo
              </a>
            </li>
            <li>
              <Link href={LOGIN_PATH} className="site-footer__way">
                <UserIcon className="site-footer__way-icon" />
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>
        <div className="site-footer__legal">
          <span>© {new Date().getFullYear()} 365 días de ajedrez</span>
          <span>
            {contactEmail} · WhatsApp +{whatsappNumber}
          </span>
          <span className="site-footer__language">Clases en línea · Español</span>
        </div>
      </div>
    </footer>
  );
}
