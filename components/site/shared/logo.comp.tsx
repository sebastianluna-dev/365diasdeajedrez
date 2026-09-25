import Link from "next/link";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import "./logo.comp.css";

interface LogoProps {
  theme?: "light" | "dark";
  accent?: "orange" | "red";
}

// The wordmark is the shared inline SVG (`components/icons/logo-wordmark-icon.comp.tsx`)
// so the stylesheet can recolour it: the word and the marks take the block's
// `color` through `fill: currentColor` and the "365" takes the accent
// modifier's colour.
export function Logo({ theme = "dark", accent = "orange" }: LogoProps) {
  return (
    <Link href="/" className={`logo logo_theme_${theme} logo_accent_${accent}`} aria-label={LOGO_LABEL}>
      <LogoWordmarkIcon
        className="logo__image"
        accentClassName="logo__accent"
        wordClassName="logo__word"
        marksClassName="logo__marks"
      />
    </Link>
  );
}
