import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/common/logo.comp";
import { getPayload } from "@/lib/payload/get-payload";
import { HeaderDropdown } from "./header-dropdown.comp";
import { HeaderMobileMenu } from "./header-mobile-menu.comp";
import "./header.section.css";

export type NavItem =
  | { blockType: "navLink"; label: string; href: string }
  | { blockType: "navDropdown"; label: string; links: { label: string; href: string }[] };

export async function Header() {
  const payload = await getPayload();
  const header = await payload.findGlobal({ slug: "home-header" });
  const navItems = (header.navItems ?? []) as NavItem[];

  return (
    <div className="site-header-nav">
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            <Logo theme="dark" accent="orange" />

            <div className="site-header__links">
              {navItems.map((item, index) =>
                item.blockType === "navLink" ? (
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
            {header.ctaLabel}
            <ChevronRight size={16} />
          </Link>

          <HeaderMobileMenu navItems={navItems} ctaLabel={header.ctaLabel} />
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
