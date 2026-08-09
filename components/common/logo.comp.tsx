import Link from "next/link";
import "./logo.comp.css";

interface LogoProps {
  theme?: "light" | "dark";
  accent?: "orange" | "red";
}

export function Logo({ theme = "dark", accent = "orange" }: LogoProps) {
  return (
    <Link href="/" className={`logo logo_theme_${theme} logo_accent_${accent}`}>
      <span className="logo__accent">365</span>
      <span className="logo__label">DiasDeAjedrez</span>
      <span className="logo__marks">
        <span className="logo__mark" />
        <span className="logo__mark logo__mark_hidden" />
        <span className="logo__mark logo__mark_hidden" />
        <span className="logo__mark" />
      </span>
    </Link>
  );
}
