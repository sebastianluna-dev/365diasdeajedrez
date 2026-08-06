import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Logo } from "./logo.comp";
import "./site-header.comp.css";

const toolsLinks = [{ href: "/reloj-de-ajedrez", label: "Reloj de ajedrez" }];

export function SiteHeader() {
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
        </div>
        <div className="site-header-nav__spacer" />
      </div>
    </div>
  );
}
