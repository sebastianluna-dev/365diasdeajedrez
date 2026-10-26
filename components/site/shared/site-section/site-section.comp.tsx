import type { ReactNode } from "react";
import "./site-section.comp.css";

interface SiteSectionProps {
  /** The anchor the header's links jump to (`/#cursos`). */
  id?: string;
  /** The id of the section's heading, which names it. */
  labelledBy: string;
  /** The canvas the page lies on (the default) or the white panel. */
  tone?: "canvas" | "panel";
  /** How far down the next section starts: `regular` (the default) or `tight`, for a band such as the figures. */
  spacing?: "regular" | "tight";
  children: ReactNode;
}

/**
 * A section of a page of the site's new look: the band from edge to edge in
 * its tone, and inside it the column every section shares — 1440 px at most,
 * with the canvas's gutter at each side (72 px on a desktop, 16 on a phone).
 * It only places what it is given; each section draws its own content.
 */
export function SiteSection({ id, labelledBy, tone = "canvas", spacing = "regular", children }: SiteSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`site-section site-section_tone_${tone} site-section_spacing_${spacing}`}
    >
      <div className="site-section__inner">{children}</div>
    </section>
  );
}
