import Link from "next/link";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import "./site-logo.comp.css";

interface SiteLogoProps {
  /** `md` (the default) in the header, `sm` in the footer. */
  size?: "md" | "sm";
}

/**
 * The wordmark of the site's new look, a link to the home page: the "365" in
 * the primary's blue and the word and the two closing squares in ink. It is
 * the shared inline SVG (`LogoWordmarkIcon`), coloured here; the old pages'
 * `Logo` keeps its orange and its red.
 */
export function SiteLogo({ size = "md" }: SiteLogoProps) {
  return (
    <Link href="/" className={`site-logo site-logo_size_${size}`} aria-label={`${LOGO_LABEL}, inicio`}>
      <LogoWordmarkIcon
        className="site-logo__image"
        accentClassName="site-logo__accent"
        wordClassName="site-logo__word"
        marksClassName="site-logo__marks"
      />
    </Link>
  );
}
