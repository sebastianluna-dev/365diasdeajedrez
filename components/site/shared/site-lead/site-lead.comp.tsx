import "./site-lead.comp.css";

interface SiteLeadProps {
  text: string;
  /** Centred, under a centred heading. */
  align?: "start" | "center";
}

/** The paragraph under a section's heading, a step bigger than the text and in its grey. */
export function SiteLead({ text, align = "start" }: SiteLeadProps) {
  return <p className={`site-lead site-lead_align_${align}`}>{text}</p>;
}
