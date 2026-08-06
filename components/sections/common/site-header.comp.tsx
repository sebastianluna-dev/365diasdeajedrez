"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./logo.comp";
import "./site-header.comp.css";

const toolsLinks = [{ href: "/reloj-de-ajedrez", label: "Reloj de ajedrez" }];

const mobileLinks = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/reloj-de-ajedrez", label: "Reloj de ajedrez" },
  { href: "/nosotros", label: "Nosotros" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="site-header-nav">
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            <Logo theme="dark" accent="orange" />

            <div className="site-header__links">
              <Link href="/">Inicio</Link>
              <Link href="/blog">Blog</Link>
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
              <Link href="/nosotros">Nosotros</Link>
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
