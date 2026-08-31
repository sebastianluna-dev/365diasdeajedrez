"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import type { HeaderNavItem } from "@/services/home/home.types";

interface HeaderMobileMenuProps {
  navItems: HeaderNavItem[];
  /** Mismo botón que en escritorio: lo decide header.section.tsx, no el CMS. */
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
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
          <ChevronRight size={16} />
        </Link>
      </div>
    </>
  );
}
