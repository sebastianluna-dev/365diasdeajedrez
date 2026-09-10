import type { ReactNode } from "react";
import "./site-message.section.css";

interface SiteMessageProps {
  /** Small label above the title: "Error 404", "Algo salió mal". */
  eyebrow: string;
  title: string;
  description: string;
  /** Links or buttons; the `site-message__action` style paints them alike. */
  children?: ReactNode;
}

/**
 * Notice screen of the public site (404, error). No hooks or data, so both
 * `not-found.tsx` (server) and `error.tsx` (client) can use it with the same
 * palette as the rest of the site.
 */
export function SiteMessage({ eyebrow, title, description, children }: SiteMessageProps) {
  return (
    <section className="site-message">
      <div className="site-message__inner">
        <span className="site-message__eyebrow">{eyebrow}</span>
        <h1 className="site-message__title">{title}</h1>
        <p className="site-message__text">{description}</p>
        {children && <div className="site-message__actions">{children}</div>}
      </div>
    </section>
  );
}
