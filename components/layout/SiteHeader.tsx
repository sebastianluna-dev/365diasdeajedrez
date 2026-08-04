import Link from "next/link";
import { ChevronRight } from "lucide-react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#programa", label: "Programa" },
  { href: "/#mentores", label: "Mentores" },
  { href: "/#planes", label: "Planes" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <>
      <nav className="navShell">
        <Link href="/" className="brand">
          <span className="brandAccent">365</span>
          <span>DiasDeAjedrez</span>
        </Link>

        <div className="navLinks">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <Link href="/#planes" className="headerButton">
        Agenda tu clase
        <ChevronRight size={16} />
      </Link>
    </>
  );
}
