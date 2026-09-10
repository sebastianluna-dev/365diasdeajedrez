import type { ReactNode } from "react";
import "./site-message.section.css";

interface SiteMessageProps {
  /** Rótulo pequeño encima del título: «Error 404», «Algo salió mal». */
  eyebrow: string;
  title: string;
  description: string;
  /** Enlaces o botones; el estilo `site-message__action` los pinta iguales. */
  children?: ReactNode;
}

/**
 * Pantalla de aviso del sitio público (404, error). Sin hooks ni datos, para
 * que la puedan usar tanto `not-found.tsx` (servidor) como `error.tsx`
 * (cliente) con la misma paleta que el resto del sitio.
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
