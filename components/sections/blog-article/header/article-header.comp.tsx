import Link from "next/link";
import { Logo } from "@/components/sections/common/logo.comp";
import "./article-header.comp.css";

interface ArticleHeaderProps {
  category: string;
  date: string;
}

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/", label: "Herramientas" },
  { href: "/", label: "Nosotros" },
];

export function ArticleHeader({ category, date }: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <div className="article-header__bar">
        <Logo theme="light" accent="red" />

        <div className="article-header__center">
          <Link href="/blog" className="article-header__title">
            El Tablero
          </Link>
          <div className="article-header__subtitle">
            <span className="article-header__subtitle-line" />
            <span>{category} · {date}</span>
            <span className="article-header__subtitle-line" />
          </div>
        </div>

        <div className="article-header__right">
          <nav className="article-header__nav">
            {navLinks.map((link, index) => (
              <Link key={index} href={link.href} className="article-header__nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/#planes" className="blog-button blog-button_variant_primary">
            Primera clase gratis
          </Link>
        </div>
      </div>
      <div className="article-header__divider" />
    </header>
  );
}
