import "./site-heading.comp.css";

interface SiteHeadingProps {
  /** The id a section's `aria-labelledby` points at. */
  id: string;
  /** The words in ink. */
  text: string;
  /** The words after them in the primary's blue («Tu clase, *dentro de tu plataforma*»). */
  emphasis?: string;
  /**
   * `section` (the default) for a section's title; `display`, bigger, for the
   * last call of a page; `hero` for a page's `h1`, whose blue words go on a
   * line of their own.
   */
  size?: "section" | "display" | "hero";
  /** Centred, under a centred eyebrow. */
  align?: "start" | "center";
}

/**
 * The title of a section of the site's new look, in Poppins: the words in
 * ink and, after them, the words in blue that carry the idea. A `hero` title
 * is the page's `h1`; every other one is an `h2`.
 */
export function SiteHeading({ id, text, emphasis, size = "section", align = "start" }: SiteHeadingProps) {
  const Tag = size === "hero" ? "h1" : "h2";

  return (
    <Tag id={id} className={`site-heading site-heading_size_${size} site-heading_align_${align}`}>
      {text}
      {emphasis && (
        <>
          {" "}
          <em className="site-heading__emphasis">{emphasis}</em>
        </>
      )}
    </Tag>
  );
}
