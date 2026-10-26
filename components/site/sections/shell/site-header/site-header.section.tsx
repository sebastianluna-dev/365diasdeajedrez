import Link from "next/link";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { SiteLogo } from "@/components/site/shared/site-logo/site-logo.comp";
import { siteConfig } from "@/config/site.config";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { mdButton } from "@/lib/material/material-classes";
import { getWhatsappHref } from "@/services/site-settings/site-settings.service";
import type { SiteNavLink, SiteWhatsappAction } from "@/types/site-config.types";
import { SiteHeaderMenu } from "./site-header-menu.comp";
import "./site-header.section.css";

interface SiteHeaderProps {
  /** The bar's links; the academy's (config/site.config.ts → `shell.nav`) when left out. */
  links?: SiteNavLink[];
  /** The bar's main button, which opens WhatsApp; the academy's «Agenda tu clase» when left out. */
  cta?: SiteWhatsappAction;
}

// «Iniciar sesión» is fixed in code, as the old header's was: an editable label
// could end up promising something different from what the link does.
const LOGIN_LABEL = "Iniciar sesión";

/**
 * The header of every page of the site's new look: the blue wordmark, the
 * links to the home page's sections and to the blog, «Iniciar sesión» (the
 * entrance to the platform) and the main button, which opens WhatsApp to book
 * a class. Below 1024 px the links and the login go into a menu
 * (`SiteHeaderMenu`); below 640 px the main button goes there too.
 */
export async function SiteHeader({ links = siteConfig.shell.nav, cta = siteConfig.shell.headerCta }: SiteHeaderProps) {
  const ctaHref = await getWhatsappHref(cta.message);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <SiteLogo />
        <nav className="site-header__nav" aria-label="Principal">
          <ul className="site-header__links">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="site-header__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__actions">
          <Link href={LOGIN_PATH} className={`${mdButton("text", "sm")} site-header__login`}>
            {LOGIN_LABEL}
          </Link>
          <a href={ctaHref} target="_blank" rel="noreferrer" className={`${mdButton("filled", "sm")} site-header__cta`}>
            <CalendarIcon variant="classic-solid" className="site-md-icon" />
            {cta.label}
            <span className="site-sr-only"> (abre WhatsApp en una pestaña nueva)</span>
          </a>
          <SiteHeaderMenu
            links={links}
            loginLabel={LOGIN_LABEL}
            loginHref={LOGIN_PATH}
            cta={cta.label}
            ctaHref={ctaHref}
          />
        </div>
      </div>
    </header>
  );
}
