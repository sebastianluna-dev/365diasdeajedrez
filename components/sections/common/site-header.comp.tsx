import Link from "next/link";
import { ChevronRight } from "lucide-react";
import "./site-header.comp.css";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#programa", label: "Programa" },
  { href: "/#mentores", label: "Mentores" },
  { href: "/#planes", label: "Planes" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <div className="site-header-nav">
      <div className="site-header-nav__inner">
        <div className="site-header-bar">
          <nav className="site-header">
            <Link href="/" className="brand">
              <span className="brand__accent">365</span>
              <span>DiasDeAjedrez</span>
            </Link>

            <div className="site-header__links">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
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
