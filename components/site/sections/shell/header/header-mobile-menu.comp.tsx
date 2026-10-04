"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import { MenuIcon } from "@/components/icons/menu-icon.comp";
import type { HeaderNavItem } from "@/services/home/home.types";

interface HeaderMobileMenuProps {
  navItems: HeaderNavItem[];
  /** Same button as on desktop: header.section.tsx decides it, not the CMS. */
  ctaLabel: string;
  ctaHref: string;
}

export function HeaderMobileMenu({ navItems, ctaLabel, ctaHref }: HeaderMobileMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileLinks = navItems.flatMap((item) => (item.type === "link" ? [item] : item.links));

  return (
    <>
      <button
        type="button"
        className="site-header__toggle"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((current) => !current)}
      >
        {mobileOpen ? (
          <CloseIcon className="site-header__toggle-icon" />
        ) : (
          <MenuIcon className="site-header__toggle-icon" />
        )}
      </button>

      <div className={`site-header-mobile${mobileOpen ? " site-header-mobile_open" : ""}`}>
        <div className="site-header-mobile__links">
          {mobileLinks.map((link, index) => (
            <Link key={`${link.href}-${index}`} href={link.href} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href={ctaHref}
          className="site-header__button site-header-mobile__button"
          onClick={() => setMobileOpen(false)}
        >
          {ctaLabel}
          <ArrowRightIcon className="site-header__button-icon" />
        </Link>
      </div>
    </>
  );
}
