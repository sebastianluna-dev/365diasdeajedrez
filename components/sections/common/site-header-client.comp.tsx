"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/common/logo.comp";
import { HeaderDropdown } from "./header-dropdown.comp";
import "./site-header-client.comp.css";

type NavItem =
  | { blockType: "navLink"; label: string; href: string }
  | { blockType: "navDropdown"; label: string; links: { label: string; href: string }[] };

interface SiteHeaderClientProps {
  navItems: NavItem[];
  ctaLabel: string;
}

export function SiteHeaderClient({ navItems, ctaLabel }: SiteHeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileLinks = navItems.flatMap((item) => (item.blockType === "navLink" ? [item] : item.links));

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
            {ctaLabel}
            <ChevronRight size={16} />
          </Link>

          <button
            type="button"
            className="site-header__toggle"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`site-header-mobile${mobileOpen ? " site-header-mobile_open" : ""}`}>
          <div className="site-header-mobile__links">
            {mobileLinks.map((link, index) => (
              <Link key={`${link.href}-${index}`} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/#planes"
            className="site-header__button site-header-mobile__button"
            onClick={() => setMobileOpen(false)}
          >
            {ctaLabel}
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
