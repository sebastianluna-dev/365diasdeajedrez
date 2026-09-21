import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { Logo } from "@/components/site/shared/logo.comp";
import { getHeaderData } from "@/services/home/home.service";
import { HeaderDropdown } from "./header-dropdown.comp";
import { HeaderMobileMenu } from "./header-mobile-menu.comp";
import "./header.section.css";

interface HeaderProps {
  theme?: "dark" | "light";
}

// The header's main button is the entrance to the platform, which is why its
// text and its target are fixed in code instead of coming from the CMS: an
// editable label could end up promising something different from what the
// link does. The `ctaLabel` field of the `home-header` global still exists
// (and services/home still maps it), but nobody reads it any more.
const LOGIN_CTA_LABEL = "Iniciar sesión";

export async function Header({ theme = "dark" }: HeaderProps) {
  const content = await getHeaderData();

  return (
    <div className={`site-header-nav site-header-nav_theme_${theme}`}>
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            {theme === "light" ? <Logo theme="light" accent="red" /> : <Logo theme="dark" accent="orange" />}

            <div className="site-header__links">
              {content.navItems.map((item, index) =>
                item.type === "link" ? (
                  <Link key={`${item.href}-${index}`} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <HeaderDropdown key={`${item.label}-${index}`} label={item.label} links={item.links} />
                ),
              )}
            </div>
          </nav>
          <Link href={LOGIN_PATH} className="site-header__button">
            {LOGIN_CTA_LABEL}
            <ChevronRight size={16} />
          </Link>

          <HeaderMobileMenu navItems={content.navItems} ctaLabel={LOGIN_CTA_LABEL} ctaHref={LOGIN_PATH} />
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
