import type { ReactNode } from "react";
import "./site-eyebrow.comp.css";

interface SiteEyebrowProps {
  /** Centred over a centred heading, or at the start of the line (the default). */
  align?: "start" | "center";
  /** Its icon (an icon of `components/icons/`, 16 px) and its words. */
  children: ReactNode;
}

/**
 * The small pill over a section's heading that says what the section is
 * about («Clases en vivo», «Cursos»), in the secondary container's pale blue.
 * It only places what it is given: an icon, if any, and the words.
 */
export function SiteEyebrow({ align = "start", children }: SiteEyebrowProps) {
  return <span className={`site-eyebrow site-eyebrow_align_${align}`}>{children}</span>;
}
