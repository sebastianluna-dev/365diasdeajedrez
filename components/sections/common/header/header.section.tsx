import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/common/logo.comp";
import { getHeaderData } from "@/services/home/home.service";
import { HeaderDropdown } from "./header-dropdown.comp";
import { HeaderMobileMenu } from "./header-mobile-menu.comp";
import "./header.section.css";

export async function Header() {
  const content = await getHeaderData();

  return (
    <div className="site-header-nav">
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            <Logo theme="dark" accent="orange" />

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
          <Link href="/#planes" className="site-header__button">
            {content.ctaLabel}
            <ChevronRight size={16} />
          </Link>

          <HeaderMobileMenu navItems={content.navItems} ctaLabel={content.ctaLabel} />
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
