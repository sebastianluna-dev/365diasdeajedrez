import Link from "next/link";
import { Logo } from "@/components/sections/common/logo.comp";
import "./masthead.comp.css";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/", label: "Herramientas" },
  { href: "/", label: "Nosotros" },
];

export function Masthead() {
  return (
    <header className="masthead">
      <Logo theme="light" accent="red" />

      <div className="masthead__center">
        <div className="masthead__title">El Tablero</div>
        <div className="masthead__subtitle">
          <span className="masthead__subtitle-line" />
          <span>Cuaderno de la academia · Agosto 2026</span>
          <span className="masthead__subtitle-line" />
        </div>
      </div>

      <div className="masthead__right">
        <div className="masthead__edition">Edición nº 14</div>
        <nav className="masthead__nav">
          {navLinks.map((link, index) => (
            <Link key={index} href={link.href} className="masthead__nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/#planes" className="blog-button blog-button_variant_primary">
          Primera clase gratis
        </Link>
      </div>
    </header>
  );
}
