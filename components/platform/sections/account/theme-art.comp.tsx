import "./theme-art.comp.css";

/** Which theme a card of «Apariencia» shows: one of the two, or the machine's, which goes between them. */
export type ThemeArtScheme = "system" | "light" | "dark";

interface ThemeArtProps {
  scheme: ThemeArtScheme;
}

/** The platform in miniature, in one theme: the canvas, the side links and the panel with its lines. */
function Miniature({ tone }: { tone: "light" | "dark" }) {
  return (
    <g className={`theme-art__scheme theme-art__scheme_tone_${tone}`}>
      <rect className="theme-art__canvas" width="120" height="72" />
      <rect className="theme-art__panel" x="30" y="12" width="84" height="54" rx="6" />
      <rect className="theme-art__nav" x="6" y="14" width="18" height="6" rx="3" />
      <rect className="theme-art__line" x="6" y="26" width="16" height="3" rx="1.5" />
      <rect className="theme-art__line" x="6" y="33" width="16" height="3" rx="1.5" />
      <rect className="theme-art__ink" x="38" y="20" width="40" height="5" rx="2.5" />
      <rect className="theme-art__line" x="38" y="32" width="68" height="3" rx="1.5" />
      <rect className="theme-art__line" x="38" y="40" width="56" height="3" rx="1.5" />
    </g>
  );
}

/**
 * The picture on each card of «Apariencia» (2026-10-25, the owner's «Ajustes
 * A · Todo a la vista»): the platform in miniature, light or dark whichever
 * theme is on screen, and for «El del sistema» the light one fading into the
 * dark one and back, as the machine does at night. An illustration, not an
 * icon: drawn here by hand in colours of its own (the preview tokens of platform.css)
 * and hidden from screen readers, since the card's words say the same. Under
 * `prefers-reduced-motion` the machine's stops, half of each.
 */
export function ThemeArt({ scheme }: ThemeArtProps) {
  return (
    <svg
      className={`theme-art${scheme === "system" ? " theme-art_scheme_system" : ""}`}
      width="100%"
      height="72"
      viewBox="0 0 120 72"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {scheme !== "dark" && <Miniature tone="light" />}
      {scheme !== "light" && <Miniature tone="dark" />}
    </svg>
  );
}
