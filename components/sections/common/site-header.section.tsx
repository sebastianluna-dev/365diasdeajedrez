"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/common/logo.comp";
import "./site-header.section.css";

const toolsLinks = [{ href: "/reloj-de-ajedrez", label: "Reloj de ajedrez" }];

const homeSectionLinks = [
  { href: "/#maestro", label: "Maestro" },
  { href: "/#planes", label: "Paquetes" },
  { href: "/blog", label: "Blog" },
];

const mobileLinks = [...homeSectionLinks, ...toolsLinks];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="site-header-nav">
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            <Logo theme="dark" accent="orange" />

            <div className="site-header__links">
              {homeSectionLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <div className="site-header__dropdown">
                <button type="button" className="site-header__dropdown-trigger">
                  Herramientas
                  <ChevronDown size={14} />
                </button>
                <div className="site-header__dropdown-menu">
                  {toolsLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <Link href="/#planes" className="site-header__button">
            Agenda tu clase
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
            {mobileLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/#planes"
            className="site-header__button site-header-mobile__button"
            onClick={() => setMobileOpen(false)}
          >
            Agenda tu clase
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
